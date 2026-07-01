# VieChat UI

VieChat is a modern, real-time messaging web application designed for seamless communication in teams and communities. This repository contains the Frontend UI built with React, TypeScript, and Vite.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery and syncing across clients via Socket.IO.
- **Premium User Interface**: Modern "floating card" layout with glassmorphism effects, powered by Tailwind CSS v4 and Shadcn UI.
- **Dark/Light Mode**: Full theme support with automatic system preference detection and manual toggle.
- **Fluid Animations**: Smooth page transitions and layout swaps using Framer Motion (e.g., the signature sliding Auth layout).
- **Direct & Group Chats**: Support for 1-on-1 direct messages and multi-user group conversations.
- **Typing Indicators & Read Receipts**: Real-time feedback for active conversations.
- **Robust State Management**: Powered by TanStack React Query for efficient data caching and synchronization.
- **Mock Mode**: Built-in mock API service allowing the UI to run perfectly for demo purposes even without the backend server.

## 🛠️ Technology Stack

- **Core**: React, TypeScript, Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS v4
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **State/Data Fetching**: TanStack React Query (`@tanstack/react-query`)
- **Real-time Engine**: Socket.IO Client
- **Animations**: Framer Motion
- **Forms & Validation**: React Hook Form, Yup
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the UI folder:
   ```bash
   git clone https://github.com/hungdt31/viechat-ui.git
   cd viechat-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`.

## 🧩 Project Structure

```text
src/
├── assets/          # Static images and icons
├── components/      # Reusable UI components (mostly Shadcn UI)
├── containers/      # Complex feature blocks (Sidebar, ChatWindow, ChatInfo)
├── context/         # React Context providers (Auth, Theme, Socket)
├── hooks/           # Custom React hooks & React Query hooks (mutations/queries)
├── layouts/         # Page layout wrappers (AuthLayout, DashboardLayout)
├── pages/           # Route-level components (Login, Register, Dashboard)
├── routes/          # Application routing definitions
├── services/        # API and Socket configuration (APIManager)
└── lib/             # Utility functions
```

## 🔌 API Integration & Mock Mode

The application uses an `APIManager` (`src/services/APIManager.ts`) for all HTTP requests. 
If the backend servers (`localhost:8080` for API, `localhost:8085` for WebSockets) are unreachable, the UI will automatically fall back to **Mock Mode**. In Mock Mode, network requests are intercepted and simulated with local mock data, allowing you to develop and test the UI without spinning up the backend services.

## 📄 License

&copy; 2026 VieChat Inc. All rights reserved.
