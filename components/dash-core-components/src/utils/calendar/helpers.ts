/**
 * Converts a date to a numeric key (days since Unix epoch) for use in Sets/Objects.
 * Normalizes to midnight for consistent comparison.
 * This allows arithmetic operations: key + 1 = next day, key - 7 = previous week
 */
export function dateAsNum(date: Date): number {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return Math.floor(normalized.getTime() / (1000 * 60 * 60 * 24));
}

/**
 * Converts a number of days since Unix epoch back into a Date object.
 * Inverse of dateAsNum. Always returns midnight (00:00:00) in local timezone.
 */
export function numAsDate(key: number): Date {
    // Convert key to milliseconds (UTC timestamp)
    const utcDate = new Date(key * 24 * 60 * 60 * 1000);
    // Extract UTC date components and create local date
    return new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate()
    );
}

export function monthAsNum(month: string): number {
    return parseInt(month, 10) - 1;
}

export function monthAsStr(month: number): string {
    return String(month + 1).padStart(2, '0');
}

export function strAsDate(date?: string): Date | undefined {
    const parts = `${date}`.split('-');
    if (parts.length !== 3) {
        return undefined;
    }
    const year = parseInt(parts[0], 10);
    const month = monthAsNum(parts[1]);
    const day = parseInt(parts[2], 10);

    if ([year, month, day].some(n => isNaN(n))) {
        return undefined;
    }

    return new Date(year, month, day);
}

export function dateAsStr(
    date?: Date
): `${string}-${string}-${string}` | undefined {
    if (date) {
        const formattedYear = String(date.getFullYear());
        const formattedMonth = monthAsStr(date.getMonth());
        const formattedDay = String(date.getDate()).padStart(2, '0');

        return `${formattedYear}-${formattedMonth}-${formattedDay}`;
    }
    return undefined;
}

export function isDateInRange(
    targetDate: Date,
    minDate?: Date,
    maxDate?: Date
): boolean {
    const targetKey = dateAsNum(targetDate);

    if (minDate && targetKey < dateAsNum(minDate)) {
        return false;
    }

    if (maxDate && targetKey > dateAsNum(maxDate)) {
        return false;
    }

    return true;
}
