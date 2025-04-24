"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/lib/hooks/useSocket";

export default function Home() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const {
    story,
    isMyTurn,
    sendSentence,
    users: activeUsers,
    timeLeft: socketTimeLeft,
    currentTurnIndex,
  } = useSocket(name);

  useEffect(() => {
    setTimeLeft(socketTimeLeft);
  }, [socketTimeLeft]);

  if (!name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] text-gray-900 font-serif px-4 py-10">
        <div className="bg-white rounded-md shadow-md p-6 w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-center">Enter Your Name</h1>
          <input
            type="text"
            className="w-full border-b border-gray-400 focus:outline-none text-lg px-2 py-1"
            placeholder="Your name..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <button
            className="w-full bg-gray-900 text-white font-medium py-2 rounded disabled:opacity-40"
            onClick={() => setName(nameInput.trim())}
            disabled={!nameInput.trim()}
          >
            Join the Story
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendSentence(input.trim());
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-gray-900 font-serif px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">Lined</h1>

        <div
          className={`rounded-md px-4 py-3 text-sm font-medium tracking-wide text-center ${
            isMyTurn
              ? "bg-gray-200 text-gray-800"
              : "bg-gray-100 text-gray-500 italic"
          }`}
        >
          {isMyTurn ? "Your turn to write ✍️" : "Waiting for your turn..."}
          {timeLeft !== null && (
            <div className="mt-1 text-xs text-gray-600">
              {(() => {
                const myIndex = activeUsers.findIndex((u) => u === name);
                if (myIndex === -1 || currentTurnIndex === -1) return null;
                const turnsAway =
                  myIndex >= currentTurnIndex
                    ? myIndex - currentTurnIndex
                    : activeUsers.length - currentTurnIndex + myIndex;

                const estimatedTime = timeLeft + (turnsAway - 1) * 30;

                return turnsAway === 0 ? (
                  <>
                    ⏳ {timeLeft} second{timeLeft !== 1 ? "s" : ""} left
                  </>
                ) : (
                  <>⌛ Your turn in {estimatedTime} seconds</>
                );
              })()}
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-md px-4 py-3">
          <h2 className="text-md font-medium text-gray-700 mb-2">Users:</h2>
          <div className="flex flex-wrap gap-2">
            {activeUsers.map((user, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-md text-sm border ${
                  index === currentTurnIndex
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {user}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-md px-6 py-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            The Story:
          </h2>
          <div className="space-y-3">
            {story.length === 0 ? (
              <p className="text-gray-400 italic">No one has started yet...</p>
            ) : (
              story.map((line, index) => (
                <div
                  key={index}
                  className="bg-gray-50 px-4 py-2 rounded-md border-l-2 border-gray-300 shadow-sm"
                >
                  <p className="text-gray-800 text-[16px] leading-relaxed">
                    <span className="mr-2 text-gray-400">{index + 1}.</span>{" "}
                    {line}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white px-4 py-4 shadow-sm rounded-md">
          <input
            type="text"
            placeholder="Write your sentence..."
            className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black transition px-1 py-2 text-lg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isMyTurn}
          />
          <button
            onClick={handleSubmit}
            disabled={!isMyTurn || !input.trim()}
            className="px-6 py-2 text-sm bg-gray-900 text-white font-semibold rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
