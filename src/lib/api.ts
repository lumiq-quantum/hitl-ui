
import type { ChannelCreate, ChannelOut, UserCreate, UserOut, UserChannelCreate, UserChannelOut, HTTPValidationError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Replace with your actual API base URL

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: HTTPValidationError | { detail: string } | string = `HTTP error! status: ${response.status}`;
    try {
      errorData = await response.json();
    } catch (e) {
      // If parsing JSON fails, use the default error message
    }

    const message = typeof errorData === 'string' 
      ? errorData 
      : ('detail' in errorData && typeof errorData.detail === 'string')
      ? errorData.detail
      : ('detail' in errorData && Array.isArray(errorData.detail) && errorData.detail.length > 0)
      ? errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
      : JSON.stringify(errorData);
      
    throw new Error(message);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T; // Or handle as appropriate for a 204 No Content response
  }
  return response.json() as Promise<T>;
}

interface ListParams {
  skip?: number;
  limit?: number;
  search?: string;
  user_id?: number | null;
  channel_type?: string | null;
}

function buildQueryString(params: ListParams): string {
  const query = new URLSearchParams();
  if (params.skip !== undefined) query.append('skip', params.skip.toString());
  if (params.limit !== undefined) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.user_id !== undefined && params.user_id !== null) query.append('user_id', params.user_id.toString());
  if (params.channel_type) query.append('channel_type', params.channel_type);
  
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

// Channel API
export const listChannels = (params: ListParams = {}): Promise<ChannelOut[]> => 
  fetch(`${API_BASE_URL}/channels/${buildQueryString(params)}`).then(handleResponse);
export const createChannel = (data: ChannelCreate): Promise<ChannelOut> => 
  fetch(`${API_BASE_URL}/channels/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
export const getChannel = (id: number): Promise<ChannelOut> => fetch(`${API_BASE_URL}/channels/${id}`).then(handleResponse);
export const updateChannel = (id: number, data: ChannelCreate): Promise<ChannelOut> =>
  fetch(`${API_BASE_URL}/channels/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
export const deleteChannel = (id: number): Promise<Record<string, never>> =>
  fetch(`${API_BASE_URL}/channels/${id}`, { method: 'DELETE' }).then(handleResponse);

// User API
export const listUsers = (params: ListParams = {}): Promise<UserOut[]> => 
  fetch(`${API_BASE_URL}/users/${buildQueryString(params)}`).then(handleResponse);
export const createUser = (data: UserCreate): Promise<UserOut> =>
  fetch(`${API_BASE_URL}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
export const getUser = (id: number): Promise<UserOut> => fetch(`${API_BASE_URL}/users/${id}`).then(handleResponse);
export const updateUser = (id: number, data: UserCreate): Promise<UserOut> =>
  fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
export const deleteUser = (id: number): Promise<Record<string, never>> =>
  fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' }).then(handleResponse);

// UserChannel API
export const listUserChannels = (params: ListParams = {}): Promise<UserChannelOut[]> => 
  fetch(`${API_BASE_URL}/user-channels/${buildQueryString(params)}`).then(handleResponse);
export const createUserChannel = (data: UserChannelCreate): Promise<UserChannelOut> =>
  fetch(`${API_BASE_URL}/user-channels/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
export const getUserChannel = (id: number): Promise<UserChannelOut> => fetch(`${API_BASE_URL}/user-channels/${id}`).then(handleResponse);
export const updateUserChannel = (id: number, data: UserChannelCreate): Promise<UserChannelOut> =>
  fetch(`${API_BASE_URL}/user-channels/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);
export const deleteUserChannel = (id: number): Promise<Record<string, never>> =>
  fetch(`${API_BASE_URL}/user-channels/${id}`, { method: 'DELETE' }).then(handleResponse);
