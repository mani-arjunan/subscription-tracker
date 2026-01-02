# Subscription Tracker

A beautiful, feature-rich web application to track and manage all your media subscriptions in one place. Keep track of costs, renewal dates, and get timely reminders before charges hit your account.

## Features

✨ **Core Features:**
- **Add/Edit/Delete Subscriptions** - Easily manage all your subscriptions
- **Manual Entry** - Full flexibility to add any subscription provider
- **Multiple Categories** - Organize subscriptions by type (Streaming, Music, Productivity, Gaming, Education, Other)
- **Flexible Billing Cycles** - Support for Monthly, Quarterly, Bi-annual, and Yearly subscriptions
- **Cost Tracking** - Track monthly costs and calculate average costs for different billing cycles
- **Multi-Currency Support** - USD, EUR, GBP, INR, CAD, AUD

🔔 **Reminder System:**
- Browser Notifications - Get alerts when subscriptions are about to renew
- Customizable Reminder Days - Set how many days before renewal you want to be notified
- Persistent Notifications - Reminders are checked every minute

📊 **Dashboard & Analytics:**
- Real-time Stats - Total active subscriptions, monthly cost, upcoming renewals
- Category Breakdown - See cost distribution across categories
- Upcoming Renewals View - 30-day upcoming renewal calendar
- Category Filtering - Filter subscriptions by type for better organization

💾 **Data Management:**
- Local Storage - All data stored locally in your browser (no account needed)
- Export Data - Backup your subscriptions as JSON
- Import Data - Restore subscriptions from backup files

🎨 **Beautiful UI:**
- Modern gradient design with Tailwind CSS
- Responsive layout (works on desktop, tablet, mobile)
- Dark theme with purple gradients
- Smooth animations and transitions

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **State Management**: Zustand
- **Icons**: Lucide React
- **Storage**: Browser localStorage (no backend required)
- **Notifications**: Browser Notifications API

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd subscription-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Usage Guide

### Adding a Subscription

1. Click the **"Add Subscription"** button (bottom-right corner)
2. Fill in the subscription details:
   - **Provider Name**: Name of the service (e.g., Netflix, Spotify)
   - **Provider Website**: Optional URL to the provider
   - **Cost**: Amount charged per billing cycle
   - **Currency**: Select your preferred currency
   - **Billing Cycle**: How often you're charged (Monthly, Quarterly, etc.)
   - **Next Renewal Date**: When the next charge will occur
   - **Category**: Type of subscription
   - **Status**: Mark as Active, Paused, or Cancelled
   - **Reminder Days**: How many days before renewal to notify you
   - **Notes**: Optional notes about the subscription

3. Click **"Add Subscription"** to save

### Managing Reminders

1. Click **"Enable Notifications"** button in the header
2. Allow browser notifications when prompted
3. Set **"Remind me before (days)"** when adding/editing subscriptions
4. You'll receive a notification on the renewal date

### Viewing & Filtering

- Use category buttons to filter subscriptions
- View stats dashboard at the top for quick insights
- Click **Edit** to modify or **Delete** to remove subscriptions

### Backing Up Data

1. Click **Settings** icon (gear icon)
2. Click **"Export Data"** to download a JSON backup
3. To restore, click **"Import Data"** and select the JSON file

## Data Storage

- **Location**: Browser localStorage (no server, completely private)
- **Capacity**: ~5MB per domain (usually enough for 1000+ subscriptions)
- **Persistence**: Data persists until you clear browser data
- **Backup**: Always keep exported JSON backups of important data

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Any modern browser supporting:
  - localStorage
  - Notifications API
  - ES6+ JavaScript

## Tips & Tricks

1. **Export regularly** - Create backups of your subscription list
2. **Use Notes** - Add promo codes, account info, or cancellation URLs
3. **Set optimal reminders** - 7 days before is usually good for planning
4. **Check monthly cost** - The dashboard shows average monthly spend
5. **Review categories** - Use categories to find high-spend areas

## Future Enhancements

Potential features for future versions:
- Email notifications (requires backend)
- Spending trends & charts
- Subscription recommendations
- Calendar view of renewals
- Dark/Light theme toggle
- Multi-device sync (requires backend)
- PDF reports
- Integration with payment apps

## Privacy & Security

✅ **Your data is yours:**
- All data stays on your device
- No data is sent to any server
- No tracking or analytics
- No third-party integrations
- You can export and delete anytime

## Troubleshooting

**Notifications not working?**
- Check browser notification permissions in browser settings
- Click "Enable Notifications" button again
- Ensure your browser supports Notifications API

**Data disappeared?**
- Check if you accidentally cleared browser data/cookies
- Try importing from an exported backup
- Check browser's storage quota

**Performance slow?**
- Try exporting and clearing old cancelled subscriptions
- Restart your browser

## License

MIT License - Feel free to use and modify for personal use

---

**Made with 💜 for subscription lovers everywhere**
