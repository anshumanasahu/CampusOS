# CampusOS — Project Skeleton

## Folder Structure

```
CampusOS/
├── docs/
│   ├── LLD.md
│   └── SKELETON.md
├── context.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── config/
│       │   └── api.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── NotificationContext.jsx
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useFetch.js
│       │   └── useNotification.js
│       ├── services/
│       │   ├── authService.js
│       │   ├── dashboardService.js
│       │   ├── attendanceService.js
│       │   ├── scheduleService.js
│       │   ├── deadlineService.js
│       │   ├── expenseService.js
│       │   ├── budgetService.js
│       │   ├── documentService.js
│       │   ├── burnoutService.js
│       │   ├── chatbotService.js
│       │   ├── knowledgeService.js
│       │   ├── notificationService.js
│       │   └── profileService.js
│       ├── components/
│       │   ├── shared/
│       │   │   ├── Button.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── Table.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── LoadingSpinner.jsx
│       │   │   ├── ErrorBoundary.jsx
│       │   │   ├── Toast.jsx
│       │   │   ├── Badge.jsx
│       │   │   ├── Avatar.jsx
│       │   │   ├── FileUpload.jsx
│       │   │   ├── AIReviewCard.jsx
│       │   │   ├── ConfirmDialog.jsx
│       │   │   └── PageHeader.jsx
│       │   └── layout/
│       │       ├── MainLayout.jsx
│       │       ├── AuthLayout.jsx
│       │       ├── Sidebar.jsx
│       │       └── TopBar.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── AttendancePage.jsx
│       │   ├── SchedulePage.jsx
│       │   ├── DeadlinesPage.jsx
│       │   ├── ExpensesPage.jsx
│       │   ├── BudgetPage.jsx
│       │   ├── DocumentsPage.jsx
│       │   ├── BurnoutPage.jsx
│       │   ├── ChatbotPage.jsx
│       │   ├── KnowledgePage.jsx
│       │   ├── NotificationsPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── NotFoundPage.jsx
│       └── utils/
│           ├── formatDate.js
│           ├── formatCurrency.js
│           └── validators.js
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── env.js
│   │   │   └── s3.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validate.js
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Attendance.js
│   │   │   ├── Schedule.js
│   │   │   ├── Deadline.js
│   │   │   ├── Expense.js
│   │   │   ├── Budget.js
│   │   │   ├── Document.js
│   │   │   ├── BurnoutLog.js
│   │   │   ├── KnowledgeItem.js
│   │   │   ├── Notification.js
│   │   │   └── ChatHistory.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.routes.js
│   │   │   ├── dashboard.routes.js
│   │   │   ├── attendance.routes.js
│   │   │   ├── schedule.routes.js
│   │   │   ├── deadline.routes.js
│   │   │   ├── expense.routes.js
│   │   │   ├── budget.routes.js
│   │   │   ├── document.routes.js
│   │   │   ├── burnout.routes.js
│   │   │   ├── chatbot.routes.js
│   │   │   ├── knowledge.routes.js
│   │   │   ├── notification.routes.js
│   │   │   └── profile.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── schedule.controller.js
│   │   │   ├── deadline.controller.js
│   │   │   ├── expense.controller.js
│   │   │   ├── budget.controller.js
│   │   │   ├── document.controller.js
│   │   │   ├── burnout.controller.js
│   │   │   ├── chatbot.controller.js
│   │   │   ├── knowledge.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── profile.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── dashboard.service.js
│   │   │   ├── attendance.service.js
│   │   │   ├── schedule.service.js
│   │   │   ├── deadline.service.js
│   │   │   ├── expense.service.js
│   │   │   ├── budget.service.js
│   │   │   ├── document.service.js
│   │   │   ├── burnout.service.js
│   │   │   ├── chatbot.service.js
│   │   │   ├── knowledge.service.js
│   │   │   ├── notification.service.js
│   │   │   └── profile.service.js
│   │   ├── ai/
│   │   │   ├── bedrock.js
│   │   │   ├── gemini.js
│   │   │   ├── aiService.js
│   │   │   └── prompts/
│   │   │       ├── documentExtraction.js
│   │   │       ├── expenseCategorization.js
│   │   │       ├── burnoutAnalysis.js
│   │   │       ├── chatbot.js
│   │   │       └── scheduleSuggestions.js
│   │   ├── storage/
│   │   │   └── s3Service.js
│   │   └── utils/
│   │       ├── AppError.js
│   │       ├── asyncHandler.js
│   │       └── validators.js
│   └── seed/
│       └── demo.seed.js
└── .gitignore
```

## READY FOR IMPLEMENTATION
