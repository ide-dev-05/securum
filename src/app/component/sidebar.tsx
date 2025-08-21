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
  const [isDark, setIsDark] = useState<boolean>(false);

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
      const res = await axios.get(`http://localhost:8000/chat/messages/${sessionId}`);
      const messages = res.data.map((m: any) => ({ role: m.role, text: m.content }));
      onSelectSession(sessionId, messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      onSelectSession(sessionId, []); // fallback if messages fail
    }
  };

  useEffect(() => {
    const dm = localStorage.getItem("isDarkMode");
    setIsDark(dm === "true");
  }, []);

  return (
    <div
      className={`hidden md:flex shrink-0 min-h-screen border-r border-stone-700
        ${expand ? "w-64" : "w-14"} flex-col items-start pl-2 sm:pl-3
        ${isDark ? "text-zinc-300" : "text-zinc-700 bg-white"} dark:bg-transparent`}
    >
      <div className="mt-3">
        {expand ? (
          <X
            className={`cursor-pointer ${isDark ? "" : "text-zinc-600"}`}
            onClick={() => setExpand(false)}
          />
        ) : (
          <Menu
            className={`cursor-pointer ${isDark ? "" : "text-zinc-600"}`}
            onClick={() => setExpand(true)}
          />
        )}
      </div>

      <div className="mt-6 flex w-full flex-col space-y-3">
        <button
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-zinc-800/10 dark:hover:bg-zinc-700/40 transition"
          onClick={async () => {
            if (!session?.user?.id) return;
            try {
              const title = "New Chat";
              const res = await axios.post(`http://localhost:8000/chat/session`, {
                user_id: session.user.id,
                title,
              });
              onSelectSession(res.data.session_id, []);
              fetchSessions();
            } catch (err) {
              console.error("Error creating new chat session:", err);
            }
          }}
        >
          <SquarePen className={`${isDark ? "" : "text-zinc-600"}`} />
          <p className={`${expand ? "block" : "hidden"} ${isDark ? "" : "text-zinc-700"}`}>
            New chat
          </p>
        </button>

        <div
          className={`${expand ? "mt-1" : "hidden"} flex max-h-[calc(100vh-140px)] flex-col space-y-1 overflow-y-auto w-full pr-2`}
        >
          {sessions.length === 0 ? (
            <p className="px-2 py-1 text-zinc-500">No sessions yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.session_id}
                className="cursor-pointer rounded px-2 py-1 text-sm hover:bg-zinc-800/10 dark:hover:bg-zinc-700/40 truncate"
                title={s.title || `Chat ${s.session_id}`}
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
