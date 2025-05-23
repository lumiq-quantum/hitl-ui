"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { UserChannelOut, UserOut, ChannelOut } from "@/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit3, MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      const details = row.original.contact_details;
      if (!details || Object.keys(details).length === 0) {
        return <span className="text-muted-foreground">N/A</span>;
      }
      const detailsStr = JSON.stringify(details);
      return (
         <div title={detailsStr} className="max-w-xs truncate text-sm text-muted-foreground">
          {detailsStr.length > 50 ? `${detailsStr.substring(0, 50)}...` : detailsStr}
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
