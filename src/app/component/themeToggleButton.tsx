"use client";
import { useEffect, useState } from "react";
import { Moon, SunDim } from "lucide-react"; // adjust based on your icons

export default function ThemeToggleButton() {
  const [isDark, setIsDark] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("isDarkMode");
    setIsDark(stored === "true");
  }, []);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem("isDarkMode", newValue.toString());

    // Optional: notify other components/tabs
    window.dispatchEvent(new StorageEvent("storage", { 
      key: "isDarkMode", 
      newValue: newValue.toString() 
    }));
  };

  return (
    <button
      className="text-sm md:text-xl font-light h-full space-x-[8px] cursor-pointer flex items-center group"
      onClick={toggleTheme}
    >
      {isDark ? <SunDim /> : <Moon />}
      {isDark ? (
        <p className="text-[15px] font-medium">Light</p>
      ) : (
        <p className="group-hover:underline text-[15px] font-medium cursor-pointer">
          Dark
        </p>
      )}
    </button>
  );
}
