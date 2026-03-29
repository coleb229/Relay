"use client";

import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;

export function useHistory<T>(initialState: T | (() => T)) {
  const [present, setPresent] = useState(initialState);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setPresent((prev) => {
      const next = typeof newState === "function"
        ? (newState as (prev: T) => T)(prev)
        : newState;

      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), prev];
      futureRef.current = [];

      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPresent((prev) => {
      if (pastRef.current.length === 0) return prev;
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [...futureRef.current, prev];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setPresent((prev) => {
      if (futureRef.current.length === 0) return prev;
      const next = futureRef.current[futureRef.current.length - 1];
      futureRef.current = futureRef.current.slice(0, -1);
      pastRef.current = [...pastRef.current, prev];
      return next;
    });
  }, []);

  return { state: present, set, undo, redo, canUndo, canRedo };
}
