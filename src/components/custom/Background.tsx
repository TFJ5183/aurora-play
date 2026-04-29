import { useStore } from "@nanostores/react"
import { $authed, $cover, $isPlaying } from "@/lib/store.ts"
import { ThemeProvider } from "@/components/custom/theme-provider.tsx"
import React from "react"

// Background
export default function Background(): React.JSX.Element | null {
  const cover = useStore($cover)
  const isPlaying = useStore($isPlaying)
  const authed = useStore($authed)

  // If background be displayed
  const showCoverBg: boolean = authed && !!cover

  // No background
  if (!showCoverBg) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div
        key={cover}
        className="absolute inset-0 -z-10 scale-125 bg-cover bg-center transition-all duration-2000"
        style={{
          backgroundImage: `url(${cover})`,
          filter: `blur(25px) saturate(${isPlaying ? 140 : 0}%) grayscale(${isPlaying ? 0 : 100}%)`,
        }}
      />
      <div className="absolute inset-0 -z-10 bg-background/5 dark:bg-background/70" />
    </ThemeProvider>
  )
}
