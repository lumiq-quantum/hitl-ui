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
import type { UserChannelOut, UserChannelCreate, UserOut, ChannelOut } from "@/types";
import { UserChannelForm } from "@/components/settings/user-channels/UserChannelForm";
import { getUserChannelTableColumns } from "@/components/settings/user-channels/UserChannelTableColumns";
import { DeleteConfirmationDialog } from "@/components/settings/DeleteConfirmationDialog";
import { DataTable } from "@/components/settings/DataTable";

export default function UserChannelsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserChannel, setSelectedUserChannel] = useState<UserChannelOut | null>(null);

  const { data: userChannels, isLoading: isLoadingUserChannels, error: userChannelsError } = useQuery<UserChannelOut[], Error>({
    queryKey: ["userChannels"],
    queryFn: api.listUserChannels,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<UserOut[], Error>({
    queryKey: ["users"],
    queryFn: api.listUsers,
  });

  const { data: channels, isLoading: isLoadingChannels } = useQuery<ChannelOut[], Error>({
    queryKey: ["channels"],
    queryFn: api.listChannels,
  });

  const usersMap = useMemo(() => {
    const map = new Map<number, UserOut>();
    users?.forEach(user => map.set(user.id, user));
    return map;
  }, [users]);

  const channelsMap = useMemo(() => {
    const map = new Map<number, ChannelOut>();
    channels?.forEach(channel => map.set(channel.id, channel));
    return map;
  }, [channels]);


  const createMutation = useMutation<UserChannelOut, Error, UserChannelCreate>({
    mutationFn: api.createUserChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChannels"] });
      toast({ title: "Mapping created", description: "The new user-channel mapping has been successfully created." });
      setIsFormOpen(false);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to create mapping", description: err.message });
    },
  });

  const updateMutation = useMutation<UserChannelOut, Error, { id: number; data: UserChannelCreate }>({
    mutationFn: ({ id, data }) => api.updateUserChannel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChannels"] });
      toast({ title: "Mapping updated", description: "The user-channel mapping has been successfully updated." });
      setIsFormOpen(false);
      setSelectedUserChannel(null);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to update mapping", description: err.message });
    },
  });

  const deleteMutation = useMutation<Record<string, never>, Error, number>({
    mutationFn: api.deleteUserChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChannels"] });
      toast({ title: "Mapping deleted", description: "The user-channel mapping has been successfully deleted." });
      setIsDeleteDialogOpen(false);
      setSelectedUserChannel(null);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to delete mapping", description: err.message });
    },
  });

  const handleCreateOpen = () => {
    setSelectedUserChannel(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (userChannel: UserChannelOut) => {
    setSelectedUserChannel(userChannel);
    setIsFormOpen(true);
  };

  const handleDeleteOpen = (userChannel: UserChannelOut) => {
    setSelectedUserChannel(userChannel);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: UserChannelCreate) => {
    if (selectedUserChannel?.id) {
      updateMutation.mutate({ id: selectedUserChannel.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedUserChannel?.id) {
      deleteMutation.mutate(selectedUserChannel.id);
    }
  };
  
  const columns = useMemo(() => getUserChannelTableColumns(handleEditOpen, handleDeleteOpen, usersMap, channelsMap), [usersMap, channelsMap]);
  
  const isLoading = isLoadingUserChannels || isLoadingUsers || isLoadingChannels;

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
  
  if (userChannelsError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle /> Error Loading Mappings
          </CardTitle>
          <CardDescription className="text-destructive">
            There was an issue fetching user-channel mapping data: {userChannelsError.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User-Channel Mappings</CardTitle>
          <CardDescription>Manage user preferences for communication channels.</CardDescription>
        </div>
        <Button onClick={handleCreateOpen} size="sm" disabled={isLoadingUsers || isLoadingChannels}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Mapping
        </Button>
      </CardHeader>
      <CardContent>
         <DataTable columns={columns} data={userChannels || []} />
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <UserChannelForm
            onSubmit={handleFormSubmit}
            defaultValues={selectedUserChannel || undefined}
            isPending={createMutation.isPending || updateMutation.isPending}
            users={users}
            channels={channels}
            isLoadingUsers={isLoadingUsers}
            isLoadingChannels={isLoadingChannels}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedUserChannel && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          itemName={`Mapping ID: ${selectedUserChannel.id}`}
          itemType="user-channel mapping"
          isPending={deleteMutation.isPending}
        />
      )}
    </Card>
  );
}
