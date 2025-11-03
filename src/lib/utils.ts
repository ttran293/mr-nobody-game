import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function emotionToImage(emotion: string): string | null {
  switch (emotion) {
    case "happy":
      return "/emoji/smile.png"
    case "angry":
      return "/emoji/angry.png"
    case "sad":
      return null // add an image at public/emoji/sad.png when available
    default:
      return null
  }
}
