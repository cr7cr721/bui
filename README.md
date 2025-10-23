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

- View and filter business rules
- Create new rules with a multi-step wizard
- Edit existing rules
- Manage rule schedules and conditions
- Write JavaScript transforms and conditions with a built-in code editor

**Key Features:**
- 🌙 Dark mode by default
- 📱 Responsive design
- ♿ Accessible (WCAG compliant)
- 🎨 Consistent design system with Mantine UI
- ⚡ Fast development with Vite HMR
- 🔒 JWT authentication
- 💾 Persistent state with localStorage
- 🚀 Optimistic UI updates

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
- **React Query 5** - Server state, caching, and data fetching
- **Zustand 5** - Global client state
- **React Hook Form 7** - Form state management

### Routing & Navigation
- **React Router 7** - Client-side routing

### Code Editor
- **Monaco Editor 0.54** - VS Code editor embedded in browser

### HTTP Client
- **Axios 1.11** - API requests with interceptors

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vitest** - Unit testing framework
- **PostCSS** - CSS processing for Mantine

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 (LTS recommended)
- **Yarn** >= 1.22.0
- **Git**

Check your versions:
```bash
node --version   # Should be >= 18.0.0
yarn --version   # Should be >= 1.22.0
git --version
```

**Install Node.js:** https://nodejs.org/  
**Install Yarn:** https://classic.yarnpkg.com/en/docs/install

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

This will install all dependencies listed in `package.json`. First install takes ~2-3 minutes.

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

**Hot Module Replacement (HMR)** is enabled - changes reflect instantly without page refresh.

### 5. Sign In

Use your Blizzard credentials:
- **Username:** Your blizzard username
- **Password:** Your blizzard password

The app will:
1. Authenticate with the BEAM API
2. Store JWT token in localStorage
3. Load your available groups and regions
4. Display the rules dashboard

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

# Lint and auto-fix issues
yarn lint:fix
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

### Other
```bash
# Clean install (remove node_modules and reinstall)
rm -rf node_modules yarn.lock
yarn install

# Update dependencies
yarn upgrade-interactive --latest
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:
```env
# API Configuration
VITE_API_BASE_URL=https://gdp-beam-api.dev.data.blz.dev

# Environment
VITE_ENV=development

# Optional: Enable debug mode
VITE_DEBUG=true
```

**Note:** All environment variables must be prefixed with `VITE_` to be exposed to the client.

**Access in code:**
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

---

## 💻 Development

### Path Aliases

The project uses path aliases for cleaner imports:
```typescript
// ❌ Before
import { useStore } from '../../../store/useStore'

// ✅ After
import { useStore } from '@/store/useStore'
```

**Aliases configured:**
- `@/*` → `src/*`

### Code Editor Setup

**Recommended VSCode Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Mantine Snippets

**VSCode Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Hot Module Replacement (HMR)

Vite's HMR updates your code instantly without full page reload:

- **Component changes** → Instant update
- **Store changes** → Instant update
- **Route changes** → Instant update
- **Style changes** → Instant update

If HMR fails, the page will auto-reload.

### State Management

**Zustand Store** (`src/store/useStore.ts`):
- Global application state
- Persists to localStorage
- Use for: auth token, UI state, filters
```typescript
// Usage
const { authToken, setAuthToken } = useStore()
```

**React Query** (`src/hooks/useApi.ts`):
- Server state (API data)
- Automatic caching and refetching
- Use for: rules, users, regions
```typescript
// Usage
const { data: rules, isLoading } = useRules('DEV', 1)
```

### Adding a New Page

1. **Create page component:**
```typescript
// src/pages/SettingsPage/SettingsPage.tsx
export const SettingsPage = () => {
  return <div>Settings</div>
}
```

2. **Add route in App.tsx:**
```typescript
<Route path="/settings" element={<SettingsPage />} />
```

3. **Add navigation link in MainLayout.tsx:**
```typescript
<Tabs.Tab value="settings">Settings</Tabs.Tab>
```

### Adding a New API Endpoint

1. **Add method to API client:**
```typescript
// src/services/api.ts
async deleteRule(id: number): Promise<void> {
  await this.client.delete(`/rules/${id}`)
}
```

2. **Create React Query hook:**
```typescript
// src/hooks/useApi.ts
export const useDeleteRule = () => {
  return useMutation({
    mutationFn: (id: number) => apiClient.deleteRule(id)
  })
}
```

3. **Use in component:**
```typescript
const deleteMutation = useDeleteRule()
deleteMutation.mutate(ruleId)
```

---

## 🏗 Building for Production

### Build
```bash
yarn build
```

This creates an optimized production build in the `dist/` folder:
```
dist/
├── assets/
│   ├── index-[hash].js      # Main bundle
│   ├── vendor-[hash].js     # Dependencies
│   └── index-[hash].css     # Styles
├── index.html
└── favicon.svg
```

**Build output:**
- Minified and tree-shaken
- Code splitting for optimal loading
- Hash-based cache busting
- Source maps for debugging

### Preview Build Locally
```bash
yarn preview
```

Serves the production build at http://localhost:4173

### Deploy

---

## 🧪 Testing

### Run Tests
```bash
# Watch mode (recommended for development)
yarn test

# With UI (browser-based test runner)
yarn test:ui

# Run once (CI mode)
yarn test:run
```

### Writing Tests

**Component test example:**
```typescript
// src/components/RulesFilters/RulesFilters.test.tsx
import { render, screen } from '@testing-library/react'
import { RulesFilters } from './RulesFilters'

describe('RulesFilters', () => {
  it('renders filter inputs', () => {
    render(<RulesFilters />)
    expect(screen.getByLabelText('Region')).toBeInTheDocument()
    expect(screen.getByLabelText('Group')).toBeInTheDocument()
  })
})
```

**Hook test example:**
```typescript
// src/hooks/useApi.test.ts
import { renderHook } from '@testing-library/react'
import { useRules } from './useApi'

describe('useRules', () => {
  it('fetches rules successfully', async () => {
    const { result } = renderHook(() => useRules('DEV', 1))
    expect(result.current.isLoading).toBe(true)
  })
})
```

### Test Coverage
```bash
yarn test:coverage
```

Coverage report will be generated in `coverage/` folder.

---

## 📐 Code Style

### ESLint

The project uses ESLint with TypeScript support:
```bash
# Check for issues
yarn lint

# Auto-fix issues
yarn lint:fix
```

**Key rules:**
- TypeScript strict mode
- No unused variables (except `_prefixed`)
- React Hooks rules
- Import order (alphabetical)

### TypeScript

**Strict mode enabled** - All type errors must be fixed before build.

**Best practices:**
- Define interfaces for all data structures
- Use `unknown` instead of `any`
- Export types from `src/types/`
- Use const assertions for literal types

**Example:**
```typescript
// ✅ Good
interface User {
  id: number
  name: string
}

// ❌ Bad
const user: any = { id: 1, name: 'John' }
```

### Naming Conventions

- **Components:** PascalCase (`RulesListPage.tsx`)
- **Hooks:** camelCase with `use` prefix (`useRules.ts`)
- **Utils:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types:** PascalCase (`RuleFormData`)

### File Organization
```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.test.tsx  # Tests
├── ComponentName.module.css # Styles (if needed)
└── index.ts               # Re-export
```

---

## 🏛 Architecture

### Component Hierarchy
```
App
└── MantineProvider (theme)
    └── QueryClientProvider (React Query)
        └── Router
            └── MainLayout (header + nav)
                └── Routes
                    ├── RulesListPage
                    ├── RuleDetailPage
                    └── CreateRulePage
```

### Data Flow
```
User Action
    ↓
Component dispatches action
    ↓
Zustand Store (client state) OR React Query (server state)
    ↓
API Client (if needed)
    ↓
Backend API
    ↓
Response cached by React Query
    ↓
Component re-renders with new data
```

### Authentication Flow
```
1. User enters credentials
2. POST /user/login
3. Receive JWT token
4. Store in Zustand + localStorage
5. Axios interceptor adds token to all requests
6. On 401: Clear token, show sign-in modal
```

### State Management Strategy

| State Type | Tool | Example | Persistence |
|------------|------|---------|-------------|
| **Server State** | React Query | Rules, Users, Regions | Memory (5min cache) |
| **Auth State** | Zustand | JWT Token | localStorage |
| **UI State** | Zustand | Filters, Selected Items | localStorage |
| **Form State** | React Hook Form | Create Rule Form | Memory only |
| **Local State** | useState | Modal open/close | Memory only |

---

## 📡 API Documentation

### Base URL
```
Development: https://gdp-beam-api.dev.data.blz.dev
Production: TBD
```

### Authentication

All endpoints (except login) require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints

#### **POST** `/user/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "user": "username",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **GET** `/user`
Get current user info.

**Response:**
```json
{
  "username": "jdoe",
  "fullName": "John Doe",
  "email": "jdoe@blizzard.com",
  "admin": false,
  "groups": [...]
}
```

#### **GET** `/regions`
Get available regions.

**Response:**
```json
[
  {
    "name": "DEV",
    "description": "BEAM QA"
  }
]
```

#### **GET** `/rules?regions=DEV&group=1`
Get rules for specified region and group.

**Response:**
```json
[
  {
    "id": 123,
    "name": "My Rule",
    "author": "jdoe@blizzard.com",
    "enabled": 1,
    "regions": ["DEV", "PROD"],
    ...
  }
]
```

#### **GET** `/rules/values/author?group=1`
Get list of authors for a group.

**Response:**
```json
["jdoe@blizzard.com", "asmith@blizzard.com"]
```

#### **GET** `/version`
Get API version.

**Response:**
```json
"1.4.6-1.6517d9602e"
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Error: Port 5173 is already in use

# Solution: Kill the process
# Mac/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port:
yarn dev --port 3000
```

### Module Not Found
```bash
# Error: Cannot find module '@/...'

# Solution: Restart TypeScript server
# VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or rebuild:
rm -rf node_modules yarn.lock
yarn install
```

### Vite Build Fails
```bash
# Error: Build fails with TypeScript errors

# Solution: Check types
yarn type-check

# Fix all type errors, then:
yarn build
```

### API Connection Issues
```bash
# Error: Network Error / CORS issues

# Solutions:
1. Check .env file has correct VITE_API_BASE_URL
2. Verify API server is running
3. Check VPN connection (if required)
4. Clear browser cache and localStorage
5. Check Network tab in DevTools for actual error
```

### Authentication Issues
```bash
# Error: 401 Unauthorized

# Solutions:
1. Sign out and sign in again
2. Clear localStorage: localStorage.clear()
3. Check token expiration
4. Verify credentials are correct
```

### Monaco Editor Not Loading
```bash
# Error: Monaco editor blank or not rendering

# Solutions:
1. Check browser console for errors
2. Verify monaco-editor package installed
3. Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
4. Check Content Security Policy headers
```

### Yarn Install Fails
```bash
# Error: yarn install fails

# Solutions:
1. Delete yarn.lock and node_modules:
   rm -rf node_modules yarn.lock
   
2. Clear Yarn cache:
   yarn cache clean
   
3. Reinstall:
   yarn install
   
4. If still fails, try:
   yarn install --network-timeout 100000
```

---

## 🤝 Contributing

### Getting Started

1. **Clone the repo** (see [Getting Started](#getting-started))
2. **Create a branch** from `development`:
```bash
   git checkout development
   git pull origin development
   git checkout -b feature/my-feature
```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with conventional commits**
6. **Push and create PR**

### Conventional Commits

Use conventional commit format:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(rules): add delete rule functionality"
git commit -m "fix(auth): handle expired token correctly"
git commit -m "docs: update README with new scripts"
git commit -m "refactor(forms): simplify validation logic"
```

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run linter:** `yarn lint`
4. **Run tests:** `yarn test:run`
5. **Build successfully:** `yarn build`
6. **Get 2 approvals** from team members
7. **Squash and merge** into `development`

### Code Review Checklist

- [ ] Code follows style guide
- [ ] No console.log statements
- [ ] Types are properly defined
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Responsive design tested
- [ ] Tests are passing
- [ ] No ESLint warnings
- [ ] Documentation updated

---

## 📚 Additional Resources

### Official Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Mantine Documentation](https://mantine.dev)
- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Zustand Guide](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form](https://react-hook-form.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

### Internal Resources
- [BEAM API Documentation](https://wiki.blizzard.com/beam-api)
- [Design System Figma](https://figma.com/beam-design-system)
- [Jira Board](https://jira.blizzard.com/projects/BEAM)
- [Confluence Wiki](https://confluence.blizzard.com/beam)

### Learning Resources
- [React Query Essentials](https://ui.dev/react-query)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Mantine Patterns](https://mantine.dev/guides/recipes/)

---

## 📝 License

Copyright © 2025 Blizzard Entertainment, Inc. All rights reserved.

This project is proprietary and confidential.

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

### ✅ Completed (Sprint 13-14)
- [x] Project setup with Vite + TypeScript
- [x] Mantine UI integration
- [x] Authentication flow
- [x] Rules list with filtering
- [x] Rule detail page
- [x] Multi-step create rule form
- [x] Monaco code editors

### 🚧 In Progress (Sprint 15)
- [ ] API integration for create rule
- [ ] Edit rule functionality
- [ ] Delete rule functionality

### 📅 Planned (Sprint 16+)
- [ ] Rule versioning
- [ ] Bulk operations
- [ ] Advanced search
- [ ] Rule templates
- [ ] Audit logs
- [ ] User management
- [ ] Role-based permissions
- [ ] Export/import rules

---

**Last Updated:** October 2025  
**Version:** 2.0.0  
**Status:** Active Development