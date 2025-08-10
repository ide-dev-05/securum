"use client";
import { useState, useEffect } from "react";

export default function Quizz() {
  const dailyQuestions = [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Rome"],
      correctAnswerIndex: 0,
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      correctAnswerIndex: 1,
    },
    {
      id: 3,
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswerIndex: 1,
    },
    {
      id: 4,
      question: "Which ocean is the largest?",
      options: ["Atlantic", "Pacific", "Indian", "Arctic"],
      correctAnswerIndex: 1,
    },
    {
      id: 5,
      question: "Who wrote 'Hamlet'?",
      options: ["Shakespeare", "Dickens", "Tolstoy", "Hemingway"],
      correctAnswerIndex: 0,
    },
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

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  },);


  function goToNextQuestion() {
    if (selected !== null) {
      if (selected === dailyQuestions[currentIndex].correctAnswerIndex) {
        setScore((s) => s + 1);
      }
    }
    if (currentIndex + 1 < dailyQuestions.length) {
      setCurrentIndex((i) => i + 1);
      setTimer(10);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  // Handle selecting an answer
  function handleSelect(index) {
    if (selected !== null) return;
    setScore((s) => s + (index === dailyQuestions[currentIndex].correctAnswerIndex ? 1 : 0));
    setSelected(index);
    setTimeout(goToNextQuestion, 1000);
  }

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black/40">
        <h2 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h2>
        <p className="text-lg text-white mb-6">
          Your score: {score} / {dailyQuestions.length}
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setTimer(10);
            setSelected(null);
            setFinished(false);
          }}
          className="bg-blue-600 px-6 py-3 rounded text-white hover:bg-blue-700"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  const question = dailyQuestions[currentIndex];

  return (
    <div className="min-h-screen relative">
      <div className="absolute top-[-40px] right-0 w-80 h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-transparent opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute z-[-1] bottom-0 left-[-130px] w-90 h-60 bg-gradient-to-tl from-purple-500 via-pink-600 to-transparent opacity-15 rounded-t-full blur-3xl pointer-events-none"></div>
      <div
        className="flex flex-col items-center justify-center mt-20 
      bg-black/30 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md mx-auto relative"
      >
        <small className="rounded-md bg-black/60 backdrop-blur-sm px-2 absolute -top-2 right-50 text-xs text-white">
          1/4
        </small>
        <p className="mt-2 text-white text-center">{question.question}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-6 w-full ">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = question.correctAnswerIndex === i;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`px-4 py-2 rounded-lg border text-white text-center transition-colors duration-200 ${
                  
                    selected === null
                      ? "bg-white/10 hover:bg-white/20"
                      : isSelected
                      ? isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
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
