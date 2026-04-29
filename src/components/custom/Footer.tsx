import React from "react"
import { useStore } from "@nanostores/react"
import { $isPlaying } from "@/lib/store.ts"
import { GITHUB_LINK } from "@/lib/utils.ts"

export default function Footer(): React.JSX.Element | null {
  const isPlaying = useStore($isPlaying)

  if (isPlaying) return null

  return (
    <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
      Frontend-only - Tokens stay in your browser -{" "}
      <a href={GITHUB_LINK} className="hover:underline">
        open source
      </a>
    </footer>
  )
}
