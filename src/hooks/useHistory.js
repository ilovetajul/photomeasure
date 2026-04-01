import { useState, useCallback } from 'react';

/**
 * Generic undo/redo history manager.
 * Usage:
 *   const { save, undo, redo, canUndo, canRedo } = useHistory();
 *   save({ measurements, reference });
 *   const prev = undo(currentState);  // returns previous state
 */
export default function useHistory() {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Save current state before a change
  const save = useCallback((snapshot) => {
    setUndoStack(s => [...s.slice(-49), snapshot]); // max 50 steps
    setRedoStack([]);
  }, []);

  // Undo: returns the previous snapshot, pushes current onto redo
  const undo = useCallback((currentSnapshot) => {
    if (!undoStack.length) return null;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setRedoStack(r => [currentSnapshot, ...r]);
    return prev;
  }, [undoStack]);

  // Redo: returns the next snapshot, pushes current onto undo
  const redo = useCallback((currentSnapshot) => {
    if (!redoStack.length) return null;
    const next = redoStack[0];
    setRedoStack(r => r.slice(1));
    setUndoStack(s => [...s, currentSnapshot]);
    return next;
  }, [redoStack]);

  return {
    save,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
