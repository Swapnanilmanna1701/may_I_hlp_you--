"use client";

import React, { useState, FormEvent, useRef, useEffect } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  ChatSession,
} from "@google/generative-ai";
import MarkdownRenderer from "@/components/markdown-renderer";
import Image from "next/image";
import { LuLoader } from "react-icons/lu";

interface Message {
  text: string;
  type: "user" | "ai";
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
const MODEL_NAME = "gemini-1.0-pro-001";

const GeminiAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState<ChatSession>();
  const [loading, setLoading] = useState<boolean>(false);

  const genAI = new GoogleGenerativeAI(API_KEY);
  const generationConfig = {
    temperature: 0.5,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = genAI
          .getGenerativeModel({ model: MODEL_NAME })
          .startChat({
            generationConfig,
            safetySettings,
            history: messages.map((message) => ({
              text: message.text,
              role: message.type,
              parts: [],
            })),
          });
        setChat(newChat);
      } catch (error) {
        console.error(error);
      }
    };
    initChat();
  }, []);

  const getAIoutput = async () => {
    setLoading(true);
    try {
      if (chat) {
        const result = await chat.sendMessage(inputValue);
        setLoading(false);
        return result.response.text();
      }
      setLoading(false);
      return "Failed to send message";
    } catch (error) {
      setLoading(false);
      console.error("Failed to send message");
      return "Failed to send message";
    }

  };

  useEffect(() => {
    // Scroll to the bottom of the message container when new messages are added
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleMessageSubmit = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | FormEvent
  ) => {
    event.preventDefault();
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: trimmedMessage, type: "user" },
    ]);
    setInputValue("");
    const aiReply = await getAIoutput();
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: aiReply, type: "ai" },
    ]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleMessageSubmit(event);
    }
  };

  return (
    <div className="flex flex-col min-h-svh items-center justify-between h-screen sm:p-3 lg:px-52 overflow-y-hidden pissoff">
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 bg-opacity-90 backdrop-blur-md sm:rounded-lg overflow-y-scroll" style={{
        scrollbarWidth: 'none',
      }}>
        {messages.length === 0 ? (
          <>
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-gray-300 text-xl sm:text-2xl text-center tracking-wide font-bold mb-2">
                Start chatting with your favorite
              </h1>
              <h1 className="text-gray-300 text-xl sm:text-2xl tracking-wide font-bold">
                <span className="text-transparent bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-600 bg-clip-text text-4xl sm:text-5xl">Gemini</span>.AI here !!
              </h1>

              <Image
                src="/robot.svg"
                width={400}
                height={400}
                alt="Gemini AI"
                className="mt-5 hover:scale-100 scale-90 transition-all duration-500 ease-in-out robot"
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col text-white">
            <div className="flex-1 p-4">
              {messages.map((message, index) => (
                <div
                  className={`chat ${message.type === "ai"
                    ? "chat-start"
                    : "chat-end"
                    }`}
                  key={index}
                >
                  <div className="chat-image avatar">
                    <div className="w-0 sm:w-10 rounded-full">
                      <Image
                        width={500}
                        height={500}
                        alt={`${message.type === "ai" ? "Gemini" : "User"
                          } Avatar`}
                        src={
                          message.type === "ai"
                            ? "/gemini.jpg"
                            : "/user.png"
                        }
                      />
                    </div>
                  </div>
                  <div className="chat-header mb-1">
                    {message.type === "ai" ? "Gemini" : "User"}
                  </div>
                  <div
                    className={`chat-bubble max-w-full ${message.type === "ai"
                      ? "bg-[#7480ff] text-black"
                      : "bg-gray-950 text-white"
                      }`}
                  >
                    <p className="text-sm sm:text-base font-medium"><MarkdownRenderer content={message.text} /></p>
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex flex-col items-start justify-center mt-5">
        <div className="w-full flex items-center bg-slate-900 bg-opacity-90 backdrop-blur-md sm:rounded-md px-4 py-2">
          <input
            type="text"
            value={inputValue}
            // Disable when loading
            disabled={loading}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your prompt"
            className="bg-transparent text-white outline-none flex-grow"
          />
          <button
            type="submit"
            onClick={handleMessageSubmit}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md ml-4 disabled:bg-gray-500"
          >
            {
              loading ? <LuLoader className="animate-spin" size={24} /> : "Send"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiAI;
