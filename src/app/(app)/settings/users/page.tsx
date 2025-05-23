"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

import * as api from "@/lib/api";
import type { UserOut, UserCreate } from "@/types";
import { UserForm } from "@/components/settings/users/UserForm";
import { getUserTableColumns } from "@/components/settings/users/UserTableColumns";
import { DeleteConfirmationDialog } from "@/components/settings/DeleteConfirmationDialog";
import { DataTable } from "@/components/settings/DataTable";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOut | null>(null);

  const { data: users, isLoading, error } = useQuery<UserOut[], Error>({
    queryKey: ["users"],
    queryFn: api.listUsers,
  });

  const createMutation = useMutation<UserOut, Error, UserCreate>({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User created", description: "The new user has been successfully created." });
      setIsFormOpen(false);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to create user", description: err.message });
    },
  });

  const updateMutation = useMutation<UserOut, Error, { id: number; data: UserCreate }>({
    mutationFn: ({ id, data }) => api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User updated", description: "The user has been successfully updated." });
      setIsFormOpen(false);
      setSelectedUser(null);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to update user", description: err.message });
    },
  });

  const deleteMutation = useMutation<Record<string, never>, Error, number>({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User deleted", description: "The user has been successfully deleted." });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to delete user", description: err.message });
    },
  });

  const handleCreateOpen = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (user: UserOut) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteOpen = (user: UserOut) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: UserCreate) => {
    if (selectedUser?.id) {
      updateMutation.mutate({ id: selectedUser.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedUser?.id) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  const columns = useMemo(() => getUserTableColumns(handleEditOpen, handleDeleteOpen), []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle /> Error Loading Users
          </CardTitle>
          <CardDescription className="text-destructive">
            There was an issue fetching user data: {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage system users and their profiles.</CardDescription>
        </div>
        <Button onClick={handleCreateOpen} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={users || []} searchColumn="name" searchPlaceholder="Search users by name..."/>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <UserForm
            onSubmit={handleFormSubmit}
            defaultValues={selectedUser || undefined}
            isPending={createMutation.isPending || updateMutation.isPending}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedUser && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          itemName={selectedUser.name || `User ID: ${selectedUser.id}`}
          itemType="user"
          isPending={deleteMutation.isPending}
        />
      )}
    </Card>
  );
}
