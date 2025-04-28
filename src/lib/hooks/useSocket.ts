import { useEffect, useState } from "react";
import io from "socket.io-client";

type SocketType = ReturnType<typeof io>;

let socket: SocketType | undefined;

export function useSocket(name: string) {
  const [story, setStory] = useState<{ text: string; author: string }[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!name) return;

    socket = io();

    socket.emit("join", name);

    socket.on("story_update", (updatedStory: { text: string; author: string }[]) => {
      setStory(updatedStory);
    });

    socket.on("your_turn", (turnStatus: boolean) => {
      setIsMyTurn(turnStatus);
    });

    socket.on(
      "game_state",
      ({
        users: newUsers,
        currentTurnIndex,
        turnTimeLeft,
        isEnded,
      }: {
        users: string[];
        currentTurnIndex: number;
        turnTimeLeft: number;
        isEnded: boolean;
      }) => {
        setUsers(newUsers);
        setCurrentTurnIndex(currentTurnIndex);
        setTimeLeft(turnTimeLeft);
        setIsEnded(isEnded);
      }
    );

    socket.on("timer_tick", (seconds: number) => {
      setTimeLeft(seconds);
    });

    return () => {
      socket?.disconnect();
    };
  }, [name]);

  function sendSentence(sentence: string) {
    socket?.emit("new_sentence", sentence);
  }

  function resetGame() {
    socket?.emit("reset_game");
  }

  return {
    story,
    isMyTurn,
    sendSentence,
    users,
    timeLeft,
    currentTurnIndex,
    isEnded,
    resetGame,
  };
}
