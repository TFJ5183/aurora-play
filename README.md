# 🌌 Aurora Play

Aurora Play is a sleek, web-based Spotify "Now Playing" dashboard built with **Astro**, **React**, and **Tailwind CSS**. It provides a real-time view of your current Spotify playback with a focus on aesthetics and customization.

## Features

- **Real-time Synchronization**: Automatically updates when you change tracks or pause.
- **Spotify PKCE Auth**: Secure client-side authentication - no backend required.

- **Customizable Progress**: Toggle and adjust the precision of the song progress percentage.
- **Theme Support**: Light, dark, and system theme synchronization.

## 🚀 Tech Stack

- **Framework**: [Astro 5](https://astro.build/)
- **UI Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Nano Stores](https://github.com/nanostores/nanostores)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)

## 📋 Requirements

- [Node.js](https://nodejs.org/) (v18.17.1 or higher)
- [npm](https://www.npmjs.com/)
- A Spotify account

## 🛠️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/aurora-play.git
   cd aurora-play
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the app**:
   Open your browser and navigate to `http://localhost:4321`.

## ⚙️ Configuration (Spotify Setup)

To connect your Spotify account, you need a **Client ID** from the Spotify Developer Dashboard.

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a new app.
3. In the app settings, add `http://localhost:4321/` (or your production URL) to the **Redirect URIs**.
4. Enable the **Web API** scope.
5. Copy your **Client ID**.
6. In Aurora Play, open the **Settings** (gear icon) and paste your Client ID.
7. Click **Save** and then log in with your Spotify account.

## 📜 Scripts

| Script              | Description                                                |
|:--------------------|:-----------------------------------------------------------|
| `npm run dev`       | Starts the development server at `localhost:4321`.         |
| `npm run build`     | Builds the production-ready site in the `dist/` directory. |
| `npm run preview`   | Previews the production build locally.                     |
| `npm run lint`      | Runs ESLint to check for code quality issues.              |
| `npm run format`    | Formats code using Prettier.                               |
| `npm run typecheck` | Runs Astro and TypeScript type checks.                     |

## 📂 Project Structure

```text
aurora-play/
├── public/          # Static assets
├── src/
│   ├── components/  # UI components (shadcn/ui & custom)
│   ├── layouts/     # Astro layouts
│   ├── lib/         # Logic (Spotify API, stores, preferences)
│   ├── pages/       # Astro pages (entry points)
│   └── styles/      # Global CSS and Tailwind configuration
├── astro.config.mjs # Astro configuration
├── package.json     # Project dependencies and scripts
└── tsconfig.json    # TypeScript configuration
```

## 🧪 Tests

> [!IMPORTANT]
> TODO: Add automated tests (e.g., Vitest, Playwright).

Currently, manual verification is used to ensure functionality. Run `npm run lint` and `npm run typecheck` to ensure code consistency.

## 🔑 Environment Variables

This project primarily uses `localStorage` for client-side configuration (like the Spotify Client ID). No server-side `.env` variables are strictly required for basic deployment.

## 📄 License

TODO: Add license information (e.g., MIT).
