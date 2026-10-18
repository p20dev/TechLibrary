import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Shared by the shadcn-style primitives so consumers can safely compose classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
