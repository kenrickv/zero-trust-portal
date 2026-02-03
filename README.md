# Zero Trust Portal

A frontend-only demo portal showcasing an ISP-offered **Unified Security / Zero Trust Access Service**. This application simulates a managed SaaS platform combining SSE (Security Service Edge), IAM (Identity & Access Management), and EDR (Endpoint Detection & Response) for enterprise customers.

![Zero Trust Portal Dashboard](https://img.shields.io/badge/Demo-Live-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Vite](https://img.shields.io/badge/Vite-7-purple)

## 🎯 Overview

This demo portal simulates the complete customer journey for a Zero Trust security platform:

- **Day 0**: Tenant provisioning & identity onboarding
- **Day 1**: Device enrollment & compliance management
- **Day 2**: Policy creation & access validation
- **Operations**: Security monitoring, alerts & enforcement

### ✨ Key WOW Moment

The **Access Simulation** feature demonstrates real-time Zero Trust policy evaluation:
1. Select a user, device, and destination
2. Watch the policy engine evaluate multiple security checks
3. See access denied with clear remediation steps
4. Click "Auto-Remediate & Retry" to fix issues and gain access

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/kenrickvaz-brillio/zero-trust-portal.git
cd zero-trust-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Zustand** | State management with localStorage persistence |
| **React Router** | Client-side routing |
| **Lucide React** | Icon library |

## 📁 Project Structure

```
src/
├── components/          # Shared components
│   ├── Layout.tsx       # Main layout with sidebar & header
│   └── Layout.css
├── pages/               # Route pages
│   ├── Dashboard/       # Security posture overview
│   ├── Day0/            # Tenant & Identity onboarding
│   ├── Day1/            # Device onboarding & compliance
│   ├── Day2/            # Policy creation
│   ├── Simulation/      # Access simulation (WOW moment)
│   ├── Operations/      # Alerts, enforcement, audit
│   ├── Reports/         # Analytics & reporting
│   └── SIEM/            # SIEM integration
├── store/               # Zustand state management
│   └── useStore.ts
├── data/                # Mock data
│   └── mockData.ts
├── types/               # TypeScript definitions
│   └── index.ts
└── index.css            # Design system
```

## 🎨 Features

### Journey-Based Navigation
- **Day 0**: Tenant creation, IAM provider integration (Entra ID, Okta, Ping), user/group import
- **Day 1**: Device enrollment, EDR integration, compliance engine with posture checks
- **Day 2**: Policy management with 7 policy types (IP Filter, URL Filter, Malware, ATP, CASB, TLS, ZTNA)
- **Operations**: Real-time alert management, enforcement actions, audit logging

### Security Dashboard
- Real-time metrics: Users, Devices, Policies, Alerts
- Zero Trust Health indicators with progress bars
- Device compliance rate, MFA adoption, policy enforcement

### Access Simulation Panel
- User & device selection with risk indicators
- Destination selection (SaaS applications)
- Real-time policy evaluation with detailed checks:
  - Device Compliance
  - MFA Status
  - User Risk Score
  - Account Status
- Clear **Deny → Remediate → Allow** workflow
- Auto-remediation with animated progress

### Multi-Tenant Support
- Role-based access: ISP Admin, Customer Admin, Security Analyst, End User
- Tenant switching with persistent state
- Per-tenant data isolation

### SIEM Integration
- Event correlation across IAM, EDR, and SSE sources
- Unified security timeline
- IOC (Indicators of Compromise) dashboard
- Mock integration with Microsoft Sentinel

## 🎨 Design System

The portal features a premium dark theme with:
- **Glassmorphism** effects with backdrop blur
- **Gradient accents** (Indigo → Purple → Violet)
- **Smooth animations** and micro-interactions
- **Responsive layout** for mobile, tablet, and desktop
- **Enterprise-grade UI** components

### Color Palette

| Variable | Color | Usage |
|----------|-------|-------|
| `--accent-primary` | `#6366f1` | Primary actions, links |
| `--accent-secondary` | `#8b5cf6` | Secondary elements |
| `--status-success` | `#10b981` | Success states |
| `--status-error` | `#ef4444` | Critical/Error states |
| `--status-warning` | `#f59e0b` | Warning states |

## 📊 Mock Data

The demo includes comprehensive mock data:
- **2 Tenants**: Acme Corporation, TechStart Inc
- **6 Users** with varying MFA status and risk scores
- **5 Devices** with mixed compliance states
- **6 Policies** covering different security scenarios
- **5 Security Alerts** with IOC data
- **Enforcement Records** and **Audit Logs**

## 🔧 State Management

Zustand store with localStorage persistence:

```typescript
// Example: Simulate access request
const { simulateAccess } = useStore();

const result = await simulateAccess(userId, deviceId, destination);
// result.decision: 'allowed' | 'denied'
// result.evaluationDetails: Array of policy checks
// result.remediationSteps: Steps to fix issues
```

## 📱 Responsive Design

The portal is fully responsive:
- **Desktop**: Full sidebar with expanded navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Hidden sidebar with hamburger menu, stacked layouts

## 🚀 Build for Production

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

## Deployment

### Azure Static Web Apps Deployment Fix
If you encounter `MIME type` or `main.tsx` errors on Azure:
1. **TypeScript Build Errors**: The project now has clean TypeScript code. Previously, unused variables caused `npm run build` to fail in the CI/CD pipeline, which prevented the `dist` folder from being generated.
2. **Configuration**: The `staticwebapp.config.json` is located in the `public/` folder to ensure it is included in the production build.
3. **MIME Mapping**: The config explicitly handles `.js` and `.css` MIME types and provides SPA routing fallback.

## 📄 License

MIT License - feel free to use this demo for presentations and proof-of-concepts.

---

Built with ❤️ as a Zero Trust access service demonstration
