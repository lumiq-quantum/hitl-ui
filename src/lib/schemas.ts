import { z } from 'zod';

export const channelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  config: z.record(z.string(), z.any().optional()) // Config is now an object
    .nullable()
    .optional()
    .default({}),
});

export type ChannelFormData = z.infer<typeof channelSchema>;

export const userSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().email("Invalid email address").nullable().optional(),
  phone: z.string().nullable().optional(),
  persona: z.string().nullable().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

export const userChannelSchema = z.object({
  user_id: z.coerce.number().int().positive("User ID must be a positive integer"),
  channel_id: z.coerce.number().int().positive("Channel ID must be a positive integer"),
  contact_details: z.string()
    .min(1, "Contact details are required")
    .transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        if (typeof parsed !== 'object' || parsed === null) {
           ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Contact details must be a JSON object" });
           return z.NEVER;
        }
        return parsed;
      } catch (e) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON format for contact details" });
        return z.NEVER;
      }
    }),
  is_preferred: z.boolean().nullable().optional().default(false),
});

export type UserChannelFormData = z.infer<typeof userChannelSchema>;
