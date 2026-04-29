// User UI preferences stored in localStorage.
import { useEffect, useState } from "react"

export type PercentMode = "hidden" | "digits"
const KEY = "auroraplay_percent_mode"
const DIGITS_KEY = "auroraplay_percent_digits"

export function getPercentMode(): PercentMode {
  const v = localStorage.getItem(KEY)
  return v === "digits" ? "digits" : "hidden"
}

export function setPercentMode(mode: PercentMode) {
  localStorage.setItem(KEY, mode)
  window.dispatchEvent(new CustomEvent("auroraplay:prefs"))
}

export function getPercentDigits(): number {
  const v = Number(localStorage.getItem(DIGITS_KEY))
  if (!v || v < 1 || v > 6) return 3
  return v
}

export function setPercentDigits(n: number) {
  localStorage.setItem(DIGITS_KEY, String(n))
  window.dispatchEvent(new CustomEvent("auroraplay:prefs"))
}

export function usePercentMode(): PercentMode {
  const [mode, setMode] = useState<PercentMode>(getPercentMode())
  useEffect(() => {
    const handler = () => setMode(getPercentMode())
    window.addEventListener("auroraplay:prefs", handler)
    window.addEventListener("storage", handler)
    return () => {
      window.removeEventListener("auroraplay:prefs", handler)
      window.removeEventListener("storage", handler)
    }
  }, [])
  return mode
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
