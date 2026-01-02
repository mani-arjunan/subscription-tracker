export type BackupFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BackupSettings {
  frequency: BackupFrequency;
  lastBackupDate: string | null;
}

const BACKUP_SETTINGS_KEY = 'subscription_tracker_backup_settings';

const FREQUENCY_DAYS: Record<BackupFrequency, number> = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

export const BackupService = {
  getSettings(): BackupSettings {
    try {
      const stored = localStorage.getItem(BACKUP_SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Default settings
    }
    return {
      frequency: 'monthly',
      lastBackupDate: null,
    };
  },

  saveSettings(settings: BackupSettings): void {
    localStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(settings));
  },

  setFrequency(frequency: BackupFrequency): void {
    const settings = this.getSettings();
    settings.frequency = frequency;
    this.saveSettings(settings);
  },

  recordBackup(): void {
    const settings = this.getSettings();
    settings.lastBackupDate = new Date().toISOString();
    this.saveSettings(settings);
  },

  shouldAutoBackup(): boolean {
    const settings = this.getSettings();
    if (!settings.lastBackupDate) {
      return true;
    }

    const lastBackup = new Date(settings.lastBackupDate);
    const now = new Date();
    const daysSinceBackup = Math.floor(
      (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceBackup >= FREQUENCY_DAYS[settings.frequency];
  },

  getLastBackupDate(): string {
    const settings = this.getSettings();
    if (settings.lastBackupDate) {
      return new Date(settings.lastBackupDate).toLocaleDateString();
    }
    return 'Never';
  },

  getFrequency(): BackupFrequency {
    return this.getSettings().frequency;
  },
};
