// Level calculation constants
const BASE_XP = 100;
const GROWTH_FACTOR = 1.5;

export interface LevelState {
  level: number;
  currentXP: number;
  totalXP: number;
  nextLevelXP: number;
}

const STORAGE_KEY = 'pareido_level_state';

const defaultState: LevelState = {
  level: 1,
  currentXP: 0,
  totalXP: 0,
  nextLevelXP: BASE_XP,
};

// Calculate XP required for a specific level
export const getXPForLevel = (level: number): number => {
  if (level === 1) return BASE_XP;
  return Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, level - 1));
};

export const loadLevelState = (): LevelState => {
  if (typeof window === 'undefined') return defaultState;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load level state:', e);
  }
  
  return defaultState;
};

export const saveLevelState = (state: LevelState) => {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    // Dispatch custom event for local updates
    window.dispatchEvent(new CustomEvent('levelStateChanged', { detail: state }));
  } catch (e) {
    console.error('Failed to save level state:', e);
  }
};

export const addXP = (amount: number): LevelState => {
  const currentState = loadLevelState();
  let { level, currentXP, totalXP, nextLevelXP } = currentState;

  totalXP += amount;
  currentXP += amount;

  // Check for level up(s)
  while (currentXP >= nextLevelXP) {
    currentXP -= nextLevelXP;
    level++;
    nextLevelXP = getXPForLevel(level);
  }

  const newState = {
    level,
    currentXP,
    totalXP,
    nextLevelXP
  };

  saveLevelState(newState);
  return newState;
};

// Helper hook for React components
import { useState, useEffect } from 'react';

export const useLevelSystem = () => {
  const [state, setState] = useState<LevelState>(defaultState);

  useEffect(() => {
    setState(loadLevelState());
    
    // Listen for storage events (cross-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };

    // Listen for local custom events (same-tab)
    const handleLocalChange = (e: CustomEvent<LevelState>) => {
      setState(e.detail);
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('levelStateChanged', handleLocalChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('levelStateChanged', handleLocalChange as EventListener);
    };
  }, []);

  const gainXP = (amount: number) => {
    // This will trigger saveLevelState -> dispatchEvent -> update state
    addXP(amount);
  };

  return {
    ...state,
    gainXP,
    progress: (state.currentXP / state.nextLevelXP) * 100
  };
};

