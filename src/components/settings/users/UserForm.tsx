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
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { userSchema, type UserFormData } from "@/lib/schemas";
import type { UserOut, UserCreate } from "@/types";

interface UserFormProps {
  onSubmit: (data: UserCreate) => void;
  defaultValues?: Partial<UserOut>;
  isPending: boolean;
  onClose: () => void;
}

export function UserForm({ onSubmit, defaultValues, isPending, onClose }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      persona: defaultValues?.persona || "",
    },
  });

  const handleSubmit = (data: UserFormData) => {
    // Ensure null values are passed if fields are empty, as per UserCreate schema
    const processedData: UserCreate = {
        name: data.name || null,
        email: data.email || null,
        phone: data.phone || null,
        persona: data.persona || null,
    };
    onSubmit(processedData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{defaultValues?.id ? "Edit User" : "Create New User"}</DialogTitle>
        <DialogDescription>
          {defaultValues?.id ? "Update the details of this user." : "Fill in the details to create a new user."}
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
                  <Input placeholder="E.g., John Doe" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="E.g., john.doe@example.com" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., +1234567890" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="persona"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persona</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Customer, Agent" {...field} value={field.value ?? ''} />
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
              {isPending ? (defaultValues?.id ? "Saving..." : "Creating...") : (defaultValues?.id ? "Save Changes" : "Create User")}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
