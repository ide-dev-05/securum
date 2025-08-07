"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from 'react';
import Image from "next/image";
import { User,SendHorizontal, Menu, SquarePen, Search,Bolt,LogOut,LogIn,X,Puzzle } from 'lucide-react';
import Link from 'next/link'

export default function Home() {
  const [start, setStart] = useState(false);
  const [expand, setExpand] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="font-sans flex items-center min-h-screen overflow-hidden">
       
      <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-18 rounded-full blur-3xl pointer-events-none"></div>
       <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none"></div>


      <div className={`${expand ? 'w-[17%]':'w-[4%]'} min-h-screen border-r-[0.5px] border-stone-700 flex flex-col items-start pl-[1%] text-zinc-300`}>
        {expand ? <X className="mt-3 ml-[10px] cursor-pointer" onClick={() => setExpand(false)} /> : <Menu className="mt-3 cursor-pointer" onClick={() => setExpand(true)} />}

        <div className='mt-10 flex flex-col justify-start space-y-[15px]'>
          <div className="flex items-center justify-around space-x-[5px] w-full cursor-pointer "><SquarePen /> <p className={`${expand ? 'block':'hidden'}`}>New chat</p></div>
          <div className={`flex items-center justify-around space-x-[5px] w-full  cursor-pointer ${expand ? 'ml-[8px]':''}`}><Search /> <p className={`ml-[15px] ${expand ? 'block':'hidden'}`}>Search chat</p></div>
        </div>
      </div>

      <main className="relative flex flex-col items-center w-[96%] min-h-screen">
        <p className="font-sans cursor-pointer absolute top-2 left-4 text-[22px] font-thin">Securum</p>
        
          <Image
            className="absolute top-4 right-4 rounded-[20px] cursor-pointer"
            src={session?.user?.image || "/assets/orb2.png"}
            alt="User Profile"
            height={30}
            width={40}
          />
          <ul className="bg-white absolute right-4 top-15 rounded-md text-black w-[200px] p-3 space-y-[15px]">
              <li className="flex items-center w-full space-x-[8px]">
                <User/>
                <div >
                  <p>{session?.user?.name || "Guest"}</p>
                  <small>{session?.user?.email || ""}</small>
                </div>
              </li>
              <li className="flex items-center w-full space-x-[8px]">
                <Bolt/> <p>12 Scores</p>
              </li>
              <hr className="h-[0.4px] text-zinc-300" />
              <li> 
              {session ? <button
                onClick={() => signOut()}
                className="flex items-center space-x-[8px] cursor-pointer font-medium"
              >
                <LogOut className="text-red-600"/> 
                <p className="hover:text-red-600">Logout</p>
              </button> : <Link href="./Login">
                  <div className="flex items-center space-x-[8px] cursor-pointer font-medium">
                    <LogIn className="text-red-600" />
                    <p className="hover:text-red-600">LogIn</p>
                  </div>
                </Link>}
              </li>
          </ul>

        {start ? (
           <div className="text-center flex flex-col items-center mt-[50px] w-[800px]">
          <div className='w-full relative'>
              <div className='flex justify-end mt-6'>
                <p className='bg-zinc-700 w-auto p-2 rounded-md'>user input</p>
              </div>
              <div className='flex justify-start mt-6'>
                <p className=' text-start max-w-[600px]'>chatbot output (Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste nihil eos magni sed hic eum quas distinctio nesciunt beatae et.)</p>
              </div>
          </div>

          
          <div className='w-full relative'>
              <div className='flex justify-end mt-6'>
                <p className='bg-zinc-700 w-auto p-2 rounded-md'>user input</p>
              </div>
              <div className='flex justify-start mt-6'>
                <p className=' text-start max-w-[600px]'>chatbot output (Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste nihil eos magni sed hic eum quas distinctio nesciunt beatae et.)</p>
              </div>
          </div>

          <div className='w-full relative'>
              <div className='flex justify-end mt-6'>
                <p className='bg-zinc-700 w-auto p-2 rounded-md'>user input</p>
              </div>
              <div className='flex justify-start mt-6'>
                <p className=' text-start max-w-[600px]'>chatbot output (Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste nihil eos magni sed hic eum quas distinctio nesciunt beatae et.)</p>
              </div>
          </div>
        </div>
        ) : (
          <div className="text-center flex flex-col items-center mt-[200px]">
            <Image src="/assets/orb2.png" alt="orb" height={200} width={220} />
            <h1 className="text-[60px] font-medium">
              Welcome{" "}
              <span className="underline text-[40px] text-[#7bdcde] font-normal">
                {session?.user?.name || "Guest"}
              </span>
              !
            </h1>
            <h2>Be knowledgeable with <i>Securum</i></h2>
          </div>
        )}

        <div className={`bg-[#1c1c1c] w-[800px] h-auto rounded-2xl p-4 mt-[30px] ${start ? 'absolute bottom-8' : ''}`}>
          <textarea placeholder="Ask Securum" className="w-full resize-none min-h-[20px] focus:outline-none focus:ring-0"></textarea>
          <div className="w-full flex justify-between items-center mt-[5px]">
            <div className="flex space-x-[8px]">
              <button className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2">+ Add file</button>
              <button className="border border-stone-700 rounded-lg cursor-pointer px-4 py-2 flex items-center"> <Puzzle className="size-[16px] mr-[4px]"/> Take quiz</button>
            </div>
            <SendHorizontal
              className="size-[25px] text-stone-300 cursor-pointer mb-[-10px]"
              onClick={() => setStart(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
