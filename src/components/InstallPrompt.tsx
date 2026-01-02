import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALL_PROMPT_DISMISSED_KEY = 'subscription-tracker-install-dismissed';
const INSTALL_PROMPT_ACCEPTED_KEY = 'subscription-tracker-install-accepted';

export const InstallPrompt: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user already dismissed the prompt or installed the app
    const wasDismissed = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY);
    const wasAccepted = localStorage.getItem(INSTALL_PROMPT_ACCEPTED_KEY);
    const isInstalledAsApp = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (wasDismissed || wasAccepted || isInstalledAsApp) {
      return; // Don't show the prompt
    }

    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Stash the event for later use
      setDeferredPrompt(event);
      // Show the install prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Fallback: Show banner after 2 seconds if event hasn't fired
    // This handles cases where beforeinstallprompt doesn't fire reliably
    const timeoutId = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Show the install prompt if we have the deferred event
      try {
        await deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          // Mark as installed so we don't show again
          localStorage.setItem(INSTALL_PROMPT_ACCEPTED_KEY, 'true');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Error showing install prompt:', err);
      }
    } else {
      // Fallback: If no deferred prompt, just mark as dismissed
      // User can use browser's native install button
      localStorage.setItem(INSTALL_PROMPT_ACCEPTED_KEY, 'true');
    }

    setShowPrompt(false);
  };

  const handleDismiss = () => {
    // Mark as dismissed so we don't show for a while
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: isDark ? 'rgba(15, 17, 21, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderBottom: `1px solid ${isDark ? 'rgba(201, 194, 166, 0.1)' : '#e5e7eb'}`,
        padding: '12px 20px',
        zIndex: 40,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📲</span>
        <div>
          <p
            style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: isDark ? '#c9c2a6' : '#000000',
              margin: '0 0 2px 0',
            }}
          >
            Install Subscription Tracker
          </p>
          <p
            style={{
              fontSize: '0.85rem',
              color: isDark ? '#c9c2a6' : '#666666',
              opacity: 0.7,
              margin: 0,
            }}
          >
            Use offline, faster access, home screen icon
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleInstall}
          style={{
            padding: '8px 16px',
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#3b82f6',
            color: isDark ? '#60a5fa' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark
              ? 'rgba(59, 130, 246, 0.3)'
              : '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isDark
              ? 'rgba(59, 130, 246, 0.2)'
              : '#3b82f6';
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: isDark ? '#c9c2a6' : '#666666',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark
              ? 'rgba(201, 194, 166, 0.1)'
              : '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Dismiss"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
