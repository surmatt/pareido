import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes material values to sum between 10 and 20
 */
export function normalizeMaterials(materials: { [key: string]: number }): { [key: string]: number } {
  const keys = ['metal', 'synthetic', 'stone', 'organic', 'fabric'];
  
  // Ensure all keys exist and are numbers
  keys.forEach(k => { 
    if (typeof materials[k] !== 'number') materials[k] = 0; 
  });

  // Calculate current sum
  let total = keys.reduce((sum, k) => sum + materials[k], 0);

  const MIN_TOTAL = 10;
  const MAX_TOTAL = 20;

  // Scale if out of bounds
  if (total < MIN_TOTAL) {
    if (total === 0) {
      // Distribute evenly if 0
      keys.forEach(k => materials[k] = 2);
    } else {
      const factor = MIN_TOTAL / total;
      keys.forEach(k => materials[k] = Math.ceil(materials[k] * factor));
    }
  } else if (total > MAX_TOTAL) {
    const factor = MAX_TOTAL / total;
    keys.forEach(k => materials[k] = Math.floor(materials[k] * factor));
  }

  // Force sum to be within [MIN, MAX] (handling rounding errors)
  total = keys.reduce((sum, k) => sum + materials[k], 0);
  
  if (total < MIN_TOTAL) {
    const diff = MIN_TOTAL - total;
    let maxKey = keys[0];
    keys.forEach(k => { if (materials[k] > materials[maxKey]) maxKey = k; });
    materials[maxKey] += diff;
  } else if (total > MAX_TOTAL) {
    const diff = total - MAX_TOTAL;
    let remainingDiff = diff;
    while (remainingDiff > 0) {
      let maxKey = keys[0];
      keys.forEach(k => { if (materials[k] > materials[maxKey]) maxKey = k; });
      if (materials[maxKey] > 0) {
        materials[maxKey]--;
        remainingDiff--;
      } else {
        break; 
      }
    }
  }

  return materials;
}
