"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ChannelOut } from "@/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChannelTableActionsProps {
  channel: ChannelOut;
  onEdit: (channel: ChannelOut) => void;
  onDelete: (channel: ChannelOut) => void;
}

function ChannelTableActions({ channel, onEdit, onDelete }: ChannelTableActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(channel)}>
          <Edit3 className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(channel)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const getChannelTableColumns = (
  onEdit: (channel: ChannelOut) => void,
  onDelete: (channel: ChannelOut) => void
): ColumnDef<ChannelOut>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="secondary">{row.original.type}</Badge>,
  },
  {
    accessorKey: "config",
    header: "Config",
    cell: ({ row }) => {
      const config = row.original.config;
      if (!config || Object.keys(config).length === 0) {
        return <span className="text-muted-foreground">N/A</span>;
      }
      const configStr = JSON.stringify(config);
      return (
        <div title={configStr} className="max-w-xs truncate text-sm text-muted-foreground">
          {configStr.length > 50 ? `${configStr.substring(0, 50)}...` : configStr}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ChannelTableActions channel={row.original} onEdit={onEdit} onDelete={onDelete} />,
  },
];
