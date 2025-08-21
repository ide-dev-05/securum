import React, { useEffect, useState } from "react";
import { X, Menu, SquarePen, Search } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface Session {
  session_id: number;
  title: string;
  created_at: string;
}

interface SidebarProps {
  onSelectSession: (sessionId: number, messages: { role: string; text: string }[]) => void;
}

export default function Sidebar({ onSelectSession }: SidebarProps) {
  const [expand, setExpand] = useState<boolean>(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const { data: session } = useSession();

  const fetchSessions = async () => {
    if (!session?.user?.id) return;

    try {
      const res = await axios.get(`http://localhost:8000/chat/sessions/${session.user.id}`);
      setSessions(res.data || []); // ensure we always have an array
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setSessions([]); // fallback to empty array
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [session]);

  const handleSessionClick = async (sessionId: number) => {
    try {
      // const res = await axios.get(`/api/chat/messages/${sessionId}`);
      const res = await axios.get(`http://localhost:8000/chat/messages/${sessionId}`);
      const messages = res.data.map((m: any) => ({ role: m.role, text: m.content }));
      onSelectSession(sessionId, messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      onSelectSession(sessionId, []); // fallback if messages fail
    }
  };

  return (
    <div className={`${expand ? "w-[17%]" : "w-[4%]"} min-h-screen border-r-[0.5px] border-stone-700 flex flex-col items-start pl-[1%] text-zinc-300`}>
      {expand ? (
        <X className={`mt-3 cursor-pointer ${localStorage.getItem('isDarkMode')=="true" ? "":"text-zinc-600"}`} onClick={() => setExpand(false)} />
      ) : (
        <Menu className={`mt-3 cursor-pointer ${localStorage.getItem('isDarkMode')=="true" ? "":"text-zinc-600"}`} onClick={() => setExpand(true)} />
      )}

      <div className="mt-10 flex flex-col justify-start space-y-[15px]">
        <div
          className="flex items-center justify-around space-x-[5px] w-full cursor-pointer"
          onClick={async () => {
            if (!session?.user?.id) return;
            try {
              const title = "New Chat";
              const res = await axios.post(`http://localhost:8000/chat/session`, { user_id: session.user.id, title });
              onSelectSession(res.data.session_id, []);
              fetchSessions(); 
            } catch (err) {
              console.error("Error creating new chat session:", err);
            }
          }}
        >
          <SquarePen className={`${localStorage.getItem('isDarkMode')=="true"?"":"text-zinc-600"}`} /> <p className={`${expand ? "block" : "hidden"} ${localStorage.getItem('isDarkMode')=="true"?"":"text-zinc-600"}`}>New chat</p>
        </div>

        <div className={`${expand ? "mt-1" : "hidden"} flex flex-col space-y-2 w-full`}>
          {sessions.length === 0 ? (
            <p className="px-2 py-1 text-zinc-500">No sessions yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.session_id}
                className="cursor-pointer hover:bg-zinc-700 px-2 py-1 rounded"
                onClick={() => handleSessionClick(s.session_id)}
              >
                {s.title || `Chat ${s.session_id}`}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
