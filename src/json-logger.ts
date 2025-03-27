import { ConsoleLogger, LogLevel } from '@nestjs/common';
import stripAnsi from 'strip-ansi';

export class JsonLogger extends ConsoleLogger {
  protected formatMessage(logLevel: LogLevel, message: unknown): string {
    const logTime = new Date().toISOString();
    const output = stripAnsi(this.stringifyMessage(message, logLevel));

    const logDict = {
      EventMessage: output,
      EventCount: 1,
      EventStartTime: logTime,
      EventEndTime: logTime,
      EventResult: 'NA',
      EventSeverity: this.getEventSeverity(logLevel),
      EventOriginalSeverity: logLevel,
      EventSchema: 'ProcessEvent',
      EventSchemaVersion: '0.1.4',
      ActingAppType: 'NestJS',
      AdditionalFields: {},
    };

    return `${JSON.stringify(logDict)}\n`;
  }

  private getEventSeverity(level: LogLevel): string {
    const severityMap = {
      log: 'INFO',
      error: 'ERROR',
      warn: 'WARNING',
      debug: 'DEBUG',
      verbose: 'VERBOSE',
    };
    return severityMap[level] || 'UNKNOWN';
  }
}
