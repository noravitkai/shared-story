"use client";

import { useState } from "react";
import { useSocket } from "@/lib/hooks/useSocket";

export default function Home() {
  const { story, isMyTurn, sendSentence } = useSocket();
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendSentence(input.trim());
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-gray-900 font-serif px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Shared Story
        </h1>

        <div
          className={`rounded-md px-4 py-3 text-sm font-medium tracking-wide text-center ${
            isMyTurn
              ? "bg-gray-200 text-gray-800"
              : "bg-gray-100 text-gray-500 italic"
          }`}
        >
          {isMyTurn ? "Your turn to write ✍️" : "Waiting for your turn..."}
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
