import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Returns YYYY-MM-DD in Malaysia Time (UTC+8)
 */
export function getMYTDateString(baseDate: Date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(baseDate)
}

/**
 * Returns a Date object for a specific cutoff time string (HH:mm) in MYT
 */
export function getMYTCutoff(dateStr: string, cutoffStr: string) {
    const [h, m] = cutoffStr.split(':')
    const [y, mon, d] = dateStr.split('-').map(Number)

    // Create Date in System Time, then convert to MYT
    // Simplified: Create a UTC date and shift it to MYT equivalence
    return new Date(y, mon - 1, d, Number(h), Number(m), 0)
}
