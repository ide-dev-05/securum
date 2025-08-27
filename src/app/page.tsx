"use client";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import ProfileMenu from "./component/profile";
import { useTheme } from "next-themes";
import Markdown from "react-markdown"
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
  SendHorizontal,
  X,
  Puzzle,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileMinus,Check,Volume2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import Quizz from "./component/quizz";
import Sidebar from "./component/sidebar";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
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
  const { theme, systemTheme } = useTheme();
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";
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

  const handleSend = async () => {
    setInput("");
    stopRecording();
    if ((!input.trim() && !selectedFile) || !session?.user?.id) return;

    const newUserMessage = { type: "user", text: input || `[Uploaded file: ${selectedFile?.name}]` };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);
    console.log(messages.length)

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
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#06b6d4"); 
      gradient.addColorStop(1, "#db2777"); 

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
    <div className="font-sans flex items-center min-h-screen overflow-hidden">
      <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none"></div>
      <Sidebar onSelectSession={handleSelectSession} />
      <main className="relative flex flex-col items-center w-full min-h-screen px-3 sm:px-6">
       <div className="flex flex-row">
       <p className="font-sans cursor-pointer absolute top-2 left-4 text-xl sm:text-2xl font-thin hidden md:block">
          Securum
        </p>
        <ProfileMenu
          session={session}
          userScores={userScores}
          isDark={isDark}
          signOut={signOut}
        />
       </div>
       <div>
        
       </div>
        {messages.length === 0 ? (
          <div className="text-center flex flex-col items-center mt-24 w-full max-w-[1200px] xl:max-w-[900px] px-4">
            <Image src="/assets/orb2.png" alt="orb" height={160} width={176} className="h-40 w-44 sm:h-52 sm:w-56" />
            <h1 className="text-3xl sm:text-6xl font-medium mt-4">
              Welcome{" "}
              <span className="underline text-2xl sm:text-4xl text-[#7bdcde] font-normal">
                {session?.user?.name || "Guest"}
              </span>
              !
            </h1>
            <h2 className="text-base sm:text-lg mt-2">Be knowledgeable with <i>Securum</i></h2>
          </div>
        ) : (
          <div className={`text-center flex flex-col items-center mt-[50px]  w-full md:max-w-[600px] lg:max-w-[700px] xl:max-w-[900px]  ${isDark ? '' : 'text-black'} px-2 sm:px-0`}>
            <div className={`w-full relative text-start text-[16px]/[28px] max-h-[calc(100vh-240px)] overflow-y-auto`}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex mt-4 sm:mt-6 px-1 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`p-2 sm:p-3 rounded-md max-w-[90%]  break-words
                    ${
                      msg.type === "user"
                      ? (isDark ? "bg-zinc-700" : "bg-stone-200 border-[0.5px] border-zinc-200 p-3")
                      : ""
                    }`}
                  >
                    <Markdown>
                      {msg.text}
                    </Markdown>
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
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start items-center space-x-2 mt-6 text-zinc-400">
                  <Image alt="loading" src="/assets/orb2.png" width={18} height={18} className="animate-spin" />
                  <p>I&apos;m thinking...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
       
        <div
          className={cn(
            "w-full max-w-[400px]  md:max-w-[600px] lg:max-w-[700px] xl:max-w-[900px] rounded-2xl p-3 sm:p-4 mt-4 mx-2 sm:mx-0",
            "bg-background text-foreground border border-border",
            messages.length > 0 && "absolute bottom-4"
          )}
        >
          <textarea
            value={input || transcript}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Securum"
            rows={1}
            className="w-full resize-none min-h-[44px] rounded-xl px-4 py-3 focus:outline-none focus:ring-0 bg-transparent text-foreground text-sm sm:text-base"
          />
          <div className="w-full flex sm:flex-row sm:items-center sm:justify-between mt-2 gap-2">
            <div className={cn("flex flex-wrap items-center gap-2 text-sm", isRecording && "hidden")}>
              {selectedFile && (
                <div className="flex items-center border border-border rounded-lg px-2 py-1 select-none max-w-full">
                  <FileMinus className="shrink-0" />
                  <p className="text-xs ml-1 truncate">{selectedFile.name}</p>
                </div>
              )}
              <label className="border border-border text-foreground/80 rounded-lg cursor-pointer px-2 py-2">
                + Add file
                <input type="file" accept=".log,.txt" onChange={handleFileChange} className="hidden" />
              </label>
              <button
                onClick={() => setShowQuiz(true)}
                className="border border-border text-foreground/80 rounded-lg px-2 py-2 flex items-center"
              >
                <Puzzle className="size-[14px] mr-[4px]" /> Take quiz
              </button>
            </div>
            <div className={cn("flex items-center gap-3", isRecording && "w-full")}>
              {isRecording ? (
                <>
                  <X className="size-[22px] cursor-pointer text-muted-foreground" onClick={() => { handleRecording(); stopWaveform(); }} />
                  <canvas ref={canvasRef} className="w-full h-10" />
                </>
              ) : (
                <Mic className="size-[22px] cursor-pointer text-muted-foreground" onClick={() => { handleRecording(); }} />
              )}
              <SendHorizontal className="size-[22px] cursor-pointer text-muted-foreground" onClick={handleSend} />
            </div>
          </div>
        </div>
        <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
          <DialogPortal>
            <DialogTitle></DialogTitle>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
            <DialogContent
              className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,980px)] -translate-x-1/2 -translate-y-1/2 p-0 bg-transparent border-0 shadow-none outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-90 data-[state=closed]:zoom-out-90"
            >
              <div className="relative rounded-[24px] border border-border/60 bg-background/80 shadow-2xl backdrop-blur-xl">
                <div className="pointer-events-none absolute -top-10 right-0 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-8 -left-10 z-[-1] h-60 w-90 rounded-t-full bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 blur-3xl" />
                <Quizz/>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </main>
    </div>
  );
}
