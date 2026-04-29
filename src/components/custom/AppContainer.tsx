import { useStore } from "@nanostores/react";
import { $authed, $cover } from "@/lib/store.ts";
import React from "react"

export default function AppContainer({ children }: { children: React.ReactNode }): React.JSX.Element {
  const authed = useStore($authed);
  const cover = useStore($cover);
  const showCoverBg = authed && !!cover;

  return (
    <div className={`relative flex min-h-screen flex-col overflow-hidden ${showCoverBg ? "" : "aurora-bg"}`}>
      {children}
    </div>
  );
}
