"use client";
import { useState, useEffect } from "react";

export default function Quizz() {
  const dailyQuestions = [
    { id: 1, question: "What is the capital of France?", options: ["Paris", "London", "Berlin", "Rome"], correctAnswerIndex: 0 },
    { id: 2, question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], correctAnswerIndex: 1 },
    { id: 3, question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctAnswerIndex: 1 },
    { id: 4, question: "Which ocean is the largest?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correctAnswerIndex: 1 },
    { id: 5, question: "Who wrote 'Hamlet'?", options: ["Shakespeare", "Dickens", "Tolstoy", "Hemingway"], correctAnswerIndex: 0 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(10);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    if (timer === 0) {
      goToNextQuestion();
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, );

  function goToNextQuestion() {
    if (selected !== null && selected === dailyQuestions[currentIndex].correctAnswerIndex) {
      setScore((s) => s + 1);
    }
    if (currentIndex + 1 < dailyQuestions.length) {
      setCurrentIndex((i) => i + 1);
      setTimer(10);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function handleSelect(index) {
    if (selected !== null) return;
    if (index === dailyQuestions[currentIndex].correctAnswerIndex) {
      setScore((s) => s + 1);
    }
    setSelected(index);
    setTimeout(goToNextQuestion, 1000);
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center text-white  mt-20">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <p className="mb-6">Your score: {score} / {dailyQuestions.length}</p>
        {/* <button
          onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setTimer(10);
            setSelected(null);
            setFinished(false);
          }}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors duration-200"
        >
          Restart Quiz
        </button> */}
      </div>
    );
  }

  const question = dailyQuestions[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center text-white h-full overflow-y-auto">
  
  <div className="p-6 rounded-lg shadow-lg w-full max-w-lg relative 
        backdrop-blur-md border border-white/10 
        bg-gradient-to-br from-[#1f0030]/75 to-[#0a192f]/75">
  
      <small className="absolute -top-3 left-58 bg-black/60 px-2 py-0.5 rounded text-xs backdrop-blur-sm">
        {currentIndex + 1} / {dailyQuestions.length}
      </small>

      <p className="text-center mb-2">{question.question}</p>
      <p className="text-xs text-center mb-4">Time left: {timer}s</p>
    </div>


     
      <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-lg">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = question.correctAnswerIndex === i;
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
