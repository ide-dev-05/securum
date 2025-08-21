"use client";
import { useEffect, useState } from "react";

export default function Background() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load from localStorage on first render
    const mode = localStorage.getItem("isDarkMode");
    setIsDark(mode === "true");

    // Listen for storage changes (even across tabs)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "isDarkMode") {
        setIsDark(event.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <>
      {isDark ? (
        <div className="absolute top-0 z-[-2] h-screen w-screen 
          bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      ) : (
        <div className="absolute top-0 z-[-2] h-screen w-screen 
          bg-[#f8f8ff] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,200,150,0.4),rgba(255,255,255,0))]"></div>
      )}
    </>
  );
}
