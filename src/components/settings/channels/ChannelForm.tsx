
"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldPath } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { channelSchema, type ChannelFormData } from "@/lib/schemas";
import type { ChannelOut, ChannelCreate } from "@/types";
import {
  channelConfigurations,
  getConfigFieldsForType,
  formatConfigKeyLabel,
  formatChannelTypeLabel,
  type ChannelType as ConfigChannelType
} from "@/lib/channelConfigs";

interface ChannelFormProps {
  onSubmit: (data: ChannelCreate) => void;
  defaultValues?: Partial<ChannelOut>;
  isPending: boolean;
  onClose: () => void;
}

export function ChannelForm({ onSubmit, defaultValues, isPending, onClose }: ChannelFormProps) {
  const form = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    // defaultValues for config is now an object
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "",
      config: defaultValues?.config || {},
    },
  });

  const selectedType = form.watch("type");
  const [currentConfigParams, setCurrentConfigParams] = useState<readonly string[] | null>([]);
  const [rawJsonInput, setRawJsonInput] = useState<string>("");

  // Effect to reset form and rawJsonInput when defaultValues change (e.g. opening dialog for different item)
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name || "",
        type: defaultValues.type || "",
        config: defaultValues.config || {},
      });
      if (defaultValues.type?.toLowerCase() === 'other' && defaultValues.config) {
        setRawJsonInput(JSON.stringify(defaultValues.config, null, 2));
      } else {
        setRawJsonInput("");
      }
    } else {
       form.reset({ name: "", type: "", config: {} });
       setRawJsonInput("");
    }
  }, [defaultValues, form.reset]);


  // Effect to update currentConfigParams when selectedType changes
  useEffect(() => {
    const params = getConfigFieldsForType(selectedType);
    setCurrentConfigParams(params);
  }, [selectedType]);


  // Handle transitions between 'other' and structured types
  const handleTypeChange = (newType: string) => {
    const oldType = form.getValues("type");
    form.setValue("type", newType, { shouldDirty: true, shouldValidate: true });

    if (newType.toLowerCase() === 'other') {
      const currentStructuredConfig = form.getValues("config");
      setRawJsonInput(JSON.stringify(currentStructuredConfig || {}, null, 2));
      form.setValue("config", {}, {shouldDirty: true}); // Clear structured config
    } else if (oldType && oldType.toLowerCase() === 'other' && rawJsonInput.trim() !== "") {
      try {
        const parsedConfig = JSON.parse(rawJsonInput);
        form.setValue("config", parsedConfig, { shouldValidate: true, shouldDirty: true });
      } catch (e) {
        console.error("Error parsing JSON from raw input:", e);
        form.setValue("config", {}, { shouldValidate: true, shouldDirty: true }); // Clear config on error
      }
      setRawJsonInput(""); // Clear raw JSON input field
    } else if (newType !== oldType) { // Transitioning between two structured types or from nothing to structured
        // Reset config, defaultValues will repopulate if editing, otherwise it's a fresh start
        // preserving common keys could be added here if desired
        form.setValue("config", defaultValues?.type === newType ? (defaultValues.config || {}) : {}, { shouldValidate: true, shouldDirty: true });
        setRawJsonInput("");
    }
  };


  const handleSubmit = (data: ChannelFormData) => {
    let configToSubmit: Record<string, any> | null = null;
    const submittedType = data.type; // Use data.type which is the submitted type

    if (submittedType?.toLowerCase() === 'other') {
      if (rawJsonInput.trim() === "") {
        configToSubmit = null;
      } else {
        try {
          configToSubmit = JSON.parse(rawJsonInput);
          if (typeof configToSubmit !== 'object' || configToSubmit === null) {
            form.setError("type" as FieldPath<ChannelFormData>, { type: "manual", message: "Configuration for 'Other' type must be a valid JSON object." });
            return;
          }
        } catch (e) {
          form.setError("type" as FieldPath<ChannelFormData>, { type: "manual", message: "Invalid JSON: " + (e as Error).message });
          return;
        }
      }
    } else if (data.config) {
      const dynamicConfigParams = getConfigFieldsForType(submittedType);
      const filteredConfig: Record<string, any> = {};
      if (dynamicConfigParams) {
        for (const param of dynamicConfigParams) {
          if (data.config[param] !== undefined && data.config[param] !== null && data.config[param] !== "") {
            filteredConfig[param] = data.config[param];
          }
        }
      }
      if (Object.keys(filteredConfig).length > 0) {
        configToSubmit = filteredConfig;
      }
    }

    onSubmit({
      name: data.name,
      type: submittedType,
      config: configToSubmit,
    });
  };

  const allChannelTypes = [...Object.keys(channelConfigurations), "other"] as ConfigChannelType[];


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
            render={({ field }) => ( // field.value here is the current type from form state
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={handleTypeChange}
                  value={field.value} // Controlled component
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allChannelTypes.map(typeKey => (
                      <SelectItem key={typeKey} value={typeKey}>
                        {formatChannelTypeLabel(typeKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamically rendered config fields if not 'other' type */}
          {selectedType?.toLowerCase() !== 'other' && currentConfigParams && currentConfigParams.map((param) => (
            <FormField
              control={form.control}
              key={param}
              name={`config.${param}` as FieldPath<ChannelFormData>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{formatConfigKeyLabel(param)}</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter ${formatConfigKeyLabel(param).toLowerCase()}`} {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          {/* Fallback to Textarea if type is 'other' */}
          {selectedType?.toLowerCase() === 'other' && (
            <FormItem>
              <FormLabel>Configuration (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter JSON configuration, e.g., { "apiKey": "your_key", "retries": 3 }'
                  rows={5}
                  value={rawJsonInput}
                  onChange={(e) => setRawJsonInput(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}

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
