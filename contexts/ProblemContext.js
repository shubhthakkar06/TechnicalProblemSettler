'use client';
import { createContext, useContext, useState } from 'react';

const ProblemContext = createContext(null);

export function ProblemProvider({ children }) {
  const [problemData, setProblemData] = useState(null);
  const [sessionMeta, setSessionMeta] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('SAVED_QUESTIONS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [myProblems, setMyProblems] = useState(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('MY_PROBLEMS');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const saveQuestion = (q) => {
    setSavedQuestions((prev) => {
      const updated = [...prev, { ...q, id: Date.now().toString() }];
      localStorage.setItem('SAVED_QUESTIONS', JSON.stringify(updated));
      return updated;
    });
  };

  const removeQuestion = (id) => {
    setSavedQuestions((prev) => {
      const updated = prev.filter(q => q.id !== id);
      localStorage.setItem('SAVED_QUESTIONS', JSON.stringify(updated));
      return updated;
    });
  };

  const moveToMyProblems = (id) => {
    const q = savedQuestions.find(q => q.id === id);
    if (!q) return;
    setMyProblems((prev) => {
      // Avoid duplicates
      if (prev.some(p => p.id === id)) return prev;
      const updated = [q, ...prev];
      localStorage.setItem('MY_PROBLEMS', JSON.stringify(updated));
      return updated;
    });
    removeQuestion(id);
  };

  const moveMultipleToMyProblems = (ids) => {
    const questionsToMove = savedQuestions.filter(q => ids.includes(q.id));
    if (questionsToMove.length === 0) return;
    
    setMyProblems((prev) => {
      const existingIds = new Set(prev.map(p => p.id));
      const newQuestions = questionsToMove.filter(q => !existingIds.has(q.id));
      const updated = [...newQuestions, ...prev];
      localStorage.setItem('MY_PROBLEMS', JSON.stringify(updated));
      return updated;
    });
    
    setSavedQuestions((prev) => {
      const updated = prev.filter(q => !ids.includes(q.id));
      localStorage.setItem('SAVED_QUESTIONS', JSON.stringify(updated));
      return updated;
    });
  };



  return (
    <ProblemContext.Provider
      value={{ 
        problemData, setProblemData, 
        sessionMeta, setSessionMeta,
        savedQuestions, saveQuestion, removeQuestion,
        myProblems, moveToMyProblems, moveMultipleToMyProblems
      }}
    >
      {children}
    </ProblemContext.Provider>
  );
}

export function useProblem() {
  const ctx = useContext(ProblemContext);
  if (!ctx) {
    throw new Error('useProblem must be used within ProblemProvider');
  }
  return ctx;
}
