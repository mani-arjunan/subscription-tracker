# Project Structure

## Directory Layout

```
subscription-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard with stats and filtering
│   │   ├── SubscriptionForm.tsx  # Form to add/edit subscriptions
│   │   ├── SubscriptionCard.tsx  # Individual subscription card
│   │   └── StatsCard.tsx    # Statistics display card
│   ├── services/
│   │   └── reminderService.ts  # Browser notification service
│   ├── store/
│   │   └── subscriptionStore.ts # Zustand state management
│   ├── types/
│   │   └── subscription.ts  # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   ├── App.css              # Global styles
│   ├── index.css            # Tailwind CSS imports
│   └── main.tsx             # React entry point
├── public/                  # Static assets
├── dist/                    # Production build output
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts          # Vite bundler config
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── README.md               # User documentation
└── PROJECT_STRUCTURE.md    # This file
```

## Component Architecture

### Dashboard Component (`src/components/Dashboard.tsx`)
- Main container component
- Manages state for form visibility, editing, and filtering
- Handles notification permission requests
- Initializes reminder checking service
- Provides export/import functionality
- Renders stats cards, category filters, and subscription grid

### SubscriptionForm Component (`src/components/SubscriptionForm.tsx`)
- Modal form for adding/editing subscriptions
- Form validation and state management
- Input fields for all subscription properties
- Supports add and edit modes
- Beautiful modal UI with gradient header

### SubscriptionCard Component (`src/components/SubscriptionCard.tsx`)
- Displays individual subscription information
- Shows cost, renewal date, and status
- Displays upcoming renewal warnings
- Edit and delete action buttons
- Category icon display
- Calculates days until renewal

### StatsCard Component (`src/components/StatsCard.tsx`)
- Reusable statistics display card
- Supports different color gradients
- Shows title, value, and optional subtitle
- Includes icon support

## State Management (Zustand Store)

### useSubscriptionStore (`src/store/subscriptionStore.ts`)
**State:**
- `subscriptions`: Array of subscription objects
- `currency`: Selected currency (default: USD)
- `reminderDaysDefault`: Default reminder days (default: 7)

**Methods:**
- `addSubscription()` - Create new subscription
- `updateSubscription()` - Modify existing subscription
- `deleteSubscription()` - Remove subscription
- `getSubscription()` - Fetch single subscription by ID
- `getActiveSubscriptions()` - Get all active subscriptions
- `getSubscriptionsByCategory()` - Filter by category
- `getUpcomingRenewals()` - Get renewals within N days
- `getTotalMonthlyCost()` - Calculate total monthly spend
- `getCostByCategory()` - Breakdown costs by category
- `loadFromStorage()` - Load data from localStorage
- `exportData()` - Export as JSON
- `importData()` - Import from JSON

**Storage:**
- Uses browser localStorage with key `subscriptions`
- Automatically persists on every mutation

## Services

### ReminderService (`src/services/reminderService.ts`)
- `requestPermission()` - Ask user for notification permission
- `sendNotification()` - Send browser notification
- `checkAndNotifyReminders()` - Check subscriptions and trigger reminders
- `getUpcomingReminders()` - Get upcoming reminders with details

**Features:**
- Uses Browser Notifications API
- Session storage to prevent duplicate notifications
- Automatic daily checks

## Type Definitions (`src/types/subscription.ts`)

### Subscription Interface
```typescript
{
  id: string;
  name: string;
  provider: string;
  cost: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'bi-annual' | 'yearly';
  renewalDate: string; // ISO date
  category: Category;
  status: 'active' | 'paused' | 'cancelled';
  reminderDaysBefore: number;
  createdAt: string; // ISO date
  notes?: string;
}
```

### Category Types
- `streaming` - Video/streaming services
- `music` - Music streaming services
- `productivity` - Work/productivity tools
- `gaming` - Gaming platforms
- `education` - Learning platforms
- `other` - Miscellaneous

## Key Features Implementation

### 1. Data Persistence
- **Storage**: Browser localStorage (no backend required)
- **Format**: JSON
- **Capacity**: ~5MB per domain
- **Backup**: Export to JSON file

### 2. Reminder System
- Checks every minute (after user enables notifications)
- Triggers notification N days before renewal (configurable)
- Uses sessionStorage to prevent duplicate notifications
- Respects browser notification permissions

### 3. Cost Calculations
- Converts different billing cycles to monthly average
- Supports multiple currencies
- Category-based cost breakdown
- Real-time updates

### 4. UI/UX
- Tailwind CSS for styling
- Gradient backgrounds (purple/blue theme)
- Responsive grid layout
- Modal form with validation
- Filter buttons for categories
- Real-time stat cards

## Data Flow

1. **User adds subscription**
   - Form submits → Dashboard receives data
   - Dashboard calls `store.addSubscription()`
   - Store saves to localStorage
   - Component re-renders with new data

2. **Reminder triggers**
   - Reminder check runs every minute
   - Compares renewal date with today + reminder days
   - Sends browser notification if match found
   - SessionStorage prevents duplicates

3. **Data export/import**
   - Export: Combines subscriptions + metadata → JSON file → Download
   - Import: Parse JSON → Validate → Update store → Persist to localStorage

4. **Category filtering**
   - User clicks category button
   - Dashboard updates `selectedCategory` state
   - Subscriptions filtered in real-time
   - Grid re-renders with filtered results

## Configuration Files

### vite.config.ts
- React plugin enabled
- TypeScript compilation
- Production optimization

### tailwind.config.js
- Color scheme configuration
- Theme extensions
- @tailwindcss/postcss plugin

### tsconfig.json
- ES2020 target
- JSX support
- Module resolution
- Strict type checking enabled

### postcss.config.js
- Tailwind CSS processing
- Production optimization

## Browser Compatibility

- Modern browsers with ES2020+ support
- localStorage API required
- Notifications API for reminder feature
- Flex/Grid CSS support

## Future Enhancement Points

1. **Backend Integration**
   - User accounts and sync
   - Email notifications
   - Cloud backup

2. **Advanced Features**
   - Calendar view
   - PDF reports
   - Price comparison/history
   - Payment integration

3. **UI Improvements**
   - Dark/Light theme toggle
   - Custom color schemes
   - Advanced search/filters

4. **Performance**
   - IndexedDB for larger datasets
   - Service Worker for offline support
   - Progressive Web App (PWA)

---

This structure is designed to be scalable and maintainable. Each component has a single responsibility, making it easy to modify or extend functionality.
