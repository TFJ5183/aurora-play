import { useEffect, useState, Fragment } from "react";
import { fetchNowPlaying, type NowPlaying } from "@/lib/spotify";
import { Music2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { usePercentMode, usePercentDigits } from "@/lib/preferences";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

interface Props {
  onTrackChange?: (data: NowPlaying | null) => void;
}

export function NowPlayingCard({ onTrackChange }: Props) {
  const [data, setData] = useState<NowPlaying | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const percentMode = usePercentMode();
  const percentDigits = usePercentDigits();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const d = await fetchNowPlaying();
      if (!mounted) return;
      setData(d);
      setLoading(false);
      onTrackChange?.(d);
    };
    load();
    const poll = setInterval(load, 2000);
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { mounted = false; clearInterval(poll); clearInterval(timer); };
  }, [onTrackChange]);

  const progress = data?.isPlaying
    ? Math.min(data.progressMs + tick * 1000, data.durationMs)
    : data?.progressMs ?? 0;

  if (loading) {
    return <div className="glass rounded-3xl p-8 w-full animate-pulse h-[420px]" />;
  }

  if (!data) {
    return (
      <div className="glass rounded-3xl p-10 w-full text-center shadow-glow">
        <div className="mx-auto w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4">
          <Music2 className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 tracking-tight">Nothing playing</h2>
        <p className="text-muted-foreground">
          Start playing a track in Spotify — it will appear here within a few seconds.
        </p>
      </div>
    );
  }

  const pct = data.durationMs ? (progress / data.durationMs) * 100 : 0;
  const pctLabel = pct.toFixed(Math.max(0, percentDigits - 3)).padStart(percentDigits + (percentDigits > 3 ? 1 : 0), "0");
  // Simpler: format as fixed integer or with decimals
  const formatPct = (digits: number) => {
    if (digits <= 3) {
      return String(Math.min(100, Math.floor(pct))).padStart(digits, "0");
    }
    const decimals = digits - 3;
    return Math.min(100, pct).toFixed(decimals).padStart(digits + 1, "0");
  };

  const linkCls = "hover:underline decoration-primary/60 underline-offset-4";

  return (
    <div className="glass rounded-[2rem] p-6 sm:p-10 w-full shadow-glow">
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <div className="relative shrink-0">
          {data.cover ? (
            <a href={data.trackUrl} target="_blank" rel="noreferrer" aria-label="Open track in Spotify">
              <img
                src={data.cover}
                alt={`${data.album} cover`}
                className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl object-cover shadow-glow ring-1 ring-white/10 transition-transform hover:scale-[1.02]"
              />
            </a>
          ) : (
            <div className="w-52 h-52 rounded-2xl bg-muted flex items-center justify-center">
              <Music2 className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {data.isPlaying && (
            <span className="absolute -bottom-2 -right-2 glass rounded-full px-3 py-1 text-[11px] font-medium text-primary flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Live
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full text-center sm:text-left">
          {data.albumUrl ? (
            <a href={data.albumUrl} target="_blank" rel="noreferrer" className={`text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2 inline-block ${linkCls}`}>
              {data.album}
            </a>
          ) : (
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{data.album}</p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight truncate">
            {data.trackUrl ? (
              <a href={data.trackUrl} target="_blank" rel="noreferrer" className={linkCls}>{data.title}</a>
            ) : data.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground truncate">
            {data.artists.map((a, i) => (
              <Fragment key={i}>
                {i > 0 && ", "}
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noreferrer" className={linkCls}>{a.name}</a>
                ) : a.name}
              </Fragment>
            ))}
          </p>

          <div className="mt-8 space-y-2">
            <Progress value={pct} className="h-1.5" />
            <div className="flex justify-between items-center text-xs tabular-nums text-muted-foreground">
              <span>{fmt(progress)}</span>
              {percentMode === "digits" && (
                <span className="text-primary font-medium">{formatPct(percentDigits)}%</span>
              )}
              <span>{fmt(data.durationMs)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
