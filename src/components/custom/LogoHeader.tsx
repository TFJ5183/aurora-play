import { Music2Icon } from "lucide-react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import { SettingsDialog } from "./SettingsDialog";
import { ThemeProvider } from "./theme-provider";
import React from "react"
import type { NowPlaying } from "@/lib/spotify.ts"
import { useStore } from "@nanostores/react"
import { $isPlaying } from "@/lib/store.ts"

// Props typ
interface Props {
  onTrackChange?: (data: NowPlaying | null) => void;
  isExpanded?: boolean;
}

export default function LogoHeader({ isExpanded = false }: Props): React.JSX.Element {
  const isPlaying = useStore($isPlaying);
  const shouldExpand = isExpanded && !isPlaying;

  // Trigger
  const trigger: React.JSX.Element = (
    <Item
      variant="outline"
      size="default"
      className={`gap-0 max-w-max bg-background/25 font-mono backdrop-blur-2xl cursor-pointer group transition-all duration-300 ease-in-out ${shouldExpand ? "pr-6" : "hover:pr-6"}`}
      role="button"
    >
      <ItemMedia className="size-10 shrink-0">
        <Music2Icon className="text-primary transition-transform group-hover:rotate-12" />
      </ItemMedia>
      <ItemContent className={`overflow-hidden transition-all duration-300 ease-in-out ${shouldExpand ? "w-32 ml-2" : "w-0 p-0 m-0 group-hover:w-32 group-hover:ml-2"}`}>
        <ItemTitle className={`whitespace-nowrap transition-opacity duration-300 ${shouldExpand ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          AuroraPlay
        </ItemTitle>
      </ItemContent>
    </Item>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="absolute top-10 left-10 z-50">
        <SettingsDialog trigger={trigger} />
      </div>
    </ThemeProvider>
  );
}
