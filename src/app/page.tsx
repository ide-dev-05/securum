"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  SendHorizontal,
  X,
  Puzzle,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCcw,
} from "lucide-react";
import Profile from "./component/profile";
import Quizz from "./component/quizz";
import Sidebar from "./component/sidebar";
import Loading from "./component/loading";
declare global {
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onaudioend?: (event: Event) => void;
    onaudiostart?: (event: Event) => void;
    onend?: (event: Event) => void;
    onerror?: (event: SpeechRecognitionEvent) => void;
    onnomatch?: (event: Event) => void;
    onresult?: (event: SpeechRecognitionEvent) => void;
    onsoundend?: (event: Event) => void;
    onsoundstart?: (event: Event) => void;
    onspeechend?: (event: Event) => void;
    onspeechstart?: (event: Event) => void;
    onstart?: (event: Event) => void;
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  interface Window {
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}
export default function Home() {
  const { data: session } = useSession();
  const [showQuiz, setShowQuiz] = useState(false);
  const [messages, setMessages] = useState<{ type: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcript, setTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const icons = [
    { id: 1, icon: Copy, color: "text-zinc-400" },
    { id: 2, icon: ThumbsUp, color: "text-green-500" },
    { id: 3, icon: ThumbsDown, color: "text-red-500" },
    { id: 4, icon: RefreshCcw, color: "text-zinc-400" },
  ];
  const startRecording = useCallback(() => {
    if (!window?.webkitSpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"; 
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1][0].transcript;
      setTranscript(lastResult);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event);
      setIsRecording(false);
      recognition.stop();
    };
    recognition.onend = () => {
      setIsRecording(false);
      setRecordingComplete(true);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    setRecordingComplete(false);
    setTranscript("");
  }, []);
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setRecordingComplete(true);
    if (transcript.trim() !== "") {
      setMessages((prev) => [...prev, { type: "user", text: transcript }]);
      setLoading(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "This is a sample bot reply." },
        ]);
        setLoading(false);
      }, 1500);
    }
    setTranscript("");
    setInput("");
  }, [transcript]);
  useEffect(() => { 
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  const handleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);
  const handleSend = useCallback(() => {
    if (isRecording) {
      stopRecording();
      return;
    }
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { type: "user", text: input }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "This is a sample bot reply." },
      ]);
      setLoading(false);
    }, 1500);
  }, [input, isRecording, stopRecording]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );
  return (
    <div className="font-sans flex items-center min-h-screen overflow-hidden relative">
      <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none" />
      <Sidebar />
      <main className="relative flex flex-col items-center w-[96%] min-h-screen ">
        <p className="font-sans cursor-pointer absolute top-2 left-4 text-[22px] font-thin">
          Securum
        </p>
        <Profile session={session} />
        {messages.length === 0 ? (
          <div className="text-center flex flex-col items-center mt-[100px] w-[800px]">
            <Image src="/assets/orb2.png" alt="orb" height={200} width={220} />
            <h1 className="text-[60px] font-medium">
              Welcome{" "}
              <span className="underline text-[40px] text-[#7bdcde]   font-normal">
                {session?.user?.name || "Guest"}
              </span>
              !
            </h1>
            <h2>
              Be knowledgeable with <i>Securum</i>
            </h2>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center mt-[50px] w-[800px]">
            <div
              className={`w-full relative ${
                messages.length > 1 ? "max-h-[400px] overflow-y-auto" : ""
              }`}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mt-6 ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded-md max-w-[600px] ${
                      msg.type === "user" ? "bg-zinc-700" : ""
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.type === "bot" && (
                      <div className="flex items-center gap-4 mt-2 p-1">
                        {icons.map(({ id, icon: Icon, color }) => (
                          <div
                            key={id}
                            className={`transition-transform duration-200 ease-in-out hover:scale-[1.15] ${color}`}
                          >
                            <Icon className="size-[20px] cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && <Loading />}
            </div>
          </div>
        )}
        <div
          className={`bg-[#1c1c1c] w-[800px] rounded-2xl p-4 mt-[30px] ${
            messages.length > 0 ? "absolute bottom-8" : ""
          }`}
        >
          <textarea
            value={isRecording ? transcript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Securum"
            className="w-full resize-none min-h-[20px] focus:outline-none focus:ring-0 bg-transparent text-white"
            rows={2}
          />
          <div className="w-full flex justify-between items-center mt-[5px]">
            <div className={`flex space-x-[8px] text-sm ${isRecording ? "hidden" : ""}`}>
              <button className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2">
                + Add file
              </button>
              <button
                onClick={() => setShowQuiz(true)}
                className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2 flex items-center"
              >
                <Puzzle className="size-[14px] mr-[4px]" /> Take quiz
              </button>
            </div>
            <div className="flex items-center space-x-[10px]">
              {isRecording ? (
                <X
                  className="size-[20px] text-stone-300 cursor-pointer"
                  onClick={handleRecording} 
                />
              ) : (
                <Mic
                  className="size-[20px] text-stone-300 cursor-pointer"
                  onClick={handleRecording}      
                />
              )}
              <SendHorizontal
                className="size-[20px] text-stone-300 cursor-pointer"
                onClick={handleSend}    
              />
            </div>
          </div>
        </div>
        {showQuiz && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="relative bg-black/60 border border-white/10 rounded-2xl shadow-2xl w-full h-[400px] max-w-4xl p-6 backdrop-blur-md transition-transform transform scale-100 hover:scale-[1.01]">
              <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none" />
              <button
                onClick={() => setShowQuiz(false)}
                className="absolute top-4 right-4 text-red-500 w-8 h-8 flex items-center justify-center hover:text-red-600 transition-colors"
                aria-label="Close quiz"
              >
                ✕
              </button>
              <Quizz />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
