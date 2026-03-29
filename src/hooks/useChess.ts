import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { supabase } from '../lib/supabase';
import { getPlayerId } from '../lib/utils';

export const useChess = (roomCode: string) => {
  const [game, setGame] = useState(new Chess());
  const [room, setRoom] = useState<any>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [loading, setLoading] = useState(true);
  const playerId = getPlayerId();

  // Refs hold the LATEST state for use inside async callbacks / event handlers
  const latestRoomRef = useRef<any>(null);
  const latestGameRef = useRef(new Chess());
  const playerColorRef = useRef<'w' | 'b' | null>(null);

  const applyRoomData = useCallback(
    (data: any) => {
      latestRoomRef.current = data;
      setRoom(data);

      try {
        const newGame = new Chess(data.fen);
        latestGameRef.current = newGame;
        setGame(newGame);
      } catch {
        console.error('Invalid FEN:', data.fen);
      }

      let color: 'w' | 'b' | null = null;
      if (data.player_white === playerId) color = 'w';
      else if (data.player_black === playerId) color = 'b';
      playerColorRef.current = color;
      setPlayerColor(color);
    },
    [playerId]
  );

  useEffect(() => {
    if (!roomCode) return;

    // 1 — Initial fetch
    supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single()
      .then(({ data, error }) => {
        if (!error && data) applyRoomData(data);
        setLoading(false);
      });

    // 2 — Real-time subscription
    const channel = supabase
      .channel(`game-${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          console.log('[Realtime] UPDATE received, new FEN:', payload.new.fen);
          applyRoomData(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, applyRoomData]);

  const makeMove = useCallback(
    async (move: { from: string; to: string; promotion?: string }) => {
      const currentRoom = latestRoomRef.current;
      const currentGame = latestGameRef.current;
      const color = playerColorRef.current;

      if (!currentRoom || currentRoom.status !== 'playing') {
        console.log('[Move] blocked — status:', currentRoom?.status);
        return false;
      }
      if (color && currentGame.turn() !== color) {
        console.log('[Move] blocked — not your turn, turn=', currentGame.turn(), 'you=', color);
        return false;
      }

      try {
        const gameCopy = new Chess(currentGame.fen());
        const result = gameCopy.move(move);
        if (!result) return false;

        const newFen = gameCopy.fen();
        const newHistory = [...(currentRoom.history ?? []), result.san];
        const newStatus = gameCopy.isGameOver() ? 'finished' : 'playing';

        // Optimistic local update so the moving player sees instant feedback
        applyRoomData({ ...currentRoom, fen: newFen, history: newHistory, status: newStatus });

        // Persist to Supabase (triggers realtime on opponent's side)
        const { error } = await supabase
          .from('rooms')
          .update({
            fen: newFen,
            history: newHistory,
            status: newStatus,
            last_move_at: new Date().toISOString(),
          })
          .eq('room_code', roomCode);

        if (error) {
          console.error('[Move] supabase error:', error);
          // Roll back
          applyRoomData(currentRoom);
          return false;
        }

        return true;
      } catch (e) {
        console.error('[Move] exception:', e);
        return false;
      }
    },
    [roomCode, applyRoomData]
  );

  const resign = useCallback(async () => {
    await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('room_code', roomCode);
  }, [roomCode]);

  const isMyTurn =
    playerColor !== null &&
    game.turn() === playerColor &&
    room?.status === 'playing';

  return { game, room, playerColor, loading, makeMove, resign, isMyTurn };
};
