import { useEffect, useState } from "react"

// Localstorage key
const DIGITS_KEY = "auroraplay_percent_digits"

// Checks if browser
const isBrowser: boolean = typeof window !== "undefined"

// Formats parentage
export function formatPercentage(value: number, digits: number): string {
  if (digits === -1) return ""
  return value.toFixed(digits) + "%"
}

// Gets percent digits
export function getPercentDigits(): number {
  if (!isBrowser) return 0
  const v = localStorage.getItem(DIGITS_KEY)
  if (v === null) return 0
  const n = Number(v)
  if (isNaN(n) || n < -1 || n > 3) return 0
  return n
}

// Sets percent digits
export function setPercentDigits(n: number): void {
  if (!isBrowser) return
  localStorage.setItem(DIGITS_KEY, String(n))
  window.dispatchEvent(new CustomEvent("auroraplay:prefs"))
}

export function usePercentDigits(): number {
  const [n, setN] = useState<number>(getPercentDigits())
  useEffect(() => {
    const handler = () => setN(getPercentDigits())
    window.addEventListener("auroraplay:prefs", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("auroraplay:prefs", handler)
      window.removeEventListener("storage", handler)
    }
  }, [])
  return n
}
