import React, { useState, useEffect, useRef } from "react";
import SelectQuestionsTotal from "./SelectQuestionsTotal";
import SelectCategory from "./SelectCategory";
import { ALL_CATEGORIES } from "../constants";
import Results from "./Results";
import shuffle from "../shuffle-arr";

import FCCLogo from "./FCCLogo";
import Questions from "./Questions";
import "../stylesheets/App.css";
import {
  correctModalResponses,
  incorrectModalResponses
} from "../data/modal-responses";
import ButtonLink from "./ButtonLink";
import { Route, Routes, useNavigate } from "react-router-dom";

const QuizTemplate: React.FC = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(ALL_CATEGORIES);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState("");
  const [displayExplanation, setDisplayExplanation] = useState("");
  const [showReference, setShowReference] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [chosenAnswer, setChosenAnswer] = useState("");
  const [chooseAnswer, setChooseAnswer] = useState(false);
  const [show, setShow] = useState(false);
  const selectQuizArr = [10, 25, 50, 100];
  const selectCategoryArr = [
    "HTML",
    "CSS",
    "JavaScript",
    "Accessibility",
    "General CS",
    "IT",
    "Linux",
    "Python",
    "SQL"
  ];
  const [choicesArr, setChoicesArr] = useState<string[][]>([]);
  const currQuestion = quiz[questionNumber - 1];
  const totalQuestions = quiz.length;
  const [filteredQuestions, setFilteredQuestions] = useState(ALL_CATEGORIES);

  const answerButtonsRef = useRef(null);

  //detects if the user tries the refresh the page in the middle of the quiz
  useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    return () => {
      window.removeEventListener("beforeunload", alertUser);
    };
  }, []);

  const alertUser = (e: {
    preventDefault: () => void;
    returnValue: string;
  }) => {
    e.preventDefault();
    e.returnValue = "";
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(0);

  const selectQuiz = (category: string, index: number) => {
    setSelectedCategory(category);
    setSelectedQuiz(selectQuizArr[index]);
    // Filter questions based on the selected category
    const filteredQuiz = ALL_CATEGORIES.filter(q => q.Category === category);
    setFilteredQuestions(filteredQuiz);
    navigate(`/quizzes/${category}/questionsTotal`);
  };

  const startQuiz = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const userAnswer = parseInt(e.currentTarget.value);
    const shuffledQuiz = shuffle(filteredQuestions).slice(0, userAnswer);

    // Shuffle the answer options
    const choicesArr: string[][] = shuffledQuiz.map(obj => {
      const arr = [
        obj.Answer,
        obj.Distractor1,
        obj.Distractor2,
        obj.Distractor3
      ];
      return shuffle<string>(arr);
    });

    setQuiz(shuffledQuiz);
    setChoicesArr(choicesArr);
    navigate(`/quizzes/${selectedCategory}/questions/1/of/${userAnswer}`);
  };

  // Function to start a random quiz
  const startRandomQuiz = () => {
    setSelectedCategory("Random"); // Set the selected category to "Random"
    const randomIndex = Math.floor(Math.random() * selectQuizArr.length);
    setSelectedQuiz(selectQuizArr[randomIndex]);
    // Generate a random set of questions
    const randomQuestions = shuffle(ALL_CATEGORIES).slice(
      0,
      selectQuizArr[randomIndex]
    );
    setQuiz(randomQuestions);
    navigate(`/quizzes/Random/questionsTotal`);
  };

  //function for toggling the react-bootstrap modal
  const handleShow = () => setShow(true);

  const nextQuestion = () => {
    if (questionNumber >= quiz.length) {
      navigate(`/quizzes/${selectedCategory}/results`);
      return;
    }
    setQuestionNumber(curr => curr + 1);
    setChooseAnswer(false);
    navigate(
      `/quizzes/${selectedCategory}/questions/${questionNumber + 1}/of/${
        quiz.length
      }`
    );
  };

  const resetQuiz = () => {
    setSelectedCategory(""); // Reset selected category
    setSelectedQuiz(0); // Reset selected quiz
    // setQuiz(ALL_CATEGORIES);
    setShow(false);
    setChooseAnswer(false);
    setPoints(0);
    setQuestionNumber(1);
    navigate(`/quizzes`);
  };

  const shuffleModalResponses = (responses: string[]) => {
    const shuffleModalArr = shuffle<string>(responses);
    return shuffleModalArr[0];
  };

  const selectOption = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setSelectedOption(e.currentTarget.value);

    // Get answer buttons
    const answerBtns =
      answerButtonsRef.current.getElementsByClassName("answers-btns");

    // Remove previous highlights
    for (const btn of answerBtns) {
      btn.classList.remove("answers-btns--selected");
    }

    // Highlight current option
    e.currentTarget.classList.add("answers-btns--selected");
  };

  const checkAnswer = () => {
    const userAnswer = selectedOption;

    // Ensure option was selected before checking answer
    if (!userAnswer) {
      return;
    }

    setSelectedOption("");
    setChooseAnswer(true);
    setChosenAnswer(userAnswer);
    if (userAnswer !== currQuestion.Answer) {
      setMessage(shuffleModalResponses(incorrectModalResponses));
      setDisplayExplanation(currQuestion.Explanation);
      setShowReference(currQuestion.Link);
      handleShow();
    } else {
      setPoints(curr => curr + 1);
      setMessage(shuffleModalResponses(correctModalResponses));
      setDisplayExplanation(currQuestion.Explanation);
      setShowReference(currQuestion.Link);
      handleShow();
    }
  };

  const selectQuizProps = {
    quiz,
    selectedCategory,
    selectedQuiz
  };

  const modalProps = {
    chosenAnswer,
    message,
    points,
    displayExplanation,
    showReference,
    show,
    nextQuestion
  };

  const resultsProps = {
    points,
    totalQuestions,
    resetQuiz
  };

  const questionProps = {
    currQuestion,
    questionNumber,
    totalQuestions,
    modalProps,
    chooseAnswer,
    points,
    choicesArr,
    selectedOption,
    selectOption,
    checkAnswer,
    answerButtonsRef
  };

  return (
    <>
      <ButtonLink to="/">Home</ButtonLink>
      <FCCLogo />
      <Routes>
        <Route
          path="/"
          element={
            <SelectCategory
              selectQuizNumber={(
                e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
                category: string
              ) => selectQuiz(category, 0)}
              category={selectedCategory}
              selectCategoryArr={selectCategoryArr}
              selectQuiz={selectQuiz}
              startRandomQuiz={startRandomQuiz}
            />
          }
        />
        <Route
          path="/:category/questionsTotal"
          element={
            <SelectQuestionsTotal
              startQuiz={startQuiz}
              totalQuestions={filteredQuestions.length}
              selectQuizArr={selectQuizArr}
              {...selectQuizProps}
            />
          }
        />
        <Route
          path={"/:category/questions/:currentQuestion/of/:total"}
          element={<Questions {...questionProps} {...modalProps} />}
        />
        <Route
          path={"/:category/results"}
          element={<Results {...resultsProps} />}
        />
      </Routes>
    </>
  );
};
export default QuizTemplate;
