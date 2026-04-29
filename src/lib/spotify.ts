// Spotify Authorization Code with PKCE — fully frontend.
const CLIENT_ID_KEY = "spotify_client_id"
const TOKEN_KEY = "spotify_access_token"
const REFRESH_KEY = "spotify_refresh_token"
const EXPIRES_KEY = "spotify_expires_at"
const VERIFIER_KEY = "spotify_pkce_verifier"

export const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
].join(" ")

export const getClientId = () => localStorage.getItem(CLIENT_ID_KEY) || ""
export const setClientId = (id: string) =>
  localStorage.setItem(CLIENT_ID_KEY, id.trim())

export const getRedirectUri = () => `${window.location.origin}/`

function base64url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

async function sha256(input: string) {
  return await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
}

function randomString(len = 64) {
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return base64url(arr.buffer).slice(0, len)
}

export async function beginLogin() {
  const clientId = getClientId()
  if (!clientId) throw new Error("Missing Spotify Client ID")

  const verifier = randomString(96)
  const challenge = base64url(await sha256(verifier))
  sessionStorage.setItem(VERIFIER_KEY, verifier)

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    code_challenge_method: "S256",
    code_challenge: challenge,
    scope: SCOPES,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function handleRedirectCallback(): Promise<boolean> {
  const url = new URL(window.location.href)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")
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

function saveTokens(data: {
  access_token: string
  refresh_token?: string
  expires_in: number
}) {
  localStorage.setItem(TOKEN_KEY, data.access_token)
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token)
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000))
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY)
}

export function logout() {
  ;[TOKEN_KEY, REFRESH_KEY, EXPIRES_KEY].forEach((k) =>
    localStorage.removeItem(k)
  )
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY)
  const clientId = getClientId()
  if (!refresh || !clientId) return null
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refresh,
  })
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) return null
  const data = await res.json()
  saveTokens(data)
  return data.access_token
}

async function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem(TOKEN_KEY)
  const exp = Number(localStorage.getItem(EXPIRES_KEY) || 0)
  if (token && Date.now() < exp - 30_000) return token
  return await refreshAccessToken()
}

export interface ArtistRef {
  name: string
  url?: string
}
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

export async function fetchNowPlaying(): Promise<NowPlaying | null> {
  const token = await getValidToken()
  if (!token) return null
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  if (res.status === 204) return null // Nothing playing
  if (res.status === 401) {
    logout()
    return null
  }
  if (!res.ok) return null
  const data = await res.json()
  if (!data || !data.item) return null
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
