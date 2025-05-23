
"use client";

import React, { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { userChannelSchema, type UserChannelFormData } from "@/lib/schemas";
import type { UserChannelOut, UserChannelCreate, UserOut, ChannelOut } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { getContactInputTypeForChannel, CONTACT_KEY_EMAIL, CONTACT_KEY_PHONE } from "@/lib/channelConfigs";

interface UserChannelFormProps {
  onSubmit: (data: UserChannelCreate) => void;
  defaultValues?: Partial<UserChannelOut>;
  isPending: boolean;
  users: UserOut[] | undefined;
  channels: ChannelOut[] | undefined;
  isLoadingUsers: boolean;
  isLoadingChannels: boolean;
  onClose: () => void;
}

export function UserChannelForm({
  onSubmit,
  defaultValues,
  isPending,
  users,
  channels,
  isLoadingUsers,
  isLoadingChannels,
  onClose
}: UserChannelFormProps) {
  const [contactInputType, setContactInputType] = useState<'email' | 'phone' | 'json'>('json');
  const prevSelectedChannelIdRef = useRef<number | undefined | null>(null);

  const form = useForm<UserChannelFormData>({
    resolver: zodResolver(userChannelSchema),
    defaultValues: {
      user_id: defaultValues?.user_id || undefined,
      channel_id: defaultValues?.channel_id || undefined,
      contact_details_input: "", // Will be populated by useEffect
      is_preferred: defaultValues?.is_preferred ?? false,
    },
  });

  const selectedChannelId = form.watch("channel_id");

  // Effect for initial setup based on defaultValues
  useEffect(() => {
    const initialChannelId = defaultValues?.channel_id ? Number(defaultValues.channel_id) : undefined;
    const initialChannel = channels?.find(c => c.id === initialChannelId);
    const determinedContactType = initialChannel ? getContactInputTypeForChannel(initialChannel.type) : 'json';
    
    let initialInputValue = "";
    const currentContactDetails = defaultValues?.contact_details;

    if (currentContactDetails) {
      if (determinedContactType === 'email' && typeof currentContactDetails[CONTACT_KEY_EMAIL] === 'string') {
        initialInputValue = currentContactDetails[CONTACT_KEY_EMAIL];
      } else if (determinedContactType === 'phone' && typeof currentContactDetails[CONTACT_KEY_PHONE] === 'string') {
        initialInputValue = currentContactDetails[CONTACT_KEY_PHONE];
      } else { // Fallback to raw JSON string for the input if specific keys aren't present or type is json
        initialInputValue = JSON.stringify(currentContactDetails, null, 2);
      }
    }
    
    form.reset({
      user_id: defaultValues?.user_id || undefined,
      channel_id: initialChannelId,
      contact_details_input: initialInputValue,
      is_preferred: defaultValues?.is_preferred ?? false,
    });
    setContactInputType(determinedContactType);
    prevSelectedChannelIdRef.current = initialChannelId;
  }, [defaultValues, channels, form]);


  // Effect for handling dynamic changes to selectedChannelId
  useEffect(() => {
    const currentChannelId = selectedChannelId ? Number(selectedChannelId) : undefined;

    // Only proceed if the channel ID has actually changed from its previous state
    // or if it's a new form (no defaultValues.id) and a channel is selected for the first time.
    if (currentChannelId === prevSelectedChannelIdRef.current && defaultValues?.id) {
      return;
    }
    if (!defaultValues?.id && prevSelectedChannelIdRef.current === undefined && currentChannelId === undefined) {
      return;
    }


    if (!currentChannelId || !channels) {
      if (!defaultValues?.id) { // Only if creating new and channel is deselected
         setContactInputType('json');
         // form.setValue('contact_details_input', ''); // Optionally clear input
      }
      prevSelectedChannelIdRef.current = currentChannelId;
      return;
    }

    const channel = channels.find(c => c.id === currentChannelId);
    if (!channel) {
      prevSelectedChannelIdRef.current = currentChannelId;
      return;
    }

    const newDeterminedContactType = getContactInputTypeForChannel(channel.type);
    const previousActualContactType = contactInputType; // The UI type before this change
    const currentFormInputValue = form.getValues('contact_details_input');
    let dataToTransition: Record<string, any> = {};

    // Convert current form input to a JSON object based on its *previous* type
    if (previousActualContactType === 'json') {
      try {
        if (currentFormInputValue.trim()) dataToTransition = JSON.parse(currentFormInputValue);
      } catch (e) { /* Invalid JSON, keep dataToTransition empty */ }
    } else if (previousActualContactType === 'email' && currentFormInputValue.trim()) {
      dataToTransition = { [CONTACT_KEY_EMAIL]: currentFormInputValue };
    } else if (previousActualContactType === 'phone' && currentFormInputValue.trim()) {
      dataToTransition = { [CONTACT_KEY_PHONE]: currentFormInputValue };
    }
    
    setContactInputType(newDeterminedContactType);

    // Populate new input based on newDeterminedContactType and transitioned data
    if (newDeterminedContactType === 'email') {
      form.setValue('contact_details_input', dataToTransition?.[CONTACT_KEY_EMAIL] || '', { shouldDirty: form.formState.isDirty });
    } else if (newDeterminedContactType === 'phone') {
      form.setValue('contact_details_input', dataToTransition?.[CONTACT_KEY_PHONE] || '', { shouldDirty: form.formState.isDirty });
    } else { // 'json'
      const jsonStringToShow = Object.keys(dataToTransition).length > 0 ? JSON.stringify(dataToTransition, null, 2) : "";
      form.setValue('contact_details_input', jsonStringToShow, { shouldDirty: form.formState.isDirty });
    }
    
    prevSelectedChannelIdRef.current = currentChannelId;

  }, [selectedChannelId, channels, form, contactInputType, defaultValues?.id]);


  const handleSubmit = (data: UserChannelFormData) => {
    let finalContactDetails: Record<string, any>;

    if (contactInputType === 'email') {
      finalContactDetails = { [CONTACT_KEY_EMAIL]: data.contact_details_input };
    } else if (contactInputType === 'phone') {
      finalContactDetails = { [CONTACT_KEY_PHONE]: data.contact_details_input };
    } else { // 'json'
      try {
        finalContactDetails = JSON.parse(data.contact_details_input);
        if (typeof finalContactDetails !== 'object' || finalContactDetails === null) {
          form.setError("contact_details_input", { type: "manual", message: "Contact details must be a valid JSON object." });
          return;
        }
      } catch (e) {
        form.setError("contact_details_input", { type: "manual", message: "Invalid JSON format: " + (e as Error).message });
        return;
      }
    }

    onSubmit({
      user_id: data.user_id,
      channel_id: data.channel_id,
      contact_details: finalContactDetails,
      is_preferred: data.is_preferred,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{defaultValues?.id ? "Edit User-Channel Mapping" : "Create New User-Channel Mapping"}</DialogTitle>
        <DialogDescription>
          {defaultValues?.id ? "Update this user-channel mapping." : "Define a new mapping between a user and a channel."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                {isLoadingUsers ? <Skeleton className="h-10 w-full" /> : (
                <Select onValueChange={field.onChange} value={field.value?.toString()} defaultValue={defaultValues?.user_id?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name || `User ID: ${user.id}`} ({user.email || 'No email'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="channel_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel</FormLabel>
                 {isLoadingChannels ? <Skeleton className="h-10 w-full" /> : (
                <Select onValueChange={field.onChange} value={field.value?.toString()} defaultValue={defaultValues?.channel_id?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {channels?.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id.toString()}>
                        {channel.name} ({channel.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_details_input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {contactInputType === 'email' ? 'Email Address' :
                   contactInputType === 'phone' ? 'Phone Number' :
                   'Contact Details (JSON)'}
                </FormLabel>
                <FormControl>
                  {contactInputType === 'email' ? (
                    <Input type="email" placeholder="user@example.com" {...field} />
                  ) : contactInputType === 'phone' ? (
                    <Input type="tel" placeholder="+1234567890" {...field} />
                  ) : (
                    <Textarea
                      placeholder='E.g., { "slackUserId": "U123ABC" } or { "custom_key": "value" }'
                      rows={4}
                      {...field}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_preferred"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Is Preferred Channel?</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                    Cancel
                </Button>
             </DialogClose>
            <Button type="submit" disabled={isPending || isLoadingUsers || isLoadingChannels}>
              {isPending ? (defaultValues?.id ? "Saving..." : "Creating...") : (defaultValues?.id ? "Save Changes" : "Create Mapping")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
