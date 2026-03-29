import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getPlayerId() {
  let id = localStorage.getItem('chess_player_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('chess_player_id', id);
  }
  return id;
}
