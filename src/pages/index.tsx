import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SettingsDialog } from "@/components/custom/SettingsDialog"
import { NowPlayingCard } from "@/components/custom/NowPlayingCard"
import {
  beginLogin,
  getClientId,
  handleRedirectCallback,
  isAuthenticated,
  logout,
  type NowPlaying,
} from "@/lib/spotify"
import { toast } from "sonner"
import { LogOut, Music2 } from "lucide-react"

export function Index(): React.JSX.Element {
  const [authed, setAuthed] = useState(isAuthenticated())
  const [ready, setReady] = useState(false)
  const [cover, setCover] = useState<string | undefined>()
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    ;(async () => {
      const ok = await handleRedirectCallback()
      if (ok) {
        setAuthed(true)
        toast.success("Connected to Spotify")
      }
      setReady(true)
    })()
  }, [])

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

  const onLogout = () => {
    logout()
    setAuthed(false)
    setCover(undefined)
    toast.success("Logged out")
  }

  const showCoverBg = authed && !!cover

  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-hidden ${showCoverBg ? "" : "aurora-bg"}`}
    >
      {/* Blurred cover background */}
      {showCoverBg && (
        <>
          <div
            key={cover}
            className="absolute inset-0 -z-10 scale-125 bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url(${cover})`,
              filter: `blur(80px) saturate(${isPlaying ? 140 : 0}%) grayscale(${isPlaying ? 0 : 100}%)`,
            }}
          />
          <div className="absolute inset-0 -z-10 bg-background/60 dark:bg-background/70" />
        </>
      )}

      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="glass flex h-9 w-9 items-center justify-center rounded-xl">
            <Music2 className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            Aurora<span className="text-gradient">Play</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {authed && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              onClick={onLogout}
              className="glass rounded-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
          <SettingsDialog />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-2xl">
          {!ready ? null : authed ? (
            <NowPlayingCard
              onTrackChange={(d: NowPlaying | null) => {
                setCover(d?.cover)
                setIsPlaying(!!d?.isPlaying)
              }}
            />
          ) : (
            <div className="glass shadow-glow rounded-[2rem] p-10 text-center">
              <div className="glass mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                <Music2 className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-3xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
                Your <span className="text-gradient">Now Playing</span>,
                <br className="hidden sm:block" /> beautifully.
              </h1>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                Connect your Spotify account to display the song currently
                playing — title, artist, cover and live progress.
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
                    ? "Client ID configured ✓"
                    : "Add your Client ID in Settings first"}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
        Frontend-only · PKCE auth · Tokens stay in your browser
      </footer>
    </div>
  )
}