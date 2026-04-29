import React, { useEffect } from "react"
import { useStore } from "@nanostores/react"
import { Button } from "@/components/ui/button.tsx"
import { NowPlayingCard } from "@/components/custom/NowPlayingCard.tsx"
import {
  beginLogin,
  getClientId,
  handleRedirectCallback,
  isAuthenticated,
  type NowPlaying,
} from "@/lib/spotify.ts"
import { toast } from "sonner"
import { Music2 } from "lucide-react"
import { $authed, $cover, $isPlaying, $ready } from "@/lib/store.ts"
import { ThemeProvider } from "@/components/custom/theme-provider.tsx"
import { ShimmeringText } from "@/components/animate-ui/primitives/texts/shimmering.tsx"

export default function MainContent(): React.JSX.Element | null {
  const authed = useStore($authed)
  const ready = useStore($ready)

  // Waits for spotify callback
  useEffect(() => {
    ;(async () => {
      const ok = await handleRedirectCallback()
      if (ok) {
        $authed.set(true)
        toast.success("Connected to Spotify")
      }
      $authed.set(isAuthenticated())
      $ready.set(true)
    })()
  }, [])

  // On login
  const onLogin = async () => {
    if (!getClientId()) {
      toast.error("Add your Spotify Client ID in Settings first")
      return
    }
    try {
      await beginLogin()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  // Code not ready
  if (!ready) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        {authed ? (
          <NowPlayingCard
            onTrackChange={(d: NowPlaying | null) => {
              $cover.set(d?.cover)
              $isPlaying.set(!!d?.isPlaying)
            }}
          />
        ) : (
          <div className="glass shadow-glow rounded-[2rem] p-10 text-center">
            <div className="glass mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Music2 className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
              Your <span className="text-gradient">Now Playing</span>,
              <br className="hidden sm:block" />
              <ShimmeringText text=" beautifully" />.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Connect your Spotify account to display the song currently playing
              - title, artist, cover and live progress.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={onLogin}
                className="shadow-glow h-12 rounded-full px-8"
              >
                Connect Spotify
              </Button>
              <span className="text-xs text-muted-foreground">
                {getClientId()
                  ? "Client ID configured"
                  : "Add your Client ID in Settings first"}
              </span>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  )
}
