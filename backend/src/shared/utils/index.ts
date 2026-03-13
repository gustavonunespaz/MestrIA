import * as crypto from 'crypto';

export class StringUtils {
  static generateId(): string {
    return crypto.randomUUID();
  }

  static truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }
}

export class DateUtils {
  static now(): Date {
    return new Date();
  }

  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }
}
