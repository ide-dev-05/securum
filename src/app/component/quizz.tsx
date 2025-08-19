"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Quizz() {
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(10);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Fetch quizzes on mount
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await axios.get("/api/quizzes");
        setQuizzes(res.data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      }
    }
    fetchQuizzes();
  }, []);

  // Quiz timer logic
  useEffect(() => {
    if (finished || quizzes.length === 0) return;
    if (timer === 0) {
      goToNextQuiz();
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, finished, quizzes]);

  // Post score when quiz finishes
  useEffect(() => {
    if (finished) {
      async function postScore() {
        try {
          await axios.post("/api/scores", { gainedScore: score });
          console.log("Score updated successfully");
        } catch (error) {
          console.error("Error updating score:", error);
        }
      }
      postScore();
    }
  }, [finished, score]);

  function goToNextQuiz() {
    if (
      selected !== null &&
      selected === quizzes[currentIndex].correct_index
    ) {
      setScore((s) => s + 1);
    }
    if (currentIndex + 1 < quizzes.length) {
      setCurrentIndex((i) => i + 1);
      setTimer(10);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function handleSelect(index: number) {
    if (selected !== null) return;
    if (index === quizzes[currentIndex].correct_index) {
      setScore((s) => s + 1);
    }
    setSelected(index);
    setTimeout(goToNextQuiz, 1000);
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-white text-center mt-20">
        Loading quizzes...
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center text-white mt-20">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <p className="mb-6">Your score: {score} / {quizzes.length}</p>
      </div>
    );
  }

  const quiz = quizzes[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center text-white h-full overflow-y-auto">
      <div
        className="p-6 rounded-lg shadow-lg w-full max-w-lg relative 
        backdrop-blur-md border border-white/10 
        bg-gradient-to-br from-[#1f0030]/75 to-[#0a192f]/75"
      >
        <small className="absolute -top-3 left-58 bg-black/60 px-2 py-0.5 rounded text-xs backdrop-blur-sm">
          {currentIndex + 1} / {quizzes.length}
        </small>

        <p className="text-center mb-2">{quiz.question}</p>
        <p className="text-xs text-center mb-4">Time left: {timer}s</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-lg">
        {quiz.choices.map((option: string, i: number) => {
          const isSelected = selected === i;
          const isCorrect = quiz.correct_index === i;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                selected === null
                  ? "bg-white/10 hover:bg-white/20"
                  : isSelected
                  ? isCorrect
                    ? "bg-green-500"
                    : "bg-red-500"
                  : "bg-white/10"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
