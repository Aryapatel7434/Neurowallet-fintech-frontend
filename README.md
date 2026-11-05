# NeuroWallet — AI-Powered FinTech Frontend

**A React-based financial dashboard and user experience for the NeuroWallet digital wallet and AI-powered personal-finance platform.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React Router](https://img.shields.io/badge/Routing-React%20Router-CA4245?logo=reactrouter)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/API-Axios-5A29E4?logo=axios)](https://axios-http.com/)
[![Bootstrap](https://img.shields.io/badge/UI-Bootstrap-7952B3?logo=bootstrap)](https://getbootstrap.com/)

## Overview

NeuroWallet is an AI-powered FinTech platform project designed around digital-wallet workflows and personal financial management.

This repository contains the React frontend. It provides authentication screens, a dashboard, wallet and transaction experiences, analytics, budgeting, savings goals, notifications, settings, and AI financial insight pages. The frontend communicates with the separate NeuroWallet Spring Boot backend through an Axios-based API layer.

The interface uses a dark, enterprise-inspired fintech visual direction and a reusable component-based React structure.

> **Project scope:** NeuroWallet is an educational and portfolio engineering project. It is not a licensed bank, payment institution, or production payment processor. Use synthetic/demo data only.

## Features

### Authentication and account access

- Login and registration forms
- Forgot-password and reset-password screens
- Protected routes
- Authentication context
- Access-token and refresh-token request handling
- Session restoration logic
- API error normalization
- Network-status banner

### Dashboard and analytics

- Financial dashboard page
- Analytics page
- Income and expense visualizations
- Cash-flow charts and insights
- Spending-category visualizations
- Financial KPI and executive-stat components
- Reusable dashboard layout

### Wallet and transactions

- Wallet page and wallet analytics
- Transfer and transaction experiences
- Transaction history
- Transaction details drawer
- Transaction modal
- Transfer activity and insights
- Notification bell
- API-backed transaction and wallet service modules

### Financial planning

- Budget management page
- Savings goals page
- Scheduled transactions page
- Notifications page
- User settings page

### AI financial experience

- AI insights page
- AI-related hooks and service integration
- Financial assistant / insights interface
- Backend-connected AI service calls

AI responses depend on the backend service, provider credentials, model availability, and configured API endpoints.

## Technology stack

| Area | Technologies present in the project |
|---|---|
| UI framework | React 19 |
| Language | JavaScript |
| Routing | React Router DOM |
| API client | Axios |
| UI toolkit | Bootstrap 5 |
| Icons | React Icons |
| Notifications | React Toastify |
| Charts | Recharts |
| PDF generation dependency | jsPDF |
| Build tooling | Create React App / `react-scripts` |
| Testing dependencies | Testing Library, Jest environment |

## Application structure

The project is organized around pages, reusable components, API clients, services, context, hooks, and styles.

```text
src/
├── api/
│   ├── apiError.js
│   └── axiosConfig.js
├── components/
│   ├── auth/
│   ├── common/
│   └── wallet/
├── constants/
├── context/
├── hooks/
├── layouts/
├── pages/
│   ├── ai/
│   ├── analytics/
│   ├── auth/
│   ├── budgets/
│   ├── dashboard/
│   ├── goals/
│   ├── notifications/
│   ├── scheduled/
│   ├── settings/
│   ├── transactions/
│   └── wallet/
├── routes/
├── services/
├── styles/
└── utils/
```

### Architectural responsibilities

| Area | Responsibility |
|---|---|
| `pages/` | Route-level screens |
| `components/` | Reusable UI components |
| `layouts/` | Shared application layouts |
| `routes/` | Route definitions |
| `api/` | Axios configuration and API error handling |
| `services/` | Feature-specific backend API calls |
| `context/` | Shared authentication state |
| `hooks/` | Reusable stateful logic |
| `constants/` | API endpoints, storage keys, and UI constants |
| `styles/` | Global and feature styles |
| `utils/` | Shared helper functions |

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm
- Git
- NeuroWallet backend running locally or an accessible backend API URL

### Clone the repository

```bash
git clone https://github.com/Aryapatel7434/Neurowallet-fintech-frontend.git
cd Neurowallet-fintech-frontend
```

### Install dependencies

```bash
npm install
```

### Configure the API URL

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

Set this value to the base URL expected by the backend and the frontend API endpoint definitions.

For a deployed frontend, configure the production API URL in the hosting provider's build environment and trigger a new build.

**Security:** Create React App embeds `REACT_APP_*` values into the browser bundle. Never put database passwords, JWT signing secrets, private API keys, SMTP credentials, or Gemini API keys in frontend environment variables. Keep provider secrets on the backend.

### Start the development server

```bash
npm start
```

The Create React App development server normally opens:

`http://localhost:3000`

If port 3000 is already occupied, the development server may prompt to use another available port.

### Build for production

```bash
npm run build
```

The optimized static output is written to the `build/` directory.

### Run tests

```bash
npm test
```

This starts the configured Create React App test runner. The actual test coverage depends on the tests present in the repository.

## Backend integration

The frontend uses the API base URL configured through `REACT_APP_API_URL` and an Axios client in `src/api/axiosConfig.js`.

Feature-specific service modules are organized under `src/services/`, including authentication, dashboard, wallet, transfers, transactions, analytics, budgets, goals, notifications, scheduled transactions, AI, and user services.

**Backend repository:** [NeuroWallet FinTech Backend](https://github.com/Aryapatel7434/Neurowallet-fintech-backend)

The backend is responsible for authentication and authorization, persistence, financial business logic, and server-side AI provider integration.

## Responsive experience

The project includes responsive dashboard and page styling. The deployment acceptance process should verify the actual application at mobile, tablet, and desktop viewport sizes.

Recommended verification sizes:

- Mobile: 375 × 812, 390 × 844, 430 × 932
- Tablet: 768 × 1024
- Laptop: 1366 × 768
- Desktop: 1440 × 900

Check navigation behavior, card stacking, chart sizing, transaction tables, forms, dialogs, and AI chat usability. Do not consider mobile readiness complete until these flows have been tested in a browser.

## Deployment

The planned static frontend host is **Cloudflare Pages**.

Expected deployment configuration:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `build` |
| Environment variable | `REACT_APP_API_URL` |
| Framework | Create React App |

The frontend deployment is planned; no live production URL is claimed in this repository documentation yet. Configure SPA fallback/routing behavior for client-side routes and verify refresh/navigation on deployed deep links.

## Development scripts

| Command | Purpose |
|---|---|
| `npm start` | Run local development server |
| `npm test` | Run the configured test runner |
| `npm run build` | Create optimized production assets |
| `npm run eject` | Eject Create React App configuration (one-way operation; not normally required) |

## Security and configuration notes

- Never commit `.env` files containing local configuration or secrets.
- Keep only safe placeholders in `.env.example`.
- Do not place Gemini or other private provider API keys in frontend code.
- Use HTTPS for deployed API communication.
- Configure backend CORS to allow only the deployed frontend origin.
- Treat browser storage as accessible to JavaScript; protect against XSS and review token-storage strategy before handling sensitive real-user data.
- Do not use real banking credentials or real customer financial information in this demo project.

## Related repository

**Backend:** [NeuroWallet FinTech Backend](https://github.com/Aryapatel7434/Neurowallet-fintech-backend)

## Developer

**Arya Patel**  
React | Java | Spring Boot | Full-Stack Development | AI FinTech

## License

This repository is intended for educational, portfolio, and professional learning purposes. No separate license file was identified in the supplied project archive. Unless a license is added, all rights are reserved by the author.
