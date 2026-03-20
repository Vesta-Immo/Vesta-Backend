import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimStringsPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (!value || typeof value !== 'object') {
      return value;
    }

    const clone = { ...(value as Record<string, unknown>) };

    for (const [key, current] of Object.entries(clone)) {
      if (typeof current === 'string') {
        clone[key] = current.trim();
      }
    }

    return clone;
  }
}
