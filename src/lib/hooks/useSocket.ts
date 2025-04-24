import { useEffect, useState } from "react";
import io from "socket.io-client";

type SocketType = ReturnType<typeof io>;

let socket: SocketType | undefined;

export function useSocket(name: string) {
  const [story, setStory] = useState<string[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!name) return;

    socket = io();

    socket.emit("join", name);

    socket.on("story_update", (updatedStory: string[]) => {
      setStory(updatedStory);
    });

    socket.on("your_turn", (turnStatus: boolean) => {
      setIsMyTurn(turnStatus);
    });

    socket.on("active_users", (userList: string[]) => {
      setUsers(userList);
    });

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

  return { story, isMyTurn, sendSentence, users, timeLeft };
}
