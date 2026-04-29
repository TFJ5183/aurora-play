import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Static variables
export const GITHUB_LINK = "https://github.com/TFJ5183/aurora-play"

// Merges tailwind styles
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
