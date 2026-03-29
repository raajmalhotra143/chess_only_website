import { useState, useEffect, useCallback } from 'react';
import { Chess, Move } from 'chess.js';
import { supabase } from '../lib/supabase';
import { getPlayerId } from '../lib/utils';

export const useChess = (roomCode: string) => {
  const [game, setGame] = useState(new Chess());
  const [room, setRoom] = useState<any>(null);
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [loading, setLoading] = useState(true);
  const playerId = getPlayerId();

  const fetchRoom = useCallback(async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (error || !data) return;

    // Join automatically if slots are open and not a spectator already
    if (!data.player_white && data.player_black !== playerId) {
      await supabase.from('rooms').update({ player_white: playerId }).eq('id', data.id);
    } else if (!data.player_black && data.player_white !== playerId) {
      await supabase.from('rooms').update({ player_black: playerId, status: 'playing' }).eq('id', data.id);
    }

    setRoom(data);
    const newGame = new Chess(data.fen);
    setGame(newGame);

    if (data.player_white === playerId) setPlayerColor('w');
    else if (data.player_black === playerId) setPlayerColor('b');
    else setPlayerColor(null); // Spectator

    setLoading(false);
  }, [roomCode, playerId]);

  useEffect(() => {
    fetchRoom();

    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `room_code=eq.${roomCode}` },
        (payload) => {
          const updatedRoom = payload.new;
          setRoom(updatedRoom);
          const newGame = new Chess(updatedRoom.fen);
          setGame(newGame);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, fetchRoom]);

  // Basic countdown timer (client side, but ideally synced)
  useEffect(() => {
    if (room?.status !== 'playing') return;

    const interval = setInterval(() => {
      setRoom((prev: any) => {
        if (!prev) return prev;
        const turn = game.turn();
        if (turn === 'w') {
          return { ...prev, white_time: Math.max(0, prev.white_time - 1) };
        } else {
          return { ...prev, black_time: Math.max(0, prev.black_time - 1) };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.status, game.turn()]);

  const makeMove = async (move: string | { from: string; to: string; promotion?: string }) => {
    if (room?.status !== 'playing' && room?.status !== 'waiting') return false;
    
    // Check if it's player's turn
    const currentTurn = game.turn();
    if (playerColor && currentTurn !== playerColor) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (result) {
        const newFen = gameCopy.fen();
        const newHistory = [...(room?.history || []), result.san];
        let newStatus = 'playing';

        if (gameCopy.isGameOver()) {
          newStatus = 'finished';
        }

        const { error } = await supabase
          .from('rooms')
          .update({
            fen: newFen,
            history: newHistory,
            status: newStatus,
            last_move_at: new Date().toISOString()
          })
          .eq('room_code', roomCode);

        if (error) throw error;
        return true;
      }
    } catch (e) {
      console.error('Invalid move', e);
    }
    return false;
  };

  const resign = async () => {
    if (!playerColor) return;
    const { error } = await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('room_code', roomCode);
    if (error) console.error(error);
  };

  return {
    game,
    room,
    playerColor,
    loading,
    makeMove,
    resign,
    isMyTurn: playerColor === game.turn(),
  };
};
