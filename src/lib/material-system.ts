// Material system constants
export interface MaterialState {
  metal: number;
  synthetic: number;
  stone: number;
  organic: number;
  fabric: number;
}

const STORAGE_KEY = 'pareido_material_state';

const defaultState: MaterialState = {
  metal: 0,
  synthetic: 0,
  stone: 0,
  organic: 0,
  fabric: 0,
};

export const loadMaterialState = (): MaterialState => {
  if (typeof window === 'undefined') return defaultState;
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load material state:', e);
  }
  
  return defaultState;
};

export const saveMaterialState = (state: MaterialState) => {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    // Dispatch custom event for local updates
    window.dispatchEvent(new CustomEvent('materialStateChanged', { detail: state }));
  } catch (e) {
    console.error('Failed to save material state:', e);
  }
};

export const addMaterials = (materials: Partial<MaterialState>): MaterialState => {
  const currentState = loadMaterialState();
  
  const newState = {
    metal: currentState.metal + (materials.metal || 0),
    synthetic: currentState.synthetic + (materials.synthetic || 0),
    stone: currentState.stone + (materials.stone || 0),
    organic: currentState.organic + (materials.organic || 0),
    fabric: currentState.fabric + (materials.fabric || 0),
  };

  saveMaterialState(newState);
  return newState;
};

// Helper hook for React components
import { useState, useEffect } from 'react';

export const useMaterialSystem = () => {
  const [state, setState] = useState<MaterialState>(defaultState);

  useEffect(() => {
    setState(loadMaterialState());
    
    // Listen for storage events (cross-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };

    // Listen for local custom events (same-tab)
    const handleLocalChange = (e: CustomEvent<MaterialState>) => {
      setState(e.detail);
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('materialStateChanged', handleLocalChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('materialStateChanged', handleLocalChange as EventListener);
    };
  }, []);

  const gainMaterials = (materials: Partial<MaterialState>) => {
    addMaterials(materials);
  };

  return {
    ...state,
    gainMaterials,
  };
};

