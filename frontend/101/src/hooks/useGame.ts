import type { Game } from "../models/Game";
import type { Player } from "../models/Player";
import ApiClient from "../services/apiClient";

const apiClient = new ApiClient();
export const useGame = () => apiClient.get<Game[]>(`/games`);

// POST /games
export const createGame = () =>
  apiClient.post<undefined,string>("/games", undefined);

// GET /games
export const getGames = () =>
  apiClient.get<Game[]>("/games");

// GET /games/{gameId}
export const getGame = (gameId: string) =>  
  apiClient.get<Game>(`/games/${gameId}`);

// POST /games/{gameId}/start
export const startGame = (gameId: string) =>
  apiClient.post<undefined, Game>(`/games/${gameId}/start`, undefined);

// POST /games/${gameId}/player?name=${name}
export const joinGame = (gameId: string, player : Player) =>
  apiClient.post<Player, Game>(`/games/${gameId}/player`, player);

