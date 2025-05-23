
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlusCircle, AlertTriangle, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { channelConfigurations, formatChannelTypeLabel } from "@/lib/channelConfigs";


import * as api from "@/lib/api";
import type { UserChannelOut, UserChannelCreate, UserOut, ChannelOut } from "@/types";
import { UserChannelForm } from "@/components/settings/user-channels/UserChannelForm";
import { getUserChannelTableColumns } from "@/components/settings/user-channels/UserChannelTableColumns";
import { DeleteConfirmationDialog } from "@/components/settings/DeleteConfirmationDialog";
import { DataTable } from "@/components/settings/DataTable";

const PAGE_SIZE = 10;
const ALL_USERS_FILTER_VALUE = "all-users-filter-value"; // Special value for "All Users"

export default function UserChannelsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserChannel, setSelectedUserChannel] = useState<UserChannelOut | null>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [filterUserId, setFilterUserId] = useState<number | null>(null);
  const [filterChannelType, setFilterChannelType] = useState<string | null>(null);

  const { data: usersForFilter, isLoading: isLoadingUsersForFilter } = useQuery<UserOut[], Error>({
    queryKey: ["users", "allForFilter"], // Distinct key for all users for filter
    queryFn: () => api.listUsers({ limit: 1000 }), // Fetch a large number for filter dropdown
  });

  const { data: channelsForFilter, isLoading: isLoadingChannelsForFilter } = useQuery<ChannelOut[], Error>({
    queryKey: ["channels", "allForFilter"], // Distinct key for all channels for filter
    queryFn: () => api.listChannels({ limit: 1000 }), // Fetch a large number for filter dropdown
  });

  const uniqueChannelTypesForFilter = useMemo(() => {
    const typesFromConfig = Object.keys(channelConfigurations);
    typesFromConfig.push("other"); // Add "other" if not already present
    const allTypes = channelsForFilter ? [...new Set(channelsForFilter.map(c => c.type).concat(typesFromConfig))] : typesFromConfig;
    return [...new Set(allTypes)].sort();
  }, [channelsForFilter]);


  const { data: userChannelsData, isLoading: isLoadingUserChannels, error: userChannelsError, isPlaceholderData } = useQuery<UserChannelOut[], Error>({
    queryKey: ["userChannels", pageIndex, PAGE_SIZE, filterUserId, filterChannelType],
    queryFn: () => api.listUserChannels({ 
      skip: pageIndex * PAGE_SIZE, 
      limit: PAGE_SIZE,
      user_id: filterUserId,
      channel_type: filterChannelType
    }),
     placeholderData: (previousData) => previousData,
  });
  
  const userChannels = userChannelsData || [];

  // Used for populating UserChannelForm and table display
  const { data: allUsers, isLoading: isLoadingAllUsers } = useQuery<UserOut[], Error>({
    queryKey: ["users", "allForFormAndTable"],
    queryFn: () => api.listUsers({ limit: 1000 }), // Fetch all for form/table mapping
  });

  const { data: allChannels, isLoading: isLoadingAllChannels } = useQuery<ChannelOut[], Error>({
    queryKey: ["channels", "allForFormAndTable"],
    queryFn: () => api.listChannels({ limit: 1000}), // Fetch all for form/table mapping
  });


  const usersMap = useMemo(() => {
    const map = new Map<number, UserOut>();
    allUsers?.forEach(user => map.set(user.id, user));
    return map;
  }, [allUsers]);

  const channelsMap = useMemo(() => {
    const map = new Map<number, ChannelOut>();
    allChannels?.forEach(channel => map.set(channel.id, channel));
    return map;
  }, [allChannels]);


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
  
  const columns = useMemo(() => getUserChannelTableColumns(handleEditOpen, handleDeleteOpen, usersMap, channelsMap), [usersMap, channelsMap, handleEditOpen, handleDeleteOpen]);
  
  const isLoadingInitialData = (isLoadingUserChannels && pageIndex === 0 && !userChannelsData) || isLoadingAllUsers || isLoadingAllChannels;

  const canPreviousPage = pageIndex > 0;
  const canNextPage = userChannels.length === PAGE_SIZE;

  const handleFilterUserChange = (userIdValue: string) => {
    if (userIdValue === ALL_USERS_FILTER_VALUE) {
      setFilterUserId(null);
    } else {
      setFilterUserId(parseInt(userIdValue));
    }
    setPageIndex(0);
  };

  const handleFilterChannelTypeChange = (channelType: string) => {
    setFilterChannelType(channelType === "all" ? null : channelType);
    setPageIndex(0);
  };


  const filterControls = (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="flex-1 min-w-[150px]">
        <Label htmlFor="userFilter">Filter by User</Label>
        {isLoadingUsersForFilter ? <Skeleton className="h-10 w-full mt-1" /> : (
        <Select 
          value={filterUserId === null ? ALL_USERS_FILTER_VALUE : filterUserId.toString()} 
          onValueChange={handleFilterUserChange} 
        >
          <SelectTrigger id="userFilter" className="mt-1">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_USERS_FILTER_VALUE}>All Users</SelectItem>
            {usersForFilter?.map(user => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name || `User ID: ${user.id}`} ({user.email || 'No email'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        )}
      </div>
      <div className="flex-1 min-w-[150px]">
        <Label htmlFor="channelTypeFilter">Filter by Channel Type</Label>
        {isLoadingChannelsForFilter ? <Skeleton className="h-10 w-full mt-1" /> : (
        <Select value={filterChannelType || "all"} onValueChange={handleFilterChannelTypeChange}>
          <SelectTrigger id="channelTypeFilter" className="mt-1">
            <SelectValue placeholder="All Channel Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channel Types</SelectItem>
            {uniqueChannelTypesForFilter.map(type => (
              <SelectItem key={type} value={type}>
                {formatChannelTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        )}
      </div>
    </div>
  );


  if (isLoadingInitialData) {
     return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
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
        <Button onClick={handleCreateOpen} size="sm" disabled={isLoadingAllUsers || isLoadingAllChannels}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Mapping
        </Button>
      </CardHeader>
      <CardContent>
         <DataTable 
            columns={columns} 
            data={userChannels} 
            pageIndex={pageIndex}
            pageSize={PAGE_SIZE}
            onPageChange={setPageIndex}
            canPreviousPage={canPreviousPage}
            canNextPage={canNextPage && !isPlaceholderData}
            filterComponent={filterControls} // Pass filter controls here
            // No global search for UserChannels per spec, specific filters handled above
         />
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <UserChannelForm
            onSubmit={handleFormSubmit}
            defaultValues={selectedUserChannel || undefined}
            isPending={createMutation.isPending || updateMutation.isPending}
            users={allUsers} // Pass all users for the form dropdown
            channels={allChannels} // Pass all channels for the form dropdown
            isLoadingUsers={isLoadingAllUsers}
            isLoadingChannels={isLoadingAllChannels}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedUserChannel && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          itemName={`Mapping for User: ${usersMap.get(selectedUserChannel.user_id)?.name || `ID ${selectedUserChannel.user_id}`} & Channel: ${channelsMap.get(selectedUserChannel.channel_id)?.name || `ID ${selectedUserChannel.channel_id}`}`}
          itemType="user-channel mapping"
          isPending={deleteMutation.isPending}
        />
      )}
    </Card>
  );
}

