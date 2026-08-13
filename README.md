# MDE Health Dashboard — Endpoint Security Daily AV Health & Action Dashboard

A production-quality, client-side web application for **Microsoft Intune / Microsoft Defender for Endpoint (MDE)** daily health monitoring. Built for Endpoint Security administrators who need to perform daily antivirus and endpoint health checks with minimal manual effort.

> **🔒 Privacy**: All data is processed locally in your browser. No files are uploaded to any external service. No telemetry. No external APIs.

## Features

### Core Workflow
1. **Upload** your Intune device export (XLSX/CSV)
2. **Select** the reporting window (24h / 7d / 30d / Custom)
3. **Upload** your MDE health report (XLSX/CSV)
4. **Click** "Run Health Assessment"
5. **View** your complete endpoint security health dashboard with actionable remediation

### Data Import
- XLSX and CSV support for both Intune and MDE reports
- **Smart column auto-detection** using alias dictionaries (handles varying column names)
- **Manual column mapping** UI for unrecognized columns
- Column mappings saved to localStorage (no re-mapping daily)
- File validation with clear error messages

### Device Matching
- Intune is the **baseline** — only active Intune devices are evaluated
- Devices matched by **normalized device name** (case-insensitive, FQDN stripping)
- FQDN domain suffixes (`.local`, `.corp`, `.domain`, etc.) are automatically stripped from MDE names
- Multiple MDE matches are flagged rather than silently picking one
- Missing MDE devices are classified as Critical

### Compliance Checks (All Thresholds Fully Customizable)
| Check | Default | Description |
|---|---|---|
| Sensor Health | ≤24h healthy, ≤48h warning | MDE sensor communication age |
| Signature Age | ≤5 days | AV signature/security intelligence freshness |
| Platform Version | N-1 | Semantic version comparison (N/N-1/N-2/N-3) |
| Quick Scan | ≤7 days | Quick scan recency and status |
| Full Scan | ≤30 days | Full scan recency and status |
| Antivirus Enabled | true | Defender AV enabled state |
| Real-Time Protection | true | RTP enabled state |
| Tamper Protection | true | Tamper protection state |
| MDE Onboarding | Onboarded | Device onboarding status |
| Firewall | Enabled | Firewall profiles (Domain/Private/Public) |
| Network Protection | Enabled | Network protection state & mode |
| Cloud Protection | Enabled | Cloud-delivered protection (MAPS) |
| Sample Submission | Enabled | Automatic sample submission |
| ASR Rules | Block mode | Attack surface reduction rules |

### Health Scoring
- Weighted score per device (sensor 20%, signature 15%, platform 15%, scans 20%, AV 10%, tamper 10%, onboarding 10%)
- All weights configurable
- Critical overrides: AV disabled, sensor not reporting → forced Critical regardless of score
- "Not Available" data excluded from scoring (not penalized)

### Dashboard
- KPI cards with device counts and issue breakdowns
- **Animated health gauge** (average fleet score)
- **Gradient donut chart** (Healthy/Warning/Critical distribution)
- **Compliance radar chart** (multi-axis compliance view)
- **Stacked bar chart** (issues by category)
- Dynamic executive summary with natural language

### Action Center
- Every non-compliant endpoint with **specific recommended remediation**
- Filter by severity (Critical/High/Medium/Low)
- Filter by category
- Search across devices, issues, and actions
- Sortable by severity, device, category

### Export
- **Full Health Report** (XLSX/CSV) — all devices with scores, issues, and actions
- **Action List** (XLSX/CSV) — only devices requiring remediation

### Data Quality
- Missing device names, duplicates, invalid dates
- Devices in Intune but missing from MDE
- Multiple MDE matches
- Missing required fields with clear warnings
- Malformed version strings

## Supported Report Formats

### Intune Export
The app recognizes these columns (and common variations):
- Device Name / Computer Name / Hostname
- Last Check-in / Last Sync / Last Contact
- Device ID
- Compliance / Compliance State
- Operating System / OS
- OS Version
- Primary User / User / UPN

### MDE Health Report
The app recognizes these columns (and common variations):
- Device Name / Computer Name
- Sensor Health State / Sensor Health
- Antivirus Signature Version / Security Intelligence Version
- Signature Update Date
- Platform Version / AV Platform Version
- Quick Scan Status / Start Time / End Time
- Full Scan Status / Start Time / End Time
- Sensor Last Seen / Last Communication
- Real-time Protection / Tamper Protection
- Antivirus Enabled / EDR Sensor
- Onboarding Status / Device Risk
- Firewall (Enabled, Domain/Private/Public Profiles)
- Network Protection / Cloud Protection / Sample Submission / ASR Rules

**Column names don't need to match exactly.** The app uses alias dictionaries for fuzzy matching, and you can manually map any unrecognized columns.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- npm v9+

### Install Dependencies
```bash
npm install
```

### Run Locally (Development)
```bash
npm run dev
```
Opens at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```
Output is in the `dist/` directory.

### Deploy to GitHub Pages

#### Option 1: Manual
1. Run `npm run build`
2. Push the contents of `dist/` to the `gh-pages` branch of your repository

#### Option 2: GitHub Actions
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v3 |
| Charts | Apache ECharts |
| XLSX | SheetJS |
| CSV | PapaParse |
| Icons | Lucide React |
| Routing | React Router v6 (HashRouter) |

## Project Structure

```
src/
├── config/defaults.ts          # Thresholds, weights, recommended actions
├── types/
│   ├── index.ts                # Core domain types
│   └── columns.ts              # Column mapping types & aliases
├── parsers/
│   ├── fileParser.ts           # XLSX/CSV unified parser
│   └── columnDetector.ts       # Auto-detect & map columns
├── services/
│   ├── deviceMatcher.ts        # Intune→MDE cross-reference
│   ├── complianceEngine.ts     # Orchestrates all rule checks
│   ├── dataQuality.ts          # Data validation
│   └── exportService.ts        # CSV/XLSX export
├── rules/                      # Individual compliance rules
│   ├── sensorHealth.ts
│   ├── signatureAge.ts
│   ├── platformVersion.ts
│   ├── quickScan.ts / fullScan.ts
│   ├── antivirus.ts
│   ├── tamperProtection.ts
│   ├── firewall.ts
│   ├── networkProtection.ts
│   ├── cloudProtection.ts
│   ├── sampleSubmission.ts
│   ├── attackSurfaceReduction.ts
│   └── healthScore.ts
├── hooks/
│   ├── useAppState.tsx         # Central state (Context + useReducer)
│   └── useSettings.ts          # Settings with localStorage
├── utils/
│   ├── dateUtils.ts            # Date parsing & age calculation
│   ├── versionUtils.ts         # Semantic version comparison
│   ├── nameNormalizer.ts       # FQDN stripping & normalization
│   └── formatUtils.ts          # Display formatting
├── components/
│   ├── layout/                 # AppLayout, Sidebar
│   ├── common/                 # KPICard, StatusBadge, etc.
│   └── charts/                 # ECharts visualizations
├── pages/                      # 7 application pages
└── App.tsx                     # Root with HashRouter
```

## Configuration

All settings are configurable via the **Settings** page and persist in localStorage.

### How Compliance Thresholds Work
- Each rule has a default threshold and severity level
- Both presets and custom values are supported
- Severity levels (Critical/High/Medium/Low) can be adjusted per rule
- Health score weights and thresholds are fully customizable
- "Reset to Defaults" restores all original values

### How Device Matching Works
1. Intune device names are normalized (lowercase, trimmed)
2. MDE device names are normalized + FQDN suffixes stripped
3. Normalized names are compared for exact match
4. Multiple matches → flagged as "Multiple MDE Matches"
5. No match → classified as "MDE Data Missing / Sensor Not Reporting" (Critical)

### How Version Comparison Works
- Platform versions are parsed into numeric arrays (e.g., `4.18.26070.6` → `[4, 18, 26070, 6]`)
- All unique versions from the dataset are sorted descending
- N = latest (index 0), N-1 = second latest (index 1), etc.
- Comparison is numeric per segment — not lexicographic
- Manual override available for the latest approved version

## License

MIT
