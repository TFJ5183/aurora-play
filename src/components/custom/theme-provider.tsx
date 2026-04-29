import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Theme provider
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>): React.JSX.Element {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
