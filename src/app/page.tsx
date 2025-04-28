"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/lib/hooks/useSocket";
import Image from "next/image";

const MAX_CHARACTERS = 75;

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
    isEnded,
    resetGame,
  } = useSocket(name);

  useEffect(() => {
    setTimeLeft(socketTimeLeft);
  }, [socketTimeLeft]);

  const storyContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storyContainerRef.current) {
      storyContainerRef.current.scrollTop =
        storyContainerRef.current.scrollHeight;
    }
  }, [story]);

  if (!name) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9] text-gray-900 font-serif px-4 py-10">
        <Image
          src="/logo.png"
          alt="Shared Story Logo"
          width={64}
          height={64}
          className="mb-10"
        />
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Once upon a turn...
        </h1>
        <p className="text-base text-gray-700 text-center mb-12">
          Live, turn-based collaborative story writing.
        </p>
        <div className="bg-white rounded-md shadow-md p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
            Choose a Name
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setName(nameInput.trim());
            }}
            className="space-y-4"
          >
            <input
              type="text"
              className="w-full border-b border-gray-400 focus:outline-none text-lg px-2 py-1"
              placeholder="Your name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
            />
            <p className="text-sm text-gray-500">
              {nameInput.length}/20 characters (min 3 required)
            </p>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white font-medium py-2 rounded disabled:opacity-40 hover:bg-black cursor-pointer"
              disabled={
                nameInput.trim().length < 3 || nameInput.trim().length > 20
              }
            >
              Join the Story
            </button>
          </form>
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-6 min-h-screen overflow-hidden box-border p-6 bg-[#f9f9f9] font-serif text-gray-900">
      {/* Right content area */}
      <div className="flex flex-col h-full gap-6 min-h-0">
        {/* Turn Countdown / Ended Message */}
        <div className="bg-white rounded p-4 shadow">
          <div className="flex items-center justify-between">
            <Image
              src="/logo.png"
              alt="Shared Story Logo"
              width={48}
              height={48}
            />
            <div className="flex-1 text-center px-4">
              <h1 className="hidden lg:block md:text-xl font-medium text-gray-800 text-center mt-1">
                A Collaborative Storytelling Adventure
              </h1>
            </div>
            {isEnded ? (
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded hover:bg-black transition cursor-pointer"
              >
                Start New Story
              </button>
            ) : (
              <div
                className={`px-4 py-2 text-sm font-medium text-center ${
                  isMyTurn ? "text-gray-800" : "text-gray-500 italic"
                }`}
              >
                {timeLeft !== null && (
                  <>
                    {(() => {
                      const myIndex = activeUsers.findIndex((u) => u === name);
                      if (myIndex === -1 || currentTurnIndex === -1)
                        return null;
                      const turnsAway =
                        myIndex >= currentTurnIndex
                          ? myIndex - currentTurnIndex
                          : activeUsers.length - currentTurnIndex + myIndex;
                      const estimatedTime = timeLeft + (turnsAway - 1) * 30;
                      return turnsAway === 0 ? (
                        <>
                          ⏳ {timeLeft} second{timeLeft !== 1 ? "s" : ""} left
                          to write
                        </>
                      ) : (
                        <>⌛ Your turn in {estimatedTime} seconds</>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Story Lines - scrollable middle */}
        <div className="bg-white rounded p-4 shadow flex-1 flex flex-col min-h-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            The Story:
          </h2>
          <div
            ref={storyContainerRef}
            className="flex-1 overflow-y-auto min-h-0"
          >
            {story.length === 0 ? (
              <p className="text-gray-400 italic">No one has started yet...</p>
            ) : (
              story.map((line, index) => (
                <blockquote
                  key={index}
                  className="border-l-4 border-accent pl-4 italic text-gray-800 mb-4"
                >
                  {line}
                </blockquote>
              ))
            )}
          </div>
        </div>

        {/* Input Box - bottom */}
        <div className="bg-white rounded p-4 shadow">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6"
          >
            <input
              type="text"
              placeholder="Write your sentence..."
              className="flex-1 bg-transparent border-b border-gray-300 focus:outline-none focus:border-black transition px-1 py-2 text-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isMyTurn || isEnded}
              maxLength={MAX_CHARACTERS}
            />
            <p className="text-sm text-gray-500">
              {input.length}/{MAX_CHARACTERS} characters
            </p>
            <button
              type="submit"
              disabled={!isMyTurn || !input.trim() || isEnded}
              className="w-auto self-start px-6 py-2 text-sm bg-gray-900 text-white font-semibold rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Left sidebar */}
      <div className="grid grid-cols-2 gap-4 h-full min-h-0 lg:flex lg:flex-col lg:gap-6 lg:sticky lg:top-0">
        {/* Info Box */}
        <div className="bg-white rounded p-4 shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            How to Play
          </h2>
          <ul className="list-disc pl-4 text-sm text-gray-500 space-y-1">
            <li>Write stories together, one turn at a time.</li>
            <li>Each player adds 1 sentence (max 75 characters).</li>
            <li>You have 30 seconds for your turn.</li>
            <li>
              Type <span className="font-semibold">/THE END</span> (all caps) to
              finish the story.
            </li>
            <li>
              To begin a new story, click{" "}
              <span className="font-semibold">Start New Story</span> at the top.
            </li>
          </ul>
        </div>

        {/* User List */}
        <div className="bg-white rounded p-4 shadow overflow-y-auto flex-1 min-h-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Players:</h2>
          <div className="flex flex-col gap-2">
            {activeUsers.map((user, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-md text-sm border text-center ${
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
      </div>
    </div>
  );
}
