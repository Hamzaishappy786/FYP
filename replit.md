# DoctorPath AI

An AI-powered oncology support platform that helps doctors with cancer diagnosis, patient management, and treatment recommendations using AI-powered tools.

## Overview

DoctorPath AI is a medical platform designed to assist oncologists with:
- AI-powered cancer risk assessment for liver, lung, and breast cancer
- Patient management and appointment scheduling
- AI chatbot for medical information (powered by Google Gemini)
- Knowledge graph visualization for treatment paths

## How to Run Locally

### Prerequisites
- Node.js 20 or higher
- PostgreSQL database

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DoctorPath-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with the following:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/doctorpath
   GEMINI_API_KEY=your_gemini_api_key
   SESSION_SECRET=your_session_secret
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed the hospitals data**
   After starting the app, visit `/api/seed/hospitals` once to populate hospital data.

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run db:push` | Push database schema changes |
| `npm run check` | Run TypeScript type checking |

## Project Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript, Vite, TailwindCSS, Radix UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Google Gemini API for chatbot functionality

### Directory Structure
```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/           # Backend Express application
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle schema definitions
└── attached_assets/  # Static assets (images, logos)
```

## User Preferences

- The application is free for all users (no trial limitations)
- Uses the DoctorPath AI logo for branding
- AI chatbot provides medical guidance using Gemini API

## Recent Changes

- Configured PostgreSQL database
- Integrated Google Gemini API for AI chatbot
- Removed free trial messaging - the app is free for all users
- Updated branding with custom logo
