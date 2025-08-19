// "use client";
// import axios from "axios";
// import { useSession, signOut } from "next-auth/react";
// import { useState, useRef, useEffect } from "react";
// import Image from "next/image";
// import {
//   User,
//   SendHorizontal,
//   Bolt,
//   LogOut,
//   LogIn,
//   X,
//   Puzzle,
//   Mic,
//   Copy,
//   ThumbsUp,
//   ThumbsDown,
//   RefreshCcw,
  
// } from "lucide-react";
// import Link from "next/link";
// import Quizz from "./component/quizz";
// import Sidebar from "./component/sidebar";
// declare global {
//   interface SpeechRecognition extends EventTarget {
//     continuous: boolean;
//     interimResults: boolean;
//     lang: string;
//     maxAlternatives: number;
//     start(): void;
//     stop(): void;
//     abort(): void;
//     onaudioend?: (event: Event) => void;
//     onaudiostart?: (event: Event) => void;
//     onend?: (event: Event) => void;
//     onerror?: (event: SpeechRecognitionEvent) => void;
//     onnomatch?: (event: Event) => void;
//     onresult?: (event: SpeechRecognitionEvent) => void;
//     onsoundend?: (event: Event) => void;
//     onsoundstart?: (event: Event) => void;
//     onspeechend?: (event: Event) => void;
//     onspeechstart?: (event: Event) => void;
//     onstart?: (event: Event) => void;
//   }

//   interface SpeechRecognitionEvent extends Event {
//     results: SpeechRecognitionResultList;
//   }

//   interface Window {
//     webkitSpeechRecognition: {
//       new (): SpeechRecognition;
//     };
//   }
// }
// export default function Home() {
//   const [prolileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
//   const { data: session } = useSession();
//   const [showQuiz, setShowQuiz] = useState<boolean>(false);
//   const [userScores, setUserScores] = useState<number | null>(null);
//   const [messages, setMessages] = useState<{ type: string; text: string }[]>(
//     []
//   );
//   const [input, setInput] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [isRecording, setIsRecording] = useState<boolean>(false);
//   const [recordingComplete, setRecdingComplete] = useState<boolean>(false);
//   const [transcript, setTranscript] = useState<string>("");
//   const recognitionRef = useRef<SpeechRecognition | null>(null);
//   const startRecording = () => {
//     setIsRecording(true);
//     const recognition = new window.webkitSpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = true;

//     recognition.onresult = (e: SpeechRecognitionEvent) => {
//       const lastResult = e.results[e.results.length - 1][0].transcript;
//       setTranscript(lastResult);
//     };

//     recognition.start();
//     recognitionRef.current = recognition;
//   };
//   const stopRecording = () => {
//     if(recognitionRef.current){
//       recognitionRef.current.stop();
//       setRecdingComplete(true);
//     }
//     if (transcript.trim() !== "") {
//       setMessages((prev) => [...prev, { type: "user", text: transcript }]);
//       setTranscript(""); 
//       setInput("");
//     }
//   };

//   const handleRecording = () => {
//     setIsRecording(!isRecording);
//     if (!isRecording) {
//       startRecording();
//     } else {
//       stopRecording();
//     }
//   };

//   useEffect(() => {
//     return () => {
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (session?.user?.id) {
//       axios.get("/api/scores")
//         .then(res => {
//           setUserScores(res.data.scores); // your selected column
//         })
//         .catch(err => {
//           console.error("Error fetching user data:", err);
//         });
//     }
//   }, [session]);

//   // const handleSend = () => {
//   //   stopRecording()
//   //   if (!input.trim()) return;

//   //   setMessages((prev) => [...prev, { type: "user", text: input }]);
//   //   setInput("");
//   //   setLoading(true);

//   //   setTimeout(() => {
//   //     setMessages((prev) => [
//   //       ...prev,
//   //       { type: "bot", text: "This is a sample bot reply." },
//   //     ]);
//   //     setLoading(false);
//   //   }, 1500);
//   // };

//   const handleSend = async () => {
//     stopRecording();
//     if (!input.trim()) return;
  
//     setMessages((prev) => [...prev, { type: "user", text: input }]);
//     setInput("");
//     setLoading(true);
  
//     try {
//       const res = await axios.post("http://localhost:8000/generate", {
//         prompt: input
//       });
//       setMessages((prev) => [...prev, { type: "bot", text: res.data.response }]);
//     } catch (err) {
//       console.error("Error getting AI response:", err);
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   const handleKeyDown = (e: {
//     key: string;
//     shiftKey: unknown;
//     preventDefault: () => void;
//   }) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   return (
//     <div className="font-sans flex items-center min-h-screen overflow-hidden">
//       <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none"></div>
//       <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none"></div>

//       <Sidebar/>

//       <main className="relative flex flex-col items-center w-[96%] min-h-screen">
//         <p className="font-sans cursor-pointer absolute top-2 left-4 text-[22px] font-thin">
//           Securum
//         </p>

//         <button onClick={() => setProfileMenuOpen(!prolileMenuOpen)}>
//           <Image
//             className="absolute top-4 right-4 rounded-[20px] cursor-pointer"
//             src={session?.user?.image || "/assets/orb2.png"}
//             alt="User Profile"
//             height={30}
//             width={40}
//           />
//           {prolileMenuOpen && (
//             <ul className="bg-white absolute right-4 top-15 rounded-md text-black w-[200px] p-3 space-y-[15px]">
//               <li className="flex items-center w-full space-x-[8px]">
//                 <User />
//                 <div>
//                   <p>{session?.user?.name || "Guest"}</p>
//                   <small>{session?.user?.email || ""}</small>
//                 </div>
//               </li>
//               <li className="flex items-center w-full space-x-[8px]">
//                 <Bolt /> <p>{userScores !== null && (
//                           <span>{userScores} scores</span>
//                         )}</p>
//               </li>
//               <hr className="h-[0.4px] text-zinc-300" />
//               <li>
//                 {session ? (
//                   <button
//                     onClick={() => signOut()}
//                     className="flex items-center space-x-[8px] cursor-pointer font-medium"
//                   >
//                     <LogOut className="text-red-600" />
//                     <p className="hover:text-red-600">Logout</p>
//                   </button>
//                 ) : (
//                   <Link href="./login">
//                     <div className="flex items-center space-x-[8px] cursor-pointer font-medium">
//                       <LogIn className="text-red-600" />
//                       <p className="hover:text-red-600">LogIn</p>
//                     </div>
//                   </Link>
//                 )}
//               </li>
//             </ul>
//           )}
//         </button>

//         {messages.length === 0 ? (
//           <div className="text-center flex flex-col items-center mt-[100px] w-[800px]">
//             <Image src="/assets/orb2.png" alt="orb" height={200} width={220} />
//             <h1 className="text-[60px] font-medium">
//               Welcome{" "}
//               <span className="underline text-[40px] text-[#7bdcde] font-normal">
//                 {session?.user?.name || "Guest"}
//               </span>
//               !
//             </h1>
//             <h2>
//               Be knowledgeable with <i>Securum</i>
//             </h2>
//           </div>
//         ) : (
//           <div className="text-center flex flex-col items-center mt-[50px] w-[800px]">
//             <div className="w-full relative text-start text-[16px]/[23px]">
//               {messages.map((msg, idx) => (
//                 <div
//                   key={idx}
//                   className={`flex mt-6 ${
//                     msg.type === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <p
//                     className={`p-2 rounded-md max-w-[600px] ${
//                       msg.type === "user" ? "bg-zinc-700" : ""
//                     }`}
//                   >
//                     {msg.text}
//                     {msg.type === "bot" && (
//                       <div className="flex items-center space-x-2 mt-2 ">
//                         <Copy className="size-[16px] text-zinc-400 cursor-pointer" />
//                         <ThumbsUp className="size-[16px] text-green-500 cursor-pointer" />
//                         <ThumbsDown className="size-[16px] text-red-500 cursor-pointer" />
//                         <RefreshCcw className="size-[16px] text-zinc-400 cursor-pointer" />
//                       </div>
//                     )}
//                   </p>
//                 </div>
//               ))}

//               {/* Loading */}
//               {loading && (
//                 <div className="flex justify-start items-center space-x-2 mt-6 text-zinc-400">
//                   <Image
//                     alt="loading"
//                     src="/assets/orb2.png"
//                     width={18}
//                     height={18}
//                     className="animate-spin"
//                   />

//                   <p>I&apos;m thinking...</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         <div
//           className={`bg-[#1c1c1c] w-[800px] h-auto rounded-2xl p-4 mt-[30px] ${
//             messages.length > 0 ? "absolute bottom-8" : ""
//           }`}
//         >
//           <textarea
//             value={input || transcript}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Ask Securum"
//             className="w-full resize-none min-h-[20px] focus:outline-none focus:ring-0 bg-transparent text-white"
//           />
//           <div className="w-full flex justify-between items-center mt-[5px]">
//             <div
//               className={`flex space-x-[8px] text-sm ${
//                 isRecording ? "hidden" : ""
//               }`}
//             >
//               <button className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2 ">
//                 + Add file
//               </button>
//               <button
//                 onClick={() => setShowQuiz(true)}
//                 className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2 flex items-center"
//               >
//                 <Puzzle className="size-[14px] mr-[4px]" /> Take quiz
//               </button>
//             </div>

//             <div className="flex items-center space-x-[10px]">
//               {isRecording ? (
//                 <X
//                   className="size-[20px] text-stone-300 cursor-pointer"
//                   onClick={handleRecording}
//                 />
//               ) : (
//                 <Mic
//                   className="size-[20px] text-stone-300 cursor-pointer"
//                   onClick={handleRecording}
//                 />
//               )}

//               <SendHorizontal
//                 className="size-[20px] text-stone-300 cursor-pointer"
//                 onClick={handleSend}
//               />
//             </div>
//           </div>
//         </div>

//         {showQuiz && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
//             <div className="relative bg-black/60 border border-white/10 rounded-2xl shadow-2xl w-full h-[400px] max-w-4xl p-6 backdrop-blur-md transition-transform transform scale-100 hover:scale-[1.01]">
//               <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none"></div>
//               <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none"></div>
//               <button
//                 onClick={() => setShowQuiz(false)}
//                 className="absolute top-4 right-4 text-red-500 w-8 h-8 flex items-center justify-center hover:text-red-600 transition-colors"
//               >
//                 ✕
//               </button>
//               <Quizz />
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

"use client";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
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
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import Quizz from "./component/quizz";
import Sidebar from "./component/sidebar";

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

  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
    if (!isRecording) startRecording();
    else stopRecording();
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
    stopRecording();
    if (!input.trim() || !session?.user?.id) return;
  
    const newUserMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);
  
    try {
      // Send user input to FastAPI backend
      const res = await axios.post("http://localhost:8000/chat/message", {
        prompt: input,
        user_id: session.user.id,
        session_id: currentSessionId || undefined, // optional for new chat
      });
  
      const botMessage = { type: "bot", text: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
  
      // Update current session if new session was created
      if (!currentSessionId) {
        setCurrentSessionId(res.data.session_id);
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
    } finally {
      setInput("");
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

  return (
    <div className="font-sans flex items-center min-h-screen overflow-hidden">
      <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none"></div>

      <Sidebar onSelectSession={handleSelectSession} />

      <main className="relative flex flex-col items-center w-[96%] min-h-screen">
        <p className="font-sans cursor-pointer absolute top-2 left-4 text-[22px] font-thin">Securum</p>

        <button onClick={() => setProfileMenuOpen(!prolileMenuOpen)}>
          <Image
            className="absolute top-4 right-4 rounded-[20px] cursor-pointer"
            src={session?.user?.image || "/assets/orb2.png"}
            alt="User Profile"
            height={30}
            width={40}
          />
          {prolileMenuOpen && (
            <ul className="bg-white absolute right-4 top-15 rounded-md text-black w-[200px] p-3 space-y-[15px]">
              <li className="flex items-center w-full space-x-[8px]">
                <User />
                <div>
                  <p>{session?.user?.name || "Guest"}</p>
                  <small>{session?.user?.email || ""}</small>
                </div>
              </li>
              <li className="flex items-center w-full space-x-[8px]">
                <Bolt />
                <p>{userScores !== null && <span>{userScores} scores</span>}</p>
              </li>
              <hr className="h-[0.4px] text-zinc-300" />
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
          <div className="text-center flex flex-col items-center mt-[100px] w-[800px]">
            <Image src="/assets/orb2.png" alt="orb" height={200} width={220} />
            <h1 className="text-[60px] font-medium">
              Welcome <span className="underline text-[40px] text-[#7bdcde] font-normal">{session?.user?.name || "Guest"}</span>!
            </h1>
            <h2>
              Be knowledgeable with <i>Securum</i>
            </h2>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center mt-[50px] w-[800px]">
            <div className="w-full relative text-start text-[16px]/[23px]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex mt-6 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <p className={`p-2 rounded-md max-w-[600px] ${msg.type === "user" ? "bg-zinc-700" : ""}`}>
                    {msg.text}
                    {msg.type === "bot" && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Copy className="size-[16px] text-zinc-400 cursor-pointer" />
                        <ThumbsUp className="size-[16px] text-green-500 cursor-pointer" />
                        <ThumbsDown className="size-[16px] text-red-500 cursor-pointer" />
                        <RefreshCcw className="size-[16px] text-zinc-400 cursor-pointer" />
                      </div>
                    )}
                  </p>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start items-center space-x-2 mt-6 text-zinc-400">
                  <Image alt="loading" src="/assets/orb2.png" width={18} height={18} className="animate-spin" />
                  <p>I&apos;m thinking...</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`bg-[#1c1c1c] w-[800px] h-auto rounded-2xl p-4 mt-[30px] ${messages.length > 0 ? "absolute bottom-8" : ""}`}>
          <textarea
            value={input || transcript}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Securum"
            className="w-full resize-none min-h-[20px] focus:outline-none focus:ring-0 bg-transparent text-white"
          />
          <div className="w-full flex justify-between items-center mt-[5px]">
            <div className={`flex space-x-[8px] text-sm ${isRecording ? "hidden" : ""}`}>
              <button className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2">+ Add file</button>
              <button onClick={() => setShowQuiz(true)} className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2 flex items-center">
                <Puzzle className="size-[14px] mr-[4px]" /> Take quiz
              </button>
            </div>

            <div className="flex items-center space-x-[10px]">
              {isRecording ? (
                <X className="size-[20px] text-stone-300 cursor-pointer" onClick={handleRecording} />
              ) : (
                <Mic className="size-[20px] text-stone-300 cursor-pointer" onClick={handleRecording} />
              )}

              <SendHorizontal className="size-[20px] text-stone-300 cursor-pointer" onClick={handleSend} />
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
