"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import {
  User,
  SendHorizontal,
  Menu,
  SquarePen,
  Search,
  Bolt,
  LogOut,
  LogIn,
  X,
  Puzzle,
  Mic
} from "lucide-react";
import Link from "next/link";
import Quizz from "./component/quizz";

export default function Home() {
  const [prolileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expand, setExpand] = useState(false);
  const { data: session } = useSession();

  const [showQuiz, setShowQuiz] = useState(false);

 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

 
  const handleSend = () => {
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
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="font-sans flex items-center min-h-screen overflow-hidden">

      <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none"></div>

      <div
        className={`${
          expand ? "w-[17%]" : "w-[4%]"
        } min-h-screen border-r-[0.5px] border-stone-700 flex flex-col items-start pl-[1%] text-zinc-300`}
      >
        {expand ? (
          <X
            className="mt-3 ml-[10px] cursor-pointer"
            onClick={() => setExpand(false)}
          />
        ) : (
          <Menu
            className="mt-3 cursor-pointer"
            onClick={() => setExpand(true)}
          />
        )}

        <div className="mt-10 flex flex-col justify-start space-y-[15px]">
          <div className="flex items-center justify-around space-x-[5px] w-full cursor-pointer ">
            <SquarePen /> <p className={`${expand ? "block" : "hidden"}`}>New chat</p>
          </div>
          <div
            className={`flex items-center justify-around space-x-[5px] w-full cursor-pointer ${
              expand ? "ml-[8px]" : ""
            }`}
          >
            <Search /> <p className={`ml-[15px] ${expand ? "block" : "hidden"}`}>Search chat</p>
          </div>
        </div>
      </div>

 
      <main className="relative flex flex-col items-center w-[96%] min-h-screen">
        <p className="font-sans cursor-pointer absolute top-2 left-4 text-[22px] font-thin">
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
            <ul className="bg-white absolute right-4 top-15 rounded-md text-black w-[200px] p-3 space-y-[15px]">
              <li className="flex items-center w-full space-x-[8px]">
                <User />
                <div>
                  <p>{session?.user?.name || "Guest"}</p>
                  <small>{session?.user?.email || ""}</small>
                </div>
              </li>
              <li className="flex items-center w-full space-x-[8px]">
                <Bolt /> <p>12 Scores</p>
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
              Welcome{" "}
              <span className="underline text-[40px] text-[#7bdcde] font-normal">
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
            <div className="w-full relative">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mt-6 ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <p
                    className={`p-2 rounded-md max-w-[600px] ${
                      msg.type === "user" ? "bg-zinc-700" : ""
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div className="flex justify-start items-center space-x-2 mt-6 text-zinc-400">
                  <Image alt="loading" src="/assets/orb2.png" width={18} height={18} className="animate-spin"/>
                 
                  <p>I'm thinking...</p>
                </div>
              )}
            </div>
          </div>
        )}


 
        <div
          className={`bg-[#1c1c1c] w-[800px] h-auto rounded-2xl p-4 mt-[30px] ${
            messages.length > 0 ? "absolute bottom-8" : ""
          }`}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Securum"
            className="w-full resize-none min-h-[20px] focus:outline-none focus:ring-0 bg-transparent text-white"
          />
          <div className="w-full flex justify-between items-center mt-[5px]">
            <div className="flex space-x-[8px]">
              <button className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2">
                + Add file
              </button>
              <button
                onClick={() => setShowQuiz(true)}
                className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2 flex items-center"
              >
                <Puzzle className="size-[16px] mr-[4px]" /> Take quiz
              </button>
            </div>
       
            <div className="flex items-center space-x-[10px]">
              <Mic className="size-[20px] text-stone-300 cursor-pointer" />
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
