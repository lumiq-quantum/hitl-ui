
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlusCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "lodash";

import * as api from "@/lib/api";
import type { ChannelOut, ChannelCreate } from "@/types";
import { ChannelForm } from "@/components/settings/channels/ChannelForm";
import { getChannelTableColumns } from "@/components/settings/channels/ChannelTableColumns";
import { DeleteConfirmationDialog } from "@/components/settings/DeleteConfirmationDialog";
import { DataTable } from "@/components/settings/DataTable";

const PAGE_SIZE = 10;

export default function ChannelsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelOut | null>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setPageIndex(0); // Reset to first page on new search
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  const { data: channelsData, isLoading, error, isPlaceholderData } = useQuery<ChannelOut[], Error>({
    queryKey: ["channels", pageIndex, debouncedSearchTerm, PAGE_SIZE],
    queryFn: () => api.listChannels({ 
      skip: pageIndex * PAGE_SIZE, 
      limit: PAGE_SIZE,
      search: debouncedSearchTerm || undefined
    }),
    placeholderData: (previousData) => previousData,
  });

  const channels = channelsData || [];

  const createMutation = useMutation<ChannelOut, Error, ChannelCreate>({
    mutationFn: api.createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast({ title: "Channel created", description: "The new channel has been successfully created." });
      setIsFormOpen(false);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to create channel", description: err.message });
    },
  });

  const updateMutation = useMutation<ChannelOut, Error, { id: number; data: ChannelCreate }>({
    mutationFn: ({ id, data }) => api.updateChannel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast({ title: "Channel updated", description: "The channel has been successfully updated." });
      setIsFormOpen(false);
      setSelectedChannel(null);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to update channel", description: err.message });
    },
  });

  const deleteMutation = useMutation<Record<string, never>, Error, number>({
    mutationFn: api.deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast({ title: "Channel deleted", description: "The channel has been successfully deleted." });
      setIsDeleteDialogOpen(false);
      setSelectedChannel(null);
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to delete channel", description: err.message });
    },
  });

  const handleCreateOpen = () => {
    setSelectedChannel(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (channel: ChannelOut) => {
    setSelectedChannel(channel);
    setIsFormOpen(true);
  };

  const handleDeleteOpen = (channel: ChannelOut) => {
    setSelectedChannel(channel);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: ChannelCreate) => {
    if (selectedChannel?.id) {
      updateMutation.mutate({ id: selectedChannel.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedChannel?.id) {
      deleteMutation.mutate(selectedChannel.id);
    }
  };

  const columns = useMemo(() => getChannelTableColumns(handleEditOpen, handleDeleteOpen), []);

  const canPreviousPage = pageIndex > 0;
  const canNextPage = channels.length === PAGE_SIZE;


  if (isLoading && pageIndex === 0 && !channelsData) {
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
            <AlertTriangle /> Error Loading Channels
          </CardTitle>
          <CardDescription className="text-destructive">
            There was an issue fetching channel data: {error.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Channels</CardTitle>
          <CardDescription>Manage your communication channels.</CardDescription>
        </div>
        <Button onClick={handleCreateOpen} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable 
          columns={columns} 
          data={channels} 
          pageIndex={pageIndex}
          pageSize={PAGE_SIZE}
          onPageChange={setPageIndex}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage && !isPlaceholderData}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search channels by name..."
        />
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <ChannelForm
            onSubmit={handleFormSubmit}
            defaultValues={selectedChannel || undefined}
            isPending={createMutation.isPending || updateMutation.isPending}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedChannel && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          itemName={selectedChannel.name}
          itemType="channel"
          isPending={deleteMutation.isPending}
        />
      )}
    </Card>
  );
}
