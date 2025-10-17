/**
 * Creates a 2D array of Date objects representing a calendar month grid.
 * @param year - The year
 * @param month - The month (0-11)
 * @param firstDayOfWeek - The first day of week (0=Sunday, 1=Monday, etc.)
 * @returns 2D array where each inner array is a week of Date objects
 */
export const createMonthGrid = (
    year: number,
    month: number,
    firstDayOfWeek: number
): Date[][] => {
    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Calculate offset (how many days from previous month to show)
    const offset = (firstDayOfMonth - firstDayOfWeek + 7) % 7;
    
    // Get number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate total cells needed (offset + days in month, rounded up to full weeks)
    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
    
    // Generate grid of Date objects
    const grid: Date[][] = [];
    for (let i = 0; i < totalCells; i += 7) {
        const week: Date[] = [];
        for (let j = 0; j < 7; j++) {
            const dayOffset = i + j - offset;
            week.push(new Date(year, month, 1 + dayOffset));
        }
        grid.push(week);
    }
    
    return grid;
};
