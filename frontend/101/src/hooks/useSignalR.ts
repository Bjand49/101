import type { Game } from "../models/Game";
import ApiClient from "../services/apiClient";

const apiClient = new ApiClient();

export const getGroups = () => apiClient.get<Game[]>(`/groups`);

export const joinGroup = (name : string) =>
  apiClient.post<string,undefined>(`/groups/join?name=${name}`, name);

export const leaveGroup = (name : string) =>
  apiClient.post<string,undefined>(`/groups/leave?name=${name}`, name);

