# Quick Start Guide

## Getting Up and Running in 2 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Dev Server
```bash
npm run dev
```

The app will open at `http://localhost:5173` ✨

### 3. Start Using!
1. Click **"Add Subscription"** button
2. Fill in your first subscription details
3. Click **"Enable Notifications"** for reminders
4. Start adding more subscriptions!

---

## First Time Setup Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Start dev server (`npm run dev`)
- [ ] Enable browser notifications (click the bell icon)
- [ ] Add your first subscription
- [ ] Test edit functionality
- [ ] Export your data as backup
- [ ] Try importing the backup

---

## Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check (TypeScript)
tsc --noEmit

# Run build validation
npm run build
```

---

## Features to Try First

### 1. Add Multiple Subscriptions
- Try adding Netflix, Spotify, and other services
- Use different categories and billing cycles
- Notice the monthly cost calculation

### 2. Test Reminders
- Set "Remind me before" to 0 days for an active subscription
- Enable notifications
- You should see a notification appear immediately

### 3. Export Your Data
- Click Settings (gear icon)
- Click "Export Data"
- Your subscriptions are saved as JSON

### 4. Filter by Category
- Add subscriptions in different categories
- Click category buttons to filter
- Notice the stats update in real-time

### 5. Edit & Delete
- Click "Edit" on any subscription
- Modify and save
- Click "Delete" to remove (with confirmation)

---

## Tips

💡 **Pro Tips:**
- Set different reminder days for different subscriptions
- Use Notes field to store promo codes or account info
- Mark subscriptions as "Paused" instead of deleting
- Export regularly to back up your data
- Check the monthly cost in the dashboard to find expensive subscriptions

---

## What's Where?

| Task | Where |
|------|-------|
| Add a subscription | Big button bottom-right (or click "Add Subscription") |
| Enable reminders | Bell icon in top-right header |
| Export/Import data | Settings (gear) icon in header |
| Filter by category | Category buttons below stats |
| See monthly cost | Dashboard stat card at top |
| Edit subscription | Click "Edit" on any card |
| Delete subscription | Click "Delete" on any card (with confirmation) |

---

## Keyboard Shortcuts (Future Feature)

These will be available in v2:
- `+` - Add new subscription
- `E` - Export data
- `I` - Import data
- `Esc` - Close modal/form

---

## Troubleshooting

### Dev server won't start?
```bash
# Kill existing process and restart
npm run dev
```

### Notifications not working?
1. Click "Enable Notifications" button
2. Allow notifications in browser popup
3. Check browser notification settings

### Lost your data?
1. Check if you exported a backup JSON file
2. Click "Import Data" and select the backup
3. Your subscriptions are restored!

### Port 5173 already in use?
```bash
# Vite will automatically use next available port
npm run dev
```

---

## Next Steps

After getting comfortable with the basics:

1. **Organize Your Life** - Add all your actual subscriptions
2. **Set Smart Reminders** - Configure reminders for each service
3. **Track Spending** - Review the monthly cost dashboard
4. **Create Backups** - Export your data monthly
5. **Share Ideas** - Suggest new features or improvements

---

## Build for Production

When you're ready to deploy:

```bash
# Create optimized build
npm run build

# Check the output
ls -la dist/

# Test production build locally
npm run preview
```

The `dist/` folder contains everything needed to deploy to any static hosting (Netlify, Vercel, GitHub Pages, etc.)

---

## Need Help?

- Check `README.md` for detailed documentation
- Check `PROJECT_STRUCTURE.md` to understand the codebase
- Review component files for inline comments
- All types are in `src/types/subscription.ts`

---

Happy tracking! 🎉
