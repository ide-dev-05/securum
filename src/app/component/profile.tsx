import Link from "next/link";
import Image from "next/image";
import React from "react";
import { User, Bolt, LogOut, LogIn,Sun } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Profile({ session }) {
  
    const [prolileMenuOpen, setProfileMenuOpen] = React.useState<boolean>(false);

    return(
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
            <li>
              <Sun/>
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
    )
}