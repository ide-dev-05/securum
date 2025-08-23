"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { LogOut, LogIn, Bolt, Moon, SunDim } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type Props = {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
  userScores: number | null;
  isDark: boolean;
  signOut: () => void;
};

export default function ProfileMenu({
  session,
  userScores,
  signOut,
}: Props) {
  const name = session?.user?.name || "Guest";
  const email = session?.user?.email || "";
  const img = session?.user?.image || "/assets/orb2.png";
  const initials =
    name?.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() || "U";


  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = theme === "system" ? systemTheme : theme;
  const dark = current === "dark";

  return (
    <div className="absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="p-0 h-auto w-auto rounded-[20px]"
            aria-label="Open profile menu"
          >
            <Avatar className="h-10 w-10 rounded-[20px]">
              <AvatarImage src={img} alt="User Profile" />
              <AvatarFallback className="rounded-[20px]">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-60 p-0 rounded-2xl border border-border/60 bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-md overflow-hidden"
        >
          {/* Header */}
          <DropdownMenuLabel className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 rounded-xl">
                <AvatarImage src={img} alt="User Profile" />
                <AvatarFallback className="rounded-xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{name}</p>
                {email ? (
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                ) : null}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />
          <DropdownMenuItem className="gap-2 px-4 py-3">
            <Bolt className="h-4 w-4 opacity-80" />
            <span className="truncate">
              {userScores !== null ? `${userScores} scores` : "No scores"}
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="px-4 py-2">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(dark ? "light" : "dark")}
                className="w-full inline-flex items-center gap-2 rounded-md text-sm
                           hover:bg-accent transition-colors"
                aria-pressed={dark}
              >
                {dark ? <SunDim className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="truncate">{dark ? "Light" : "Dark"}</span>
              </button>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/60" />
          {session ? (
            <DropdownMenuItem
              onClick={signOut}
              className="px-4 py-2 gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild className="px-4 py-2 gap-2">
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-destructive" />
                <span className="hover:text-destructive">Log In</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
