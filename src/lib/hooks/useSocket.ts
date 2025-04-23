import { useEffect, useState } from "react";
import io from "socket.io-client";

type SocketType = ReturnType<typeof io>;

let socket: SocketType | undefined;

export function useSocket() {
  const [story, setStory] = useState<string[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    socket = io();

    socket.on("story_update", (updatedStory: string[]) => {
      setStory(updatedStory);
    });

    socket.on("your_turn", (turnStatus: boolean) => {
      setIsMyTurn(turnStatus);
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  function sendSentence(sentence: string) {
    socket?.emit("new_sentence", sentence);
  }

  return { story, isMyTurn, sendSentence };
}
