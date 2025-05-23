
export const channelConfigurations = {
  discord: ["bot_token", "guild_id"],
  gmail: ["client_id", "client_secret", "refresh_token"],
  "google chat": ["service_account_json", "space_id"],
  "microsoft outlook": ["client_id", "client_secret", "tenant_id", "refresh_token"],
  "microsoft teams": ["client_id", "client_secret", "tenant_id", "bot_id", "bot_password"],
  email: ["smtp_server", "smtp_port", "smtp_user", "smtp_password"],
  slack: ["bot_token", "channel_id"],
  telegram: ["bot_token", "chat_id"],
  whatsapp: ["api_key", "phone_number_id"],
} as const;

export type ChannelType = keyof typeof channelConfigurations | "other";

/**
 * Returns a list of configuration field keys for a given channel type.
 * @param type The channel type (string).
 * @returns An array of string keys, or null if the type has no specific config fields defined (excluding "other").
 */
export function getConfigFieldsForType(type: string | undefined | null): readonly string[] | null {
  if (!type) return null;
  const lowerType = type.toLowerCase();
  if (lowerType === "other") return null; // "other" type is handled by raw JSON input
  return channelConfigurations[lowerType as keyof typeof channelConfigurations] || null;
}

/**
 * Generates a user-friendly label from a snake_case or camelCase key.
 * E.g., "bot_token" becomes "Bot Token".
 * @param key The configuration key.
 * @returns A formatted string label.
 */
export function formatConfigKeyLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters for camelCase
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats a channel type key for display in the Select component.
 * E.g., "google chat" becomes "Google Chat".
 * @param typeKey The channel type key.
 * @returns A formatted string label.
 */
export function formatChannelTypeLabel(typeKey: string): string {
  return typeKey
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Configuration for User Channel mapping contact details
export const channelContactDetailMapping: Record<string, 'email' | 'phone'> = {
  "whatsapp": "phone",
  "telegram": "phone",
  "email": "email",
  "gmail": "email",
  "microsoft outlook": "email",
  "microsoft teams": "email",
  "google chat": "email",
  "slack": "email",
  "discord": "email"
};

export const CONTACT_KEY_EMAIL = "email";
export const CONTACT_KEY_PHONE = "phone";

/**
 * Determines the type of input field to display for contact details based on channel type.
 * @param channelType The type of the channel.
 * @returns 'email', 'phone', or 'json' for generic input.
 */
export function getContactInputTypeForChannel(channelType: string | undefined | null): 'email' | 'phone' | 'json' {
  if (!channelType) return 'json';
  const lowerChannelType = channelType.toLowerCase();
  return channelContactDetailMapping[lowerChannelType] || 'json';
}
