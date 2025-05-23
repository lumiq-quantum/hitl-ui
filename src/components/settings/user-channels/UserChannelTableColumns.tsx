
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { UserChannelOut, UserOut, ChannelOut } from "@/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit3, MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react";
import { 
  CONTACT_KEY_EMAIL, 
  CONTACT_KEY_PHONE, 
  getContactInputTypeForChannel, 
  formatConfigKeyLabel 
} from "@/lib/channelConfigs";

interface UserChannelTableActionsProps {
  userChannel: UserChannelOut;
  onEdit: (userChannel: UserChannelOut) => void;
  onDelete: (userChannel: UserChannelOut) => void;
}

function UserChannelTableActions({ userChannel, onEdit, onDelete }: UserChannelTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(userChannel)}>
          <Edit3 className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(userChannel)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function formatContactDetailsForDisplay(
  contactDetails: Record<string, any> | null | undefined,
  channelType: string | undefined | null
): string {
  if (!contactDetails || Object.keys(contactDetails).length === 0) {
    return "N/A";
  }

  if (channelType) {
    const inputType = getContactInputTypeForChannel(channelType);
    if (inputType === 'email' && contactDetails[CONTACT_KEY_EMAIL]) {
      return String(contactDetails[CONTACT_KEY_EMAIL]);
    }
    if (inputType === 'phone' && contactDetails[CONTACT_KEY_PHONE]) {
      return String(contactDetails[CONTACT_KEY_PHONE]);
    }
  }

  // Fallback for 'json' type or if specific keys are not found
  const entries = Object.entries(contactDetails)
    .map(([key, value]) => `${formatConfigKeyLabel(key)}: ${String(value)}`);
  
  let detailsStr = entries.join(', ');
  if (detailsStr.length > 60) {
    detailsStr = `${detailsStr.substring(0, 57)}...`;
  }
  return detailsStr;
}


export const getUserChannelTableColumns = (
  onEdit: (userChannel: UserChannelOut) => void,
  onDelete: (userChannel: UserChannelOut) => void,
  usersMap: Map<number, UserOut>,
  channelsMap: Map<number, ChannelOut>
): ColumnDef<UserChannelOut>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "user_id",
    header: "User",
    cell: ({ row }) => {
      const user = usersMap.get(row.original.user_id);
      return user ? (user.name || `ID: ${user.id}`) : `User ID: ${row.original.user_id}`;
    },
  },
  {
    accessorKey: "channel_id",
    header: "Channel",
    cell: ({ row }) => {
      const channel = channelsMap.get(row.original.channel_id);
      return channel ? `${channel.name} (${channel.type})` : `Channel ID: ${row.original.channel_id}`;
    },
  },
  {
    accessorKey: "contact_details",
    header: "Contact Details",
    cell: ({ row }) => {
      const channel = channelsMap.get(row.original.channel_id);
      const formattedDetails = formatContactDetailsForDisplay(row.original.contact_details, channel?.type);
      return (
         <div title={formattedDetails === "N/A" ? undefined : JSON.stringify(row.original.contact_details)} className="max-w-md truncate text-sm text-muted-foreground">
          {formattedDetails}
        </div>
      );
    },
  },
  {
    accessorKey: "is_preferred",
    header: "Preferred",
    cell: ({ row }) => {
      return row.original.is_preferred ? 
        <CheckCircle className="h-5 w-5 text-green-500" /> : 
        <XCircle className="h-5 w-5 text-muted-foreground" />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserChannelTableActions userChannel={row.original} onEdit={onEdit} onDelete={onDelete} />,
  },
];

