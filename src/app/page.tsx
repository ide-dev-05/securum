import Image from "next/image";

export default function Home() {
  return (
    
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center ">

        <div className="text-center flex flex-col items-center">
          <Image className="" src="/assets/orb2.png" alt="orb" height={200} width={220}></Image>
          <h1 className="text-[60px] font-medium">Welcome <span className="underline text-[40px] text-[#7bdcde]">USERNAME</span>!</h1>
          <h2>Be knowledgable with <i>Securum</i></h2>
        </div>

     
        <div className="bg-[#1c1c1c] w-[800px] h-[100px] rounded-lg  ">
            <input type="text" placeholder="Ask Securum" className="p-4 w-full" />
            <div className="w-full">
              
            </div>
        </div>
        

      </main>
    
    </div>
  );
}

