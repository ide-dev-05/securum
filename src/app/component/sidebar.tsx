
import React from "react";
import {X,Menu,SquarePen,Search} from "lucide-react";

export default function Sidebar() {
    const [expand, setExpand] = React.useState<boolean>(false);
    return(
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
            <SquarePen />{" "}
            <p className={`${expand ? "block" : "hidden"}`}>New chat</p>
          </div>
          <div
            className={`flex items-center justify-around space-x-[5px] w-full cursor-pointer ${
              expand ? "ml-[8px]" : ""
            }`}
          >
            <Search />{" "}
            <p className={`ml-[15px] ${expand ? "block" : "hidden"}`}>
              Search chat
            </p>
          </div>
        </div>
      </div>
    )
}