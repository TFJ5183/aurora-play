// Localstorage keys
const CLIENT_ID_KEY = "spotify_client_id"
const TOKEN_KEY = "spotify_access_token"
const REFRESH_KEY = "spotify_refresh_token"
const EXPIRES_KEY = "spotify_expires_at"
const VERIFIER_KEY = "spotify_pkce_verifier"

// Spotify scopes
export const SCOPES: string = [
  "user-read-currently-playing",
  "user-read-playback-state",
].join(" ")

// Checks if is browser
const isBrowser = typeof window !== "undefined"

export const getClientId = () =>
  isBrowser ? localStorage.getItem(CLIENT_ID_KEY) || "" : ""
export const setClientId = (id: string) =>
  isBrowser && localStorage.setItem(CLIENT_ID_KEY, id.trim())

// Gets redirect uri
export const getRedirectUri = () =>
  isBrowser ? `${window.location.origin}/` : ""

function base64url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

// Hashes to SHA256
async function sha256(input: string) {
  return await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
}

// Generates random string
function randomString(len = 64): string {
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return base64url(arr.buffer).slice(0, len)
}

// Starts login
export async function beginLogin() {
  const clientId = getClientId()
  if (!clientId) throw new Error("Missing Spotify Client ID")

  const verifier = randomString(96)
  const challenge = base64url(await sha256(verifier))
  sessionStorage.setItem(VERIFIER_KEY, verifier)

  // Generates parms
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: SCOPES,
  })

  // Redirect
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

// Handles redirect callback
export async function handleRedirectCallback(): Promise<boolean> {
  const url = new URL(window.location.href)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")

  // Failed
  if (error) {
    console.error("Spotify auth error:", error)
    window.history.replaceState({}, "", url.pathname)
    return false
  }
  if (!code) return false

  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  const clientId = getClientId()
  if (!verifier || !clientId) return false

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: verifier,
  })

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  const data = await res.json()
  if (!res.ok) {
    console.error("Token exchange failed", data)
    window.history.replaceState({}, "", url.pathname)
    return false
  }
  saveTokens(data)
  sessionStorage.removeItem(VERIFIER_KEY)
  window.history.replaceState({}, "", url.pathname)
  return true
}

// Saves token
function saveTokens(data: {
  access_token: string
  refresh_token?: string
  expires_in: number
}): void {
  if (!isBrowser) return
  localStorage.setItem(TOKEN_KEY, data.access_token)
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token)
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000))
}

// Checks if user is authenticated
export function isAuthenticated(): boolean {
  return isBrowser ? !!localStorage.getItem(TOKEN_KEY) : false
}

// Logs out user
export function logout(): void {
  if (!isBrowser) return
  ;[TOKEN_KEY, REFRESH_KEY, EXPIRES_KEY].forEach((k) =>
    localStorage.removeItem(k)
  )
}

// Refreshes access token
async function refreshAccessToken(): Promise<string | null> {
  if (!isBrowser) return null
  const refresh = localStorage.getItem(REFRESH_KEY)
  const clientId = getClientId()
  if (!refresh || !clientId) return null
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refresh,
  })

  // Fetch
  const res: Response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })

  // Request not okay
  if (!res.ok) {
    return null
  }

  // Parses data
  const data = await res.json()

  // Saves token
  saveTokens(data)

  // Returns access token
  return data.access_token
}

// Gets or create valid token
async function getValidToken(): Promise<string | null> {
  if (!isBrowser) return null
  const token: string | null = localStorage.getItem(TOKEN_KEY)
  const expires: number = Number(localStorage.getItem(EXPIRES_KEY) || 0)
  if (token && Date.now() < expires - 30_000) return token
  return await refreshAccessToken()
}

// Artist typ
export interface ArtistRef {
  name: string
  url?: string
}

// Not playing typ
export interface NowPlaying {
  isPlaying: boolean
  title: string
  artists: ArtistRef[]
  album: string
  albumUrl?: string
  cover?: string
  progressMs: number
  durationMs: number
  trackUrl?: string
}

// Fetches play state
export async function fetchNowPlaying(): Promise<NowPlaying | null> {
  const token = await getValidToken()
  if (!token) return null

  // Fetches api
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  // Nothing playing
  if (res.status === 204) {
    return null
  }

  // Not authorized
  if (res.status === 401) {
    logout()
    return null
  }

  // Request not okay
  if (!res.ok) {
    return null
  }

  // Parses data
  const data = await res.json()

  // No data received
  if (!data || !data.item) {
    return null
  }

  // Creates entity
  return {
    isPlaying: !!data.is_playing,
    title: data.item.name,
    artists: (data.item.artists || []).map((a: any) => ({
      name: a.name,
      url: a.external_urls?.spotify,
    })),
    album: data.item.album?.name ?? "",
    albumUrl: data.item.album?.external_urls?.spotify,
    cover: data.item.album?.images?.[0]?.url,
    progressMs: data.progress_ms ?? 0,
    durationMs: data.item.duration_ms ?? 0,
    trackUrl: data.item.external_urls?.spotify,
  }
}
