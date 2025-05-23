"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { userChannelSchema, type UserChannelFormData } from "@/lib/schemas";
import type { UserChannelOut, UserChannelCreate, UserOut, ChannelOut } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

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
  const form = useForm<UserChannelFormData>({
    resolver: zodResolver(userChannelSchema),
    defaultValues: {
      user_id: defaultValues?.user_id || undefined,
      channel_id: defaultValues?.channel_id || undefined,
      contact_details: defaultValues?.contact_details ? JSON.stringify(defaultValues.contact_details, null, 2) : "",
      is_preferred: defaultValues?.is_preferred ?? false,
    },
  });

  const handleSubmit = (data: UserChannelFormData) => {
    const contactDetailsValue = data.contact_details; // Already transformed by Zod schema
    onSubmit({ ...data, contact_details: contactDetailsValue });
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
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
            name="contact_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Details (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='E.g., { "emailAddress": "user@example.com" } or { "slackUserId": "U123ABC" }'
                    rows={4}
                    {...field}
                    value={field.value || ""}
                  />
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
