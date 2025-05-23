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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { channelSchema, type ChannelFormData } from "@/lib/schemas";
import type { ChannelOut, ChannelCreate } from "@/types";

interface ChannelFormProps {
  onSubmit: (data: ChannelCreate) => void;
  defaultValues?: Partial<ChannelOut>;
  isPending: boolean;
  onClose: () => void;
}

export function ChannelForm({ onSubmit, defaultValues, isPending, onClose }: ChannelFormProps) {
  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "",
      config: defaultValues?.config ? JSON.stringify(defaultValues.config, null, 2) : "",
    },
  });

  const handleSubmit = (data: ChannelFormData) => {
    const configValue = data.config; // Already transformed by Zod schema
    onSubmit({ ...data, config: configValue });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{defaultValues?.id ? "Edit Channel" : "Create New Channel"}</DialogTitle>
        <DialogDescription>
          {defaultValues?.id ? "Update the details of this channel." : "Fill in the details to create a new channel."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Primary Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., email, sms, slack" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Configuration (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='E.g., { "apiKey": "your_key", "sender": "noreply@example.com" }'
                    rows={5}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (defaultValues?.id ? "Saving..." : "Creating...") : (defaultValues?.id ? "Save Changes" : "Create Channel")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
