# CampusOS

AI-powered student operating system. One unified application for academic management, personal finances, campus knowledge, and daily routines.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas
- **Storage:** AWS S3
- **AI:** AWS Bedrock (primary) + Gemini API (fallback)
- **Auth:** Google OAuth + Demo Login

## Project Structure

```
CampusOS/
├── frontend/          # React application
│   └── src/
│       ├── components/   # Shared + Layout components
│       ├── pages/        # Route-level pages
│       ├── hooks/        # Custom React hooks
│       ├── services/     # API service layer
│       ├── context/      # React Context providers
│       ├── config/       # App configuration
│       └── utils/        # Helper utilities
├── backend/           # Express API server
│   └── src/
│       ├── routes/       # Route definitions
│       ├── controllers/  # Request handlers
│       ├── services/     # Business logic
│       ├── models/       # MongoDB schemas
│       ├── middleware/   # Express middleware
│       ├── ai/           # AI service + prompts
│       ├── config/       # Server configuration
│       └── utils/        # Shared utilities
├── seed/              # Demo data seeding
└── docs/              # Documentation
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- AWS account (S3 + Bedrock)
- Google Cloud project (OAuth)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in environment variables
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Fill in environment variables
npm install
npm run dev
```

### Seed Demo Data

```bash
cd backend
npm run seed
```

## Features

- **Dashboard** — Central hub with summaries and quick actions
- **Document Intelligence** — Upload PDF/DOCX, AI extracts structured data
- **Attendance Tracking** — Manual timetable, 5 status states, safe skips calculation
- **Expense Management** — Manual entry + bank statement AI categorization
- **Burnout Detection** — Wellness scoring with notification adjustment
- **AI Chatbot** — Answers from user's own data only
- **Knowledge Hub** — Shared notes, PYQs, professor reviews
- **Notifications** — Priority-based alerts with burnout-aware filtering

## AI Workflow

All AI-generated data follows: **View → Edit → Reject → Confirm → Save**

AI never saves without explicit user confirmation.

## Architecture

- Monolithic (single backend, single frontend)
- REST API with JWT authentication
- User data isolation (every query scoped by userId)
- Bedrock primary → Gemini fallback → Manual entry

## Authors 
Anshuman, Amit, Surabhi
