"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { UserOut } from "@/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserTableActionsProps {
  user: UserOut;
  onEdit: (user: UserOut) => void;
  onDelete: (user: UserOut) => void;
}

function UserTableActions({ user, onEdit, onDelete }: UserTableActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(user)}>
          <Edit3 className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const getUserTableColumns = (
  onEdit: (user: UserOut) => void,
  onDelete: (user: UserOut) => void
): ColumnDef<UserOut>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name || <span className="text-muted-foreground">N/A</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || <span className="text-muted-foreground">N/A</span>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || <span className="text-muted-foreground">N/A</span>,
  },
  {
    accessorKey: "persona",
    header: "Persona",
    cell: ({ row }) => row.original.persona ? <Badge variant="outline">{row.original.persona}</Badge> : <span className="text-muted-foreground">N/A</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => <UserTableActions user={row.original} onEdit={onEdit} onDelete={onDelete} />,
  },
];
