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

    const socketUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_SOCKET_URL_PROD
        : process.env.NEXT_PUBLIC_SOCKET_URL_DEV;

    socket = io(socketUrl || "");

    socket.on(
      "story_update",
      (updatedStory: { text: string; author: string }[]) => {
        setStory(updatedStory);
      }
    );

    socket.on("new_sentence", (data: { text: string; author: string }) => {
      setStory((prev) => [...prev, { text: data.text, author: data.author }]);
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
        const displayUsers =
          newUsers.length === 1 ? [newUsers[0], "StoryBot"] : newUsers;
        setUsers(displayUsers);
        setCurrentTurnIndex(currentTurnIndex);
        setTimeLeft(turnTimeLeft);
        setIsEnded(isEnded);
      }
    );

    socket.on("timer_tick", (seconds: number) => {
      setTimeLeft(seconds);
    });

    socket.emit("join", name);

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
