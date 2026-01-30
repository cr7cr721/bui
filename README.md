# BEAM Rules Dashboard V2

Modern React-based dashboard for managing BEAM business rules. Built with Vite, TypeScript, and Mantine UI.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing](#testing)
- [Code Style](#code-style)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

BEAM Rules Dashboard V2 is a complete rewrite of the BEAM UI with modern tooling and best practices. This application allows users to:

- View and filter business rules in a professional tabular layout
- Create new rules with a multi-step wizard and raw JSON editing
- Edit existing rules
- Bulk operations (delete, move to group) for authenticated users
- Manage groups with create/edit functionality
- Admin panel for region management (enable/disable datacenters)

**Key Features:**

- 🌙 Dark mode by default
- 📱 Responsive design with mobile hamburger menu
- ♿ Accessible (WCAG compliant)
- 🎨 Consistent design system with Mantine UI
- ⚡ Fast development with Vite HMR
- 🔒 Token-based authentication with x-auth-token headers
- 💾 Persistent state with localStorage
- 🚀 Optimistic UI updates
- 📝 Raw JSON editing with bidirectional sync
- ✅ Bulk operations with parallel execution

---

## 🛠 Tech Stack

### Core

- **React 19** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 7** - Build tool and dev server

### UI & Styling

- **Mantine 8.3** - Component library and design system
- **Tabler Icons** - Icon library

### State Management

- **TanStack Query 5** - Server state, caching, and data fetching
- **Zustand 5** - Global client state
- **React Hook Form 7** - Form state management

### Routing & Navigation

- **React Router 7** - Client-side routing

### Code Editor

- **Monaco Editor 0.54** - VS Code editor embedded in browser

### HTTP Client

- **Axios 1.11** - API requests with interceptors

### Development Tools

- **ESLint 9** - Code linting
- **Prettier 3** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files
- **Vitest** - Unit testing framework
- **MSW 2** - API mocking for tests
- **Testing Library** - Component testing utilities

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** >= 18.0.0 (LTS recommended)
   - Download: https://nodejs.org/
   - Check version: `node --version`

2. **Yarn** >= 1.22.0
   - **Install on Mac:**

```bash
npm install -g yarn
```

Or if you have Homebrew:

```bash
brew install yarn
```

- **Install on Windows/Linux:** https://classic.yarnpkg.com/en/docs/install
- Check version: `yarn --version`

3. **Git**
   - Download: https://git-scm.com/
   - Check version: `git --version`

### Verify Installation

```bash
node --version    # Should be >= 18.0.0
yarn --version    # Should be >= 1.22.0
git --version     # Any modern version
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://ghosthub.corp.blizzard.net/gdp/beam-ui-v2.git
cd beam-ui-v2
```

### 2. Install Dependencies

```bash
yarn install
```

This will install all dependencies and set up Husky git hooks automatically.

### 3. Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=https://gdp-beam-api.dev.data.blz.dev

# Environment
VITE_ENV=development
```

### 4. Start Development Server

```bash
yarn dev
```

The app will be available at **http://localhost:5173**

### 5. Sign In

Use your Blizzard credentials. After successful login, you'll see a welcome message with your first name.

---

## 📁 Project Structure

```
src/
├── components/              # Shared components
│   └── SignInModal/
├── hooks/                   # React Query hooks
│   └── useApi/
│       ├── index.ts
│       ├── useAuth.ts
│       ├── useRules.ts
│       ├── useGroups.ts
│       └── useRegions.ts
├── layouts/                 # Layout components
│   ├── MainLayout.tsx
│   └── components/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── UserMenu.tsx
├── pages/                   # Page components
│   ├── AdminPage/
│   ├── CreateRulePage/
│   ├── GroupsPage/
│   ├── RuleDetailPage/
│   └── RulesListPage/
├── services/                # API services
│   ├── index.ts
│   ├── http-client.ts
│   ├── auth.service.ts
│   ├── rules.service.ts
│   ├── groups.service.ts
│   └── regions.service.ts
├── store/                   # Zustand store
│   └── useStore.ts
├── test/                    # Test utilities
│   ├── setup.ts
│   ├── test-utils.tsx
│   └── mocks/
│       ├── data.ts
│       ├── handlers.ts
│       └── server.ts
├── types/                   # TypeScript types
│   ├── api.ts
│   └── rule.ts
├── App.tsx
└── main.tsx
```

---

## 🎮 Available Scripts

### Development

```bash
# Start development server (http://localhost:5173)
yarn dev

# Type check (no emit)
yarn type-check

# Lint code
yarn lint

# Format code with Prettier
yarn format

# Check formatting
yarn format:check
```

### Building

```bash
# Build for production
yarn build

# Preview production build locally
yarn preview
```

### Testing

```bash
# Run tests in watch mode
yarn test

# Run tests with UI
yarn test:ui

# Run tests once (CI mode)
yarn test:run

# Generate coverage report
yarn test:coverage
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://gdp-beam-api.dev.data.blz.dev

# Environment
VITE_ENV=development
```

**Note:** All environment variables must be prefixed with `VITE_` to be exposed to the client.

---

## 💻 Development

### Path Aliases

```typescript
// ✅ Use path aliases
import { useStore } from '@/store/useStore'
import { useRules } from '@/hooks/useApi'
```

### Code Editor Setup

**Required VSCode Extensions:**

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

**VSCode Settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

### State Management

**Zustand Store** (`src/store/useStore.ts`):

```typescript
const token = useStore((state) => state.token)
const setToken = useStore((state) => state.setToken)
```

**React Query Hooks** (`src/hooks/useApi`):

```typescript
const { data: rules, isLoading } = useRules('DEV', 1)
const { data: user } = useUser()
```

### Service Layer

API calls are organized into domain-specific services:

```typescript
import { authService, rulesService, groupsService, regionsService } from '@/services'

// Auth
await authService.login({ user, password })
await authService.getUser()

// Rules
await rulesService.getRules(region, groupId)
await rulesService.bulkDelete(ruleIds)
await rulesService.bulkMoveToGroup(ruleIds, groupId)

// Groups
await groupsService.create(groupData)
await groupsService.update(groupId, groupData)

// Regions
await regionsService.getChromieRegions()
await regionsService.toggle(region, enable)
```

---

## 🏗 Building for Production

### Build

```bash
yarn build
```

Creates an optimized production build in the `dist/` folder.

### Preview

```bash
yarn preview
```

Serves the production build at http://localhost:4173

### Docker

```bash
docker-compose up --build
```

---

## 🧪 Testing

### Run Tests

```bash
yarn test          # Watch mode
yarn test:ui       # Browser UI
yarn test:run      # CI mode
yarn test:coverage # Coverage report
```

### Test Structure

```
src/
├── test/
│   ├── setup.ts           # Global test setup
│   ├── test-utils.tsx     # Custom render with providers
│   └── mocks/
│       ├── data.ts        # Mock data factories
│       ├── handlers.ts    # MSW request handlers
│       └── server.ts      # MSW server setup
├── store/__tests__/
│   └── useStore.test.ts
├── services/__tests__/
│   └── rules.service.test.ts
├── hooks/__tests__/
│   └── useRules.test.ts
└── pages/RulesListPage/components/__tests__/
    └── BulkActionsToolbar.test.tsx
```

### Writing Tests

```typescript
import { render, screen } from '@/test/test-utils'
import { RulesFilters } from './RulesFilters'

describe('RulesFilters', () => {
  it('renders filter inputs', () => {
    render(<RulesFilters />)
    expect(screen.getByLabelText('Region')).toBeInTheDocument()
  })
})
```

---

## 📐 Code Style

### Prettier

Code is automatically formatted on save and before commits.

```bash
yarn format        # Format all files
yarn format:check  # Check formatting
```

### ESLint

```bash
yarn lint          # Check for issues
```

### Pre-commit Hooks

Husky runs lint-staged on every commit:

- ESLint with auto-fix
- Prettier formatting

### Naming Conventions

- **Components:** PascalCase (`RulesListPage.tsx`)
- **Hooks:** camelCase with `use` prefix (`useRules.ts`)
- **Services:** camelCase with `.service` suffix (`rules.service.ts`)
- **Types:** PascalCase (`RuleFormData`)

### Conventional Commits

```bash
feat(rules): add bulk delete functionality
fix(auth): handle expired token correctly
refactor(layout): extract header into components
chore: add prettier and husky setup
```

---

## 🏛 Architecture

### Component Hierarchy

```
App
└── MantineProvider
    └── QueryClientProvider
        └── Router
            └── MainLayout
                ├── Header
                │   ├── Navigation
                │   └── UserMenu
                └── Routes
                    ├── RulesListPage
                    ├── RuleDetailPage
                    ├── CreateRulePage
                    ├── GroupsPage
                    └── AdminPage
```

### Authentication Flow

```
1. User enters credentials in SignInModal
2. POST /user/login with x-auth-token header
3. Receive token, store in Zustand + localStorage
4. Fetch user data (includes admin flag, groups)
5. Show "Welcome, {firstName}!" message
6. HTTP client attaches token to all requests
7. On 401: Clear auth, show sign-in modal
```

### State Management Strategy

| State Type       | Tool            | Example               | Persistence  |
| ---------------- | --------------- | --------------------- | ------------ |
| **Server State** | TanStack Query  | Rules, Users, Regions | Memory cache |
| **Auth State**   | Zustand         | Token, User           | localStorage |
| **UI State**     | Zustand         | Filters, Selection    | localStorage |
| **Form State**   | React Hook Form | Create Rule Form      | Memory       |
| **Local State**  | useState        | Modal open/close      | Memory       |

---

## 📡 API Documentation

### Base URL

```
Development: https://gdp-beam-api.dev.data.blz.dev
```

### Authentication

All endpoints (except login) require token in header:

```
x-auth-token: <token>
```

### Key Endpoints

| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| POST   | `/user/login`                       | Authenticate user     |
| GET    | `/user`                             | Get current user info |
| GET    | `/regions`                          | Get available regions |
| GET    | `/rules?regions=DEV&group=1`        | Get rules             |
| DELETE | `/rules/{id}`                       | Delete rule           |
| PUT    | `/rules/{id}/group/{groupId}`       | Move rule to group    |
| GET    | `/chromie/regions`                  | Get Chromie regions   |
| GET    | `/chromie/regions/disabled`         | Get disabled regions  |
| POST   | `/chromie/regions/{region}/enable`  | Enable region         |
| POST   | `/chromie/regions/{region}/disable` | Disable region        |

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
lsof -ti:5173 | xargs kill -9
# Or use different port:
yarn dev --port 3000
```

### Module Not Found

```bash
# Restart TypeScript server in VSCode:
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Authentication Issues

```bash
# Clear localStorage and sign in again
localStorage.clear()
```

---

## 🤝 Contributing

### Branch Strategy

```bash
git checkout development
git pull origin development
git checkout -b feature/my-feature
```

### Pull Request Checklist

- [ ] Code follows style guide (Prettier + ESLint)
- [ ] No console.log statements
- [ ] Types are properly defined
- [ ] Tests are passing
- [ ] Documentation updated

---

## 👥 Team

**Frontend Team:**

- Mohammed Mohiuddin - Lead Developer
- Chris Santiago - Product Owner

**Backend Team:**

- Perry - API Development

**Questions?** Reach out in #beam-ui Slack channel.

---

## 🗺 Roadmap

### ✅ Completed

- [x] Project setup with Vite + TypeScript
- [x] Mantine UI integration
- [x] Authentication flow with welcome message
- [x] Rules list with tabular view and sorting
- [x] Bulk operations (delete, move to group)
- [x] Raw JSON editing with bidirectional sync
- [x] Groups management (create, edit)
- [x] Admin panel for region management
- [x] Responsive design with mobile menu
- [x] Modular service architecture
- [x] Comprehensive testing infrastructure
- [x] Prettier + Husky + lint-staged setup

### 🚧 In Progress

- [ ] Rule detail page
- [ ] Multi-step create rule form
- [ ] Edit rule functionality
- [ ] Rule versioning

### 📅 Planned

- [ ] Advanced search
- [ ] Rule templates
- [ ] Audit logs
- [ ] Export/import rules

---

**Last Updated:** December 2025  
**Version:** 2.0.0  
**Status:** Active Development
