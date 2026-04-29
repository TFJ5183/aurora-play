import React, { Fragment, useEffect, useState } from "react"
import { fetchNowPlaying, type NowPlaying } from "@/lib/spotify"
import { Music2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { formatPercentage, usePercentDigits } from "@/lib/preferences" // Formats time

// Formats time
function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`
}

// Props typ
interface Props {
  onTrackChange?: (data: NowPlaying | null) => void
}

// Main component
export function NowPlayingCard({ onTrackChange }: Props): React.JSX.Element {
  const [data, setData] = useState<NowPlaying | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const percentDigits = usePercentDigits()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const d = await fetchNowPlaying()
      if (!mounted) return
      setData(d)
      setLoading(false)
      onTrackChange?.(d)
      // Reset tick when we get fresh data from Spotify
      setTick(0)
    }
    load()
    const poll = setInterval(load, 5000)
    const timer = setInterval(() => setTick((t) => t + 100), 100)
    return () => {
      mounted = false
      clearInterval(poll)
      clearInterval(timer)
    }
  }, [onTrackChange])

  // Calculates progress
  const progress = data?.isPlaying
    ? Math.min(data.progressMs + tick, data.durationMs)
    : (data?.progressMs ?? 0)

  // Skeleton
  if (loading) {
    return (
      <div className="shadow-glow mx-auto h-[400px] w-full max-w-[800px] min-w-[300px] animate-pulse rounded-3xl bg-card/25 p-8 backdrop-blur-2xl" />
    )
  }

  // Nothing playing
  if (!data) {
    return (
      <div className="shadow-glow mx-auto w-full max-w-[500px] rounded-3xl bg-card/25 p-10 text-center backdrop-blur-2xl">
        <div className="shadow-glow mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card/25">
          <Music2 className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">
          Nothing playing
        </h2>
        <p className="text-muted-foreground">
          Start playing a track in Spotify — it will appear here within a few
          seconds.
        </p>
      </div>
    )
  }

  const percentage = data.durationMs ? (progress / data.durationMs) * 100 : 0
  const linkCls = "hover:underline decoration-primary/60 underline-offset-4"

  return (
    <div className="shadow-glow mx-auto flex max-w-[1200px] min-w-[700px] items-center gap-0 overflow-hidden rounded-xl border bg-background/5 dark:bg-card/25 backdrop-blur-2xl">
      {/* Cover container */}
      <div className="relative">
        {/* Cover */}
        {data.cover ? (
          <img
            src={data.cover}
            alt={`${data.album} cover`}
            className="shadow-glow h-52 w-52 rounded-md object-cover transition-transform hover:scale-[1.02] sm:h-60 sm:w-60"
          />
        ) : (
          <div className="flex h-52 w-52 items-center justify-center rounded-2xl bg-muted">
            <Music2 className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Right container */}
      <div className="w-full min-w-0 flex-1 p-5 text-center sm:text-left">
        {/* Album */}
        {data.albumUrl ? (
          <a
            href={data.albumUrl}
            target="_blank"
            rel="noreferrer"
            className={`mb-2 inline-block text-[11px] tracking-[0.2em] text-muted-foreground uppercase ${linkCls}`}
          >
            {data.album}
          </a>
        ) : (
          <p className="mb-2 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            {data.album}
          </p>
        )}
        {/* Title */}
        <h1 className="max-w-max truncate font-mono text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          {data.trackUrl ? (
            <a
              href={data.trackUrl}
              target="_blank"
              rel="noreferrer"
              className={linkCls}
            >
              {data.title}
            </a>
          ) : (
            data.title
          )}
        </h1>
        {/* Artists */}
        <p className="mt-2 overflow-clip text-lg text-muted-foreground">
          {data.artists.map((a, i) => (
            <Fragment key={i}>
              {i > 0 && ", "}
              {a.url ? (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className={linkCls}
                >
                  {a.name}
                </a>
              ) : (
                a.name
              )}
            </Fragment>
          ))}
        </p>

        {/* Progress slider */}
        <div className="mt-8 space-y-2">
          <Progress value={percentage} className="h-1.5 [&>div]:bg-chart-1" />
          <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
            <span>{formatTime(progress)}</span>
            {percentDigits !== -1 && (
              <span className="font-medium text-chart-1">
                {formatPercentage(percentage, percentDigits)}
              </span>
            )}
            <span>{formatTime(data.durationMs)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
