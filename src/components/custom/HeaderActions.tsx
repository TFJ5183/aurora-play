import { useEffect } from "react"
import { useStore } from "@nanostores/react"
import { SettingsDialog } from "@/components/custom/SettingsDialog.tsx"
import { ThemeProvider } from "@/components/custom/theme-provider.tsx"
import { isAuthenticated } from "@/lib/spotify.ts"
import { $authed, $isPlaying } from "@/lib/store.ts"

export default function HeaderActions() {
  const isPlaying = useStore($isPlaying)
  useStore($authed)
  useEffect(() => {
    $authed.set(isAuthenticated())
  }, [])

  if (isPlaying) return null

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex items-center gap-2">
      </div>
    </ThemeProvider>
  )
}
