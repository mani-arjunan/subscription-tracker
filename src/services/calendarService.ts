import type { Subscription } from '../types/subscription';

export const calendarService = {
  /**
   * Converts subscription billing cycle to iCalendar recurrence rule
   */
  getBillingCycleRRule(billingCycle: string): string {
    const ruleMap: Record<string, string> = {
      monthly: 'FREQ=MONTHLY',
      quarterly: 'FREQ=MONTHLY;INTERVAL=3',
      'bi-annual': 'FREQ=MONTHLY;INTERVAL=6',
      yearly: 'FREQ=YEARLY',
    };
    return ruleMap[billingCycle] || 'FREQ=MONTHLY';
  },

  /**
   * Exports active subscriptions to ICS format
   */
  exportToICS(subscriptions: Subscription[]): string {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');

    if (activeSubscriptions.length === 0) {
      return ''; // Return empty if no active subscriptions
    }

    return this.generateICSManually(activeSubscriptions);
  },

  /**
   * Fallback: Generate ICS manually if ics library fails
   */
  generateICSManually(subscriptions: Subscription[]): string {
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    let ics = 'BEGIN:VCALENDAR\r\n';
    ics += 'VERSION:2.0\r\n';
    ics += 'PRODID:-//Subscription Tracker//EN\r\n';
    ics += `CALSCALE:GREGORIAN\r\n`;
    ics += `METHOD:PUBLISH\r\n`;
    ics += `X-WR-CALNAME:Subscription Renewals\r\n`;
    ics += `X-WR-TIMEZONE:UTC\r\n`;

    subscriptions.forEach((sub) => {
      const renewalDate = new Date(sub.renewalDate);
      const year = renewalDate.getFullYear();
      const month = String(renewalDate.getMonth() + 1).padStart(2, '0');
      const day = String(renewalDate.getDate()).padStart(2, '0');
      const dtstart = `${year}${month}${day}`;

      ics += 'BEGIN:VEVENT\r\n';
      ics += `UID:${sub.id}@subscription-tracker.local\r\n`;
      ics += `DTSTAMP:${now}\r\n`;
      ics += `DTSTART;VALUE=DATE:${dtstart}\r\n`;
      ics += `SUMMARY:${sub.name} - Subscription Renewal\r\n`;
      ics += `DESCRIPTION:Provider: ${sub.provider}\\nCost: ₹${sub.cost.toFixed(2)} ${sub.currency}\\nBilling: ${sub.billingCycle}\\nReminder: ${sub.reminderDaysBefore} days${sub.notes ? '\\nNotes: ' + sub.notes : ''}\r\n`;
      ics += `LOCATION:${sub.provider || 'Online'}\r\n`;
      ics += `CATEGORIES:${sub.category}\r\n`;

      // Add recurrence rule
      const rrule = this.getBillingCycleRRule(sub.billingCycle);
      ics += `RRULE:${rrule}\r\n`;

      // Add alarm/reminder
      ics += 'BEGIN:VALARM\r\n';
      ics += 'TRIGGER:-P' + sub.reminderDaysBefore + 'D\r\n';
      ics += 'ACTION:DISPLAY\r\n';
      ics += `DESCRIPTION:${sub.name} subscription renews soon\r\n`;
      ics += 'END:VALARM\r\n';

      ics += 'END:VEVENT\r\n';
    });

    ics += 'END:VCALENDAR';
    return ics;
  },

  /**
   * Triggers download of ICS file
   */
  downloadICSFile(icsContent: string, filename: string): void {
    if (!icsContent) {
      alert('No active subscriptions to export');
      return;
    }

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  },

  /**
   * Export and download calendar file
   */
  exportAndDownloadCalendar(subscriptions: Subscription[]): void {
    const icsContent = this.exportToICS(subscriptions);
    const filename = `subscriptions-calendar-${new Date().toISOString().split('T')[0]}.ics`;
    this.downloadICSFile(icsContent, filename);
  },
};
