"use client";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  User,
  SendHorizontal,
  Bolt,
  LogOut,
  LogIn,
  X,
  Puzzle,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileMinus,
  Check,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import Quizz from "./component/quizz";
import Sidebar from "./component/sidebar";
import ThemeToggleButton from "./component/themeToggleButton";

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
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export default function Home() {
  const [prolileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [userScores, setUserScores] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ type: string; text: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_messages", JSON.stringify(messages));
      if (currentSessionId) {
        localStorage.setItem("current_session_id", String(currentSessionId));
      }
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_messages");
    const savedSessionId = localStorage.getItem("current_session_id");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
    if (savedSessionId) {
      setCurrentSessionId(Number(savedSessionId));
    }
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const lastResult = e.results[e.results.length - 1][0].transcript;
      setTranscript(lastResult);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (transcript.trim() !== "") {
      setInput(transcript);
      setTranscript("");
    }
  };

  const handleRecording = () => {
    if (!isRecording) {
      startRecording();
      startWaveform();
    } else {
      stopRecording();
      stopWaveform();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      axios
        .get("/api/scores")
        .then((res) => setUserScores(res.data.scores))
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [session]);

  useEffect(() => {
    const dm = localStorage.getItem("isDarkMode");
    setIsDark(dm === "true");
  }, []);

  const handleSend = async () => {
    setInput("");
    stopRecording();
    if ((!input.trim() && !selectedFile) || !session?.user?.id) return;

    const newUserMessage = {
      type: "user",
      text: input || `[Uploaded file: ${selectedFile?.name}]`,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("prompt", input || "");
      formData.append("user_id", session.user.id.toString());
      if (currentSessionId) formData.append("session_id", currentSessionId.toString());
      if (selectedFile) formData.append("file", selectedFile);

      const res = await axios.post("http://localhost:8000/chat/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const botMessage = { type: "bot", text: res.data.response };
      setMessages((prev) => [...prev, botMessage]);

      if (!currentSessionId) {
        setCurrentSessionId(res.data.session_id);
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
    } finally {
      setInput("");
      setSelectedFile(null);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: { key: string; shiftKey: unknown; preventDefault: () => void }) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectSession = (sessionId: number, sessionMessages: { role: string; text: string }[]) => {
    setCurrentSessionId(sessionId);
    setMessages(sessionMessages.map((m) => ({ type: m.role === "user" ? "user" : "bot", text: m.text })));
  };

  const startWaveform = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    // normalize canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#06b6d4"); // cyan
      gradient.addColorStop(1, "#db2777"); // pink
   
      ctx.strokeStyle = gradient as unknown as string;

      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const stopWaveform = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
  };

  const speakText = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="font-sans flex min-h-screen overflow-hidden">
      {/* gradients */}
      <div className="pointer-events-none absolute -top-10 right-0 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-32 z-[-1] h-60 w-96 rounded-t-full bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-20 blur-3xl" />

      {/* hide sidebar on small screens, keep logic intact */}
      <div className="hidden md:block">
        <Sidebar onSelectSession={handleSelectSession} />
      </div>

      <main className="relative flex w-full flex-col items-center min-h-screen px-3 sm:px-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {/* map over your messages here */}
        </div>
        <p className="font-sans cursor-pointer absolute top-2 left-4 text-xl sm:text-2xl font-thin">
          Securum
        </p>

        <button onClick={() => setProfileMenuOpen(!prolileMenuOpen)}>
          <Image
            className="absolute top-4 right-4 rounded-[20px] cursor-pointer"
            src={session?.user?.image || "/assets/orb2.png"}
            alt="User Profile"
            height={30}
            width={40}
          />
          {prolileMenuOpen && (
            <ul
              className={`absolute right-2 top-14 rounded-md 
                ${isDark ? "bg-[#2a2a2a] text-zinc-200" : "bg-white text-zinc-800 border border-zinc-200"}
                w-[calc(100vw-1rem)] max-w-[280px] p-3 space-y-3 shadow-lg`}
            >
              <li className="flex items-center w-full space-x-[8px]">
                <User />
                <div className="text-start">
                  <p>{session?.user?.name || "Guest"}</p>
                  <small>{session?.user?.email || ""}</small>
                </div>
              </li>
              <li className="flex items-center w-full space-x-[8px]">
                <Bolt />
                <p>{userScores !== null && <span>{userScores} scores</span>}</p>
              </li>
              <li className="flex items-center w-full hover:bg-gray-600 py-1 rounded-md cursor-pointer">
                <ThemeToggleButton />
              </li>

              <hr className="h-px text-zinc-600" />
              <li>
                {session ? (
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-[8px] cursor-pointer font-medium"
                  >
                    <LogOut className="text-red-600" />
                    <p className="hover:text-red-600">Logout</p>
                  </button>
                ) : (
                  <Link href="./login">
                    <div className="flex items-center space-x-[8px] cursor-pointer font-medium">
                      <LogIn className="text-red-600" />
                      <p className="hover:text-red-600">LogIn</p>
                    </div>
                  </Link>
                )}
              </li>
            </ul>
          )}
        </button>

        {messages.length === 0 ? (
          <div className="text-center flex flex-col items-center mt-24 w-full max-w-[800px] px-4">
            <Image
              src="/assets/orb2.png"
              alt="orb"
              height={160}
              width={176}
              className="h-40 w-44 sm:h-52 sm:w-56"
            />
            <h1 className="text-3xl sm:text-6xl font-medium mt-4">
              Welcome{" "}
              <span className="underline text-2xl sm:text-4xl text-[#7bdcde] font-normal">
                {session?.user?.name || "Guest"}
              </span>
              !
            </h1>
            <h2 className="text-base sm:text-lg mt-2">
              Be knowledgeable with <i>Securum</i>
            </h2>
          </div>
        ) : (
          <div
            className={`text-center flex flex-col items-center mt-12 w-full max-w-[800px] ${
              isDark ? "" : "text-black"
            } px-2 sm:px-0`}
          >
            <div
              className={`w-full relative text-start text-[15px]/[26px] 
                max-h-[calc(100vh-300px)] overflow-y-auto`}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mt-4 sm:mt-6 px-1 ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <p
                    className={`p-2 sm:p-3 rounded-md max-w-[90%] sm:max-w-[600px] break-words
                      ${
                        msg.type === "user"
                          ? isDark
                            ? "bg-zinc-700"
                            : "bg-stone-100 border border-zinc-200"
                          : isDark
                          ? "text-zinc-200"
                          : "text-zinc-800"
                      }`}
                  >
                    {msg.text}
                    {msg.type === "bot" && (
                      <div className="flex items-center space-x-2 mt-2">
                        {copiedIndex === idx ? (
                          <Check className="size-[16px] text-green-500" />
                        ) : (
                          <span title="Copy response" className="inline-block">
                            <Copy
                              className="size-[16px] text-zinc-400 cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(msg.text);
                                setCopiedIndex(idx);
                                setTimeout(() => setCopiedIndex(null), 1500);
                              }}
                            />
                          </span>
                        )}
                        <ThumbsUp className="size-[16px] text-green-500 cursor-pointer" />
                        <ThumbsDown className="size-[16px] text-red-500 cursor-pointer" />
                        <span title="Play message">
                          <Volume2
                            className="size-[18px] text-zinc-400 cursor-pointer"
                            onClick={() => speakText(msg.text)}
                          />
                        </span>
                      </div>
                    )}
                  </p>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center space-x-2 mt-6 text-zinc-400">
                  <Image
                    alt="loading"
                    src="/assets/orb2.png"
                    width={18}
                    height={18}
                    className="animate-spin"
                  />
                  <p>I&apos;m thinking...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div
          className={`${
            isDark ? "bg-[#1c1c1c]" : "bg-[#f8f8fe]  border-[0.5px] border-zinc-600"
          }
          w-full max-w-[800px] rounded-2xl p-3 sm:p-4 mt-6 
          ${messages.length > 0 ? "md:sticky md:bottom-4" : ""} 
          mx-2 sm:mx-0`}
        >
          <textarea
            value={input || transcript}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Securum"
            rows={1}
            className={`w-full resize-none min-h-[20px] focus:outline-none focus:ring-0 bg-transparent
            ${isDark ? "text-white" : "text-black"} text-sm sm:text-base`}
          />
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 gap-2">
            <div className={`flex flex-wrap items-center gap-2 text-sm ${isRecording ? "hidden" : ""}`}>
              {selectedFile && (
                <div className="flex items-center border border-stone-700 rounded-lg px-2 py-1 select-none max-w-full">
                  <FileMinus className="shrink-0" />
                  <p className="text-xs ml-1 truncate">{selectedFile.name}</p>
                </div>
              )}
              <label
                className={`border rounded-lg cursor-pointer px-2 py-2 ${
                  isDark ? "text-white border-stone-700" : "text-stone-600 border-stone-500"
                }`}
              >
                + Add file
                <input type="file" accept=".log,.txt" onChange={handleFileChange} className="hidden" />
              </label>

              <button
                onClick={() => setShowQuiz(true)}
                className={`border rounded-lg px-2 py-2 ${
                  isDark ? "text-white border-stone-700" : "text-stone-600 border-stone-500"
                } flex items-center`}
              >
                <Puzzle className="size-[14px] mr-[4px]" /> Take quiz
              </button>
            </div>

            <div className={`flex items-center gap-3 ${isRecording ? "w-full" : ""}`}>
              {isRecording ? (
                <>
                  <X
                    className={`size-[22px] cursor-pointer ${isDark ? "text-stone-300" : "text-stone-600"}`}
                    onClick={() => {
                      handleRecording();
                      stopWaveform();
                    }}
                  />
                  <canvas ref={canvasRef} className="w-full h-10" />
                </>
              ) : (
                <Mic
                  className={`size-[22px] cursor-pointer ${isDark ? "text-stone-300" : "text-stone-600"}`}
                  onClick={() => {
                    handleRecording(); /* waveform starts inside handleRecording */
                  }}
                />
              )}

              <SendHorizontal
                className={`size-[22px] cursor-pointer ${isDark ? "text-stone-300" : "text-stone-600"}`}
                onClick={handleSend}
              />
            </div>
          </div>
        </div>

        {showQuiz && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="relative bg-black/60 border border-white/10 rounded-2xl shadow-2xl w-full h-[400px] max-w-4xl p-6 backdrop-blur-md transition-transform transform scale-100 hover:scale-[1.01]">
              <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none"></div>
              <button
                onClick={() => setShowQuiz(false)}
                className="absolute top-4 right-4 text-red-500 w-8 h-8 flex items-center justify-center hover:text-red-600 transition-colors"
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
