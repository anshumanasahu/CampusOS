# CampusOS — Low Level Design (Approved)

> Generated from: PRD v1.0, User Flow v1.0, TRD v1.0
> Status: APPROVED
> Date: 2026-06-13

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
User (Browser)
      │ HTTPS
      ▼
Frontend (React + Vite + Tailwind) — Vercel
      │ REST API
      ▼
Backend (Node.js + Express) — Render/EC2
      │         │         │
      ▼         ▼         ▼
  MongoDB    AWS S3    AI Service
  Atlas     (Storage)  (Bedrock → Gemini)
```

### 1.2 Architecture Type
- Monolithic
- REST API
- Controller → Service → Model
- Desktop-first responsive

### 1.3 Module Relationships

- Auth → All modules (gate)
- Dashboard ← All modules (reads)
- Documents → Notifications (extracted deadlines)
- Attendance → Dashboard, Burnout
- Expenses (+ Budget) → Dashboard, Burnout, Notifications
- Knowledge Hub → Dashboard (Senior Points), Chatbot
- Burnout → Dashboard, Notification priority
- Chatbot ← All data (read-only)
- Notifications ← Documents, Attendance, Expenses, Burnout

### 1.4 AI Flow

1. User triggers AI action
2. Backend builds prompt (system + context + task + output schema)
3. Call Bedrock (10s timeout)
4. Failure → retry once → failure → call Gemini
5. Parse response as JSON
6. Validate JSON structure
7. Return to frontend as "review" state
8. User: View → Edit → Reject → Confirm
9. On confirm: Service saves to DB

---

## 2. Frontend Design

### 2.1 Routes

| Path | Component | Type |
|------|-----------|------|
| `/` | LandingPage | Public |
| `/dashboard` | DashboardPage | Protected |
| `/documents` | UploadDocumentsPage | Protected |
| `/attendance` | AttendancePage | Protected |
| `/expenses` | ExpensesPage | Protected |
| `/knowledge` | KnowledgeHubPage | Protected |
| `/profile` | ProfilePage | Protected |
| `*` | NotFoundPage | Public |

Non-routed overlays: ChatbotDrawer, NotificationPanel

### 2.2 State Management
- React Context: Auth, Notifications/Toasts, Chatbot state, Notification panel state
- Local state: Page data (via useFetch), form data, modal/drawer visibility
- No Redux, No Zustand

### 2.3 Navigation
- Left sidebar: main navigation
- Top bar: search, notifications bell, profile avatar
- Dashboard cards: shortcuts to modules
- Chatbot: floating button / sidebar item → right drawer

---

## 3. Backend Design

### 3.1 API Routes

```
/api/auth           POST /google, POST /demo, GET /me, POST /logout
/api/dashboard      GET /
/api/attendance     GET/POST /subjects, PUT/DELETE /subjects/:id
                    GET/POST /records, PUT /records/:id, POST /mark-day
/api/expenses       GET/, POST/, PUT/:id, DELETE/:id
                    POST /bank-statement, POST /bank-statement/confirm
                    GET/POST/PUT /budget, GET /summary
/api/documents      GET/, POST /upload, POST /:id/extract,
                    PUT /:id/review, DELETE /:id, POST /manual
/api/chatbot        POST /message, GET /history, DELETE /history
/api/knowledge      GET/, POST/, PUT/:id, DELETE/:id, GET /points
/api/burnout        GET/, POST /checkin, GET /insights
/api/notifications  GET/, PUT /:id/dismiss, PUT /dismiss-all
/api/profile        GET/, PUT/
```

### 3.2 Middleware Stack
1. CORS
2. Helmet (security headers)
3. express.json (body parsing, 20MB limit)
4. Morgan (logging, dev only)
5. Rate limiter (general: 100/15min, auth: 20/15min, AI: 30/15min)
6. Auth middleware (on protected routes)
7. Error handler (centralized, last)

### 3.3 Response Format

Success:
```json
{ "success": true, "data": { ... } }
```

Error:
```json
{ "success": false, "error": { "message": "...", "code": "...", "statusCode": 400 } }
```

---

## 4. Database Design

### Collections

1. **users** — User accounts (googleId, email, name, avatar, college, semester, branch, isDemo)
2. **timetables** — Subject schedules (userId, name, code, faculty, day, startTime, endTime, room, targetThreshold, notes)
3. **attendance** — Records (userId, subjectId, date, status[attended/missed/skipped/cancelled/holiday])
4. **expenses** — All expenses (userId, amount, date, merchant, description, category, paymentMode, upiRef, recurring, source, aiCategorized)
5. **expenses_budgets** — Monthly limits (userId, category, limit, month)
6. **documents** — Uploads + extractions (userId, fileName, fileKey, fileType, fileSize, category, extractedData, possibleInfo, status, source, manualData)
7. **knowledge_resources** — Shared resources (userId, type[notes/pyq/professor_review], title, subject, description, fileKey, content, rating)
8. **good_senior_points** — Points (userId, totalPoints, contributions[])
9. **burnout_records** — Check-ins (userId, mood, sleepHours, workloadEstimate, pendingTasksCount, lateNightSpending, score, level, date)
10. **chat_sessions** — Messages (userId, role, message, sources, dataNotFound)
11. **notifications** — Alerts (userId, title, message, type, priority, isRead, relatedEntity)

---

## 5. AI Design

### Pipelines

| Pipeline | Input | Output | Review Gate |
|----------|-------|--------|-------------|
| Document Extraction | File text + type | suggestedCategory, extractedData, possibleInfo | YES |
| Bank Statement | CSV/PDF text | transactions[] with categories | YES |
| Expense Categorization | description + amount | suggestedCategory + confidence | YES (inline) |
| Burnout Insights | Last 30 records | score, level, contributors, suggestions | NO (read-only) |
| Chatbot | User message + context | reply, sources, dataNotFound | NO |

### Fallback Chain
Bedrock (retry once) → Gemini → AI_SERVICE_ERROR + manual fallback

---

## 6. Security

- JWT auth (24h expiry)
- Every query scoped by userId
- AI: user data only, no internet, no auto-save
- Knowledge Hub: shared read, owner-only write/delete
- S3: private objects, signed URLs for access

---

## 7. Error Handling

- Preserve user input on any failure
- AI failure → manual entry fallback
- Standard error codes: UNAUTHORIZED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, AI_SERVICE_ERROR, STORAGE_ERROR, INTERNAL_ERROR, RATE_LIMITED
- Empty states: always show next action, never dead-end

---

## Architecture Status: APPROVED ✅
