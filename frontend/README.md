# Frontend - React Application

This folder contains the React frontend for DriverGuard with sidebar navigation.

## Structure

```
frontend/
├── public/                 # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/         # React components
│   │   ├── Sidebar.jsx              # NEW: Left sidebar navigation
│   │   ├── DashboardPage.jsx        # NEW: Dashboard overview
│   │   ├── LiveMonitorPage.jsx      # NEW: Live monitoring wrapper
│   │   ├── AnalyticsPage.jsx        # NEW: Analytics wrapper
│   │   ├── AlertsPage.jsx           # NEW: Alerts wrapper
│   │   ├── ReportsPage.jsx          # NEW: Reports wrapper
│   │   ├── HistoryPage.jsx          # NEW: Session history
│   │   ├── SettingsPage.jsx         # NEW: Settings configuration
│   │   ├── HelpPage.jsx             # NEW: Help & documentation
│   │   ├── LiveMonitor.jsx          # Camera + telemetry layout
│   │   ├── CameraView.jsx           # Camera controls
│   │   ├── SafetyScoreCard.jsx      # Safety score display
│   │   ├── DrowsinessCard.jsx       # Drowsiness detection
│   │   ├── DistractionCard.jsx      # Distraction detection
│   │   ├── AnalyticsTab.jsx         # Analytics charts
│   │   ├── AlertsTab.jsx            # Alert history
│   │   ├── ReportTab.jsx            # Session reports
│   │   ├── AlertBanner.jsx          # Alert banner
│   │   └── Modals.jsx               # Modal dialogs
│   ├── hooks/
│   │   └── useDriverMonitor.js      # Main application logic
│   ├── App.jsx                      # Main app with sidebar layout
│   ├── App.css                      # Component styles
│   ├── index.css                    # Base styles
│   ├── sidebar-layout.css           # Sidebar & layout styles
│   └── main.jsx                     # Application entry point
├── index.html                       # HTML template
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
└── .oxlintrc.json                   # Linter config
```

## Setup

1. Install Node.js dependencies:
```bash
npm install
```

## Running

From the **frontend** folder:

```bash
npm run dev
```

The development server will start at: **http://localhost:5173**

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (output: `dist/`)
- `npm run preview` - Preview production build
- `npm run lint` - Run oxlint for code quality

## Features

### New Sidebar Layout
- Fixed left sidebar (260px, collapsible to 76px)
- Vertical navigation with 8 pages
- Orange active indicator
- System status footer
- Mobile responsive (slide-out drawer)

### Pages
1. **Dashboard** - Overview with key metrics
2. **Live Monitor** - Real-time camera monitoring (PRIMARY)
3. **Analytics** - Charts and session statistics
4. **Alerts** - Safety event history
5. **Session Reports** - Export PDF/CSV
6. **History** - Previous sessions
7. **Settings** - Configure preferences
8. **Help** - User guide and documentation

### Design System
- **Colors:** White + Orange + Navy
- **Primary Orange:** #F97316
- **Dark Navy:** #172033
- **Background:** #F7F8FA
- **Typography:** 14-28px range, clear hierarchy
- **Components:** Premium cards with subtle shadows

## Dependencies

Key packages:
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **oxlint** - Fast linter

## API Integration

The frontend communicates with the Flask backend at:
- Default: `http://localhost:5000`
- Proxy configured in `vite.config.js`

### API Calls
- `GET /api/health` - Check backend status
- `POST /api/predict` - Send camera frames
- `POST /api/reset` - Reset session

## Building for Production

```bash
npm run build
```

This creates an optimized build in `dist/` folder:
- Minified JavaScript and CSS
- Optimized assets
- Ready for deployment

To preview the production build:
```bash
npm run preview
```

## Configuration

### Vite Config (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

### Development URL
The app runs at `http://localhost:5173` in development, but API calls are proxied to the Flask backend at `http://localhost:5000`.

## Responsive Design

- **Desktop (>768px):** Fixed sidebar with full features
- **Mobile (≤768px):** Collapsible drawer navigation
- **Tablet:** Responsive grid layouts

## Browser Support

✅ Chrome/Edge (Recommended)  
✅ Firefox  
✅ Safari (macOS)  
❌ Internet Explorer (Not supported)

## Troubleshooting

**Port already in use:**
Vite will automatically use the next available port (5174, 5175, etc.)

**Dependencies installation fails:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API connection errors:**
Ensure the Flask backend is running at `http://localhost:5000`
