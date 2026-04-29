import { useState } from "react";
import { Settings, Copy, Check, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { getClientId, setClientId, getRedirectUri, isAuthenticated } from "@/lib/spotify";
import {
  getPercentMode, setPercentMode, type PercentMode,
  getPercentDigits, setPercentDigits,
} from "@/lib/preferences";
import { toast } from "sonner";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const authed = isAuthenticated();
  const [value, setValue] = useState(getClientId());
  const [pct, setPct] = useState<PercentMode>(getPercentMode());
  const [digits, setDigits] = useState<number>(getPercentDigits());
  const [copied, setCopied] = useState(false);
  const { theme, setTheme } = useTheme();
  const redirect = getRedirectUri();

  const copyRedirect = async () => {
    await navigator.clipboard.writeText(redirect);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const save = () => {
    if (!authed) setClientId(value);
    setPercentMode(pct);
    setPercentDigits(digits);
    toast.success("Settings saved");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings" className="rounded-full glass">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">Settings</DialogTitle>
          <DialogDescription>
            Configure your Spotify connection and display preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Theme */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <RadioGroup value={theme ?? "system"} onValueChange={(v) => setTheme(v)} className="grid grid-cols-3 gap-2">
              {[
                { v: "light", label: "Light", Icon: Sun },
                { v: "dark", label: "Dark", Icon: Moon },
                { v: "system", label: "System", Icon: Monitor },
              ].map(({ v, label, Icon }) => (
                <label key={v} className={`cursor-pointer rounded-xl border p-3 text-sm transition flex items-center gap-2 ${theme === v ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/40"}`}>
                  <RadioGroupItem value={v} id={`theme-${v}`} />
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {!authed && (
            <>
              {/* How to get a Client ID */}
              <section className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
                <h3 className="font-semibold mb-2 tracking-tight">How to get a Spotify Client ID</h3>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                  <li>
                    Go to the{" "}
                    <a className="text-primary underline" href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">
                      Spotify Developer Dashboard
                    </a>{" "}
                    and log in.
                  </li>
                  <li>Click <strong>Create app</strong>. Pick any name and description.</li>
                  <li>
                    Paste this exact <strong>Redirect URI</strong> into the app settings:
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 block rounded-md bg-background px-3 py-2 text-xs break-all border border-border/60">
                        {redirect}
                      </code>
                      <Button type="button" size="icon" variant="outline" onClick={copyRedirect} aria-label="Copy redirect URI">
                        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </li>
                  <li>Select the <strong>Web API</strong> scope, then save.</li>
                  <li>Open your app's <strong>Settings</strong> and copy the <strong>Client ID</strong>. Paste it below.</li>
                </ol>
              </section>

              {/* Client ID */}
              <div className="space-y-2">
                <Label htmlFor="cid">Spotify Client ID</Label>
                <Input id="cid" value={value} onChange={(e) => setValue(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
            </>
          )}

          {/* Percentage display */}
          <div className="space-y-2">
            <Label>Song progress percentage</Label>
            <RadioGroup value={pct} onValueChange={(v) => setPct(v as PercentMode)} className="grid grid-cols-2 gap-2">
              <label className={`cursor-pointer rounded-xl border p-3 text-sm transition ${pct === "hidden" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/40"}`}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="hidden" id="pct-hidden" />
                  <span className="font-medium">Hidden</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground pl-6">No percentage shown</p>
              </label>
              <label className={`cursor-pointer rounded-xl border p-3 text-sm transition ${pct === "digits" ? "border-primary bg-primary/5" : "border-border/60 hover:bg-muted/40"}`}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="digits" id="pct-digits" />
                  <span className="font-medium">Digits</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground pl-6">Show percentage</p>
              </label>
            </RadioGroup>

            {pct === "digits" && (
              <div className="rounded-xl border border-border/60 p-4 mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="digits-slider" className="text-sm">Number of digits</Label>
                  <span className="text-sm tabular-nums text-primary font-medium">
                    {digits} → {digits <= 3
                      ? "042".slice(-digits).padStart(digits, "0") + "%"
                      : (42).toFixed(digits - 3).padStart(digits + 1, "0") + "%"}
                  </span>
                </div>
                <Slider
                  id="digits-slider"
                  min={1}
                  max={6}
                  step={1}
                  value={[digits]}
                  onValueChange={(v) => setDigits(v[0])}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={!authed && !value.trim()} className="rounded-full px-6">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
