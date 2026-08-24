// src/contexts/LockContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const LockContext = createContext();

export function LockProvider({ children }) {
  const [lockedStudents, setLockedStudents] = useState(() => {
    try {
      const saved = localStorage.getItem("skpi_locked_students");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load locked students", e);
    }
    return { "Novia Fitriana": false, "Ahmad Rizki": false };
  });

  useEffect(() => {
    try {
      localStorage.setItem("skpi_locked_students", JSON.stringify(lockedStudents));
    } catch (e) {
      console.error("Failed to save locked students", e);
    }
  }, [lockedStudents]);

  const toggleLock = (nama) => {
    setLockedStudents((prev) => ({
      ...prev,
      [nama]: !prev[nama],
    }));
  };

  // For the active student (Novia Fitriana)
  const isLocked = Boolean(lockedStudents["Novia Fitriana"]);

  return (
    <LockContext.Provider
      value={{
        lockedStudents,
        setLockedStudents,
        toggleLock,
        isLocked,
      }}
    >
      {children}
    </LockContext.Provider>
  );
}

export function useLock() {
  const context = useContext(LockContext);
  if (!context) {
    return {
      lockedStudents: { "Novia Fitriana": false },
      setLockedStudents: () => {},
      toggleLock: () => {},
      isLocked: false,
    };
  }
  return context;
}
