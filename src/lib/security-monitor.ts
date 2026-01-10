interface SecurityEvent {
  type: 'failed_login' | 'rate_limit' | 'csrf_failure' | 'invalid_token';
  userId?: string;
  ip: string;
  timestamp: Date;
  metadata?: any;
}

export class SecurityMonitor {
  private static events: SecurityEvent[] = [];

  static log(event: SecurityEvent) {
    this.events.push(event);
    
    // If too many events from same IP, alert
    const recentEvents = this.events.filter(
      e => e.ip === event.ip && 
      Date.now() - e.timestamp.getTime() < 60000
    );

    if (recentEvents.length > 10) {
      console.warn(`⚠️ Security alert: ${event.ip} triggered ${recentEvents.length} events`);
      // TODO: Send email alert, block IP, etc.
    }
  }
}