import React from 'react';
import {render} from '@testing-library/react';
import {CalendarMonth} from '../../../src/utils/calendar/CalendarMonth';
import {DateSet} from '../../../src/utils/calendar/DateSet';

describe('CalendarMonth', () => {
    it('renders a calendar month', () => {
        const {container} = render(
            <CalendarMonth year={2025} month={0} />
        );

        const table = container.querySelector('table');
        expect(table).toBeInTheDocument();
    });

    it('marks disabled dates correctly', () => {
        const disabledDates = [
            new Date(2025, 0, 10),
            new Date(2025, 0, 15),
        ];

        const {container} = render(
            <CalendarMonth year={2025} month={0} disabledDates={disabledDates} />
        );

        const allDays = container.querySelectorAll('td');
        const disabledDays = Array.from(allDays).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-disabled')
        );

        expect(disabledDays.length).toBeGreaterThan(0);
    });

    it('renders June 2025 with correct labeled and unlabeled cells when showOutsideDays=false', () => {
        // June 2025: 30 days, starts on Sunday (day 0)
        const {container} = render(
            <CalendarMonth 
                year={2025} 
                month={5}  // June (0-indexed)
                firstDayOfWeek={0}  // Sunday first
                showOutsideDays={false}
            />
        );

        const allCells = container.querySelectorAll('td');
        const cellTexts = Array.from(allCells).map(td => td.textContent?.trim() || '');

        // June 1, 2025 is a Sunday, so no unlabeled cells before June days
        // June has 30 days
        // Grid should show: 30 June days + 5 unlabeled cells after (to complete 5 weeks = 35 cells)
        
        // Find first and last labeled cells
        const labeledCells = cellTexts.filter(text => text !== '');
        const unlabeledCells = cellTexts.filter(text => text === '');

        // Should have exactly 30 labeled cells (June 1-30)
        expect(labeledCells.length).toBe(30);

        // Should have exactly 5 unlabeled cells (July 1-5 to complete the grid)
        expect(unlabeledCells.length).toBe(5);

        // Total cells should be 35 (5 weeks × 7 days)
        expect(allCells.length).toBe(35);

        // Verify no unlabeled cells before June 1
        // First cell should be labeled "1"
        expect(cellTexts[0]).toBe('1');

        // Verify all June days are present in order
        const juneDays = labeledCells.map(text => parseInt(text, 10));
        expect(juneDays).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
                                  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                  21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);

        // Verify the last 5 cells are unlabeled (outside days after June 30)
        expect(cellTexts.slice(-5)).toEqual(['', '', '', '', '']);
    });

    it('renders January 2025 with correct labeled and unlabeled cells when showOutsideDays=false', () => {
        // January 2025: 31 days, starts on Wednesday (day 3)
        const {container} = render(
            <CalendarMonth 
                year={2025} 
                month={0}  // January (0-indexed)
                firstDayOfWeek={0}  // Sunday first
                showOutsideDays={false}
            />
        );

        const allCells = container.querySelectorAll('td');
        const cellTexts = Array.from(allCells).map(td => td.textContent?.trim() || '');

        const labeledCells = cellTexts.filter(text => text !== '');
        const unlabeledCells = cellTexts.filter(text => text === '');

        // Should have exactly 31 labeled cells (January 1-31)
        expect(labeledCells.length).toBe(31);

        // January 1, 2025 is Wednesday, so 3 unlabeled cells before (Sun, Mon, Tue from Dec)
        // After January 31, need to complete the grid
        // Total grid: 31 days + 3 days before = 34 days, rounds up to 35 (5 weeks)
        // So 1 unlabeled cell after
        // Total unlabeled: 3 before + 1 after = 4
        expect(unlabeledCells.length).toBe(4);

        // Verify first 3 cells are unlabeled (December days)
        expect(cellTexts.slice(0, 3)).toEqual(['', '', '']);

        // Verify cells 3-33 contain January days 1-31
        const januaryDays = cellTexts.slice(3, 34).map(text => parseInt(text, 10));
        expect(januaryDays).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
                                     11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                                     21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);

        // Verify last cell is unlabeled (February 1)
        expect(cellTexts[34]).toBe('');
    });

    it('shows outside day labels when showOutsideDays=true with Monday first', () => {
        // January 2025: starts on Wednesday (day 3)
        // With Monday as first day of week, we show: Mon Dec 30, Tue Dec 31, then Wed Jan 1
        const {container} = render(
            <CalendarMonth 
                year={2025} 
                month={0}  // January
                firstDayOfWeek={1}  // Monday first
                showOutsideDays={true}
            />
        );

        const allCells = container.querySelectorAll('td');
        const cellTexts = Array.from(allCells).map(td => td.textContent?.trim() || '');

        // All cells should be labeled now
        const unlabeledCells = cellTexts.filter(text => text === '');
        expect(unlabeledCells.length).toBe(0);

        // First 2 cells should be December days (30, 31)
        // January 1, 2025 is Wednesday, which is 2 days after Monday
        expect(cellTexts[0]).toBe('30');
        expect(cellTexts[1]).toBe('31');

        // 3rd cell should be January 1
        expect(cellTexts[2]).toBe('1');
        
        // Verify January days continue in sequence
        expect(cellTexts[3]).toBe('2');
        expect(cellTexts[4]).toBe('3');
    });

    it('marks selected dates with DateSet', () => {
        const selectedDates = new DateSet([
            new Date(2025, 0, 5),
            new Date(2025, 0, 10),
            new Date(2025, 0, 15),
        ]);

        const {container} = render(
            <CalendarMonth 
                year={2025} 
                month={0}
                datesSelected={selectedDates}
            />
        );

        const allCells = container.querySelectorAll('td');
        const selectedCells = Array.from(allCells).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-selected')
        );

        expect(selectedCells.length).toBe(3);
    });

    it('marks highlighted dates with DateSet', () => {
        const highlightedDates = DateSet.fromRange(
            new Date(2025, 0, 10),
            new Date(2025, 0, 15)
        );

        const {container} = render(
            <CalendarMonth 
                year={2025} 
                month={0}
                datesHighlighted={highlightedDates}
            />
        );

        const allCells = container.querySelectorAll('td');
        const highlightedCells = Array.from(allCells).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-highlighted')
        );

        expect(highlightedCells.length).toBe(6); // Jan 10-15 = 6 days
    });

    it('handles empty DateSet for selected dates', () => {
        const {container} = render(
            <CalendarMonth 
                year={2025} 
                month={0}
                datesSelected={new DateSet()}
            />
        );

        const allCells = container.querySelectorAll('td');
        const selectedCells = Array.from(allCells).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-selected')
        );

        expect(selectedCells.length).toBe(0);
    });

    it('handles undefined DateSet props', () => {
        const {container} = render(
            <CalendarMonth 
                year={2025} 
                month={0}
                datesSelected={undefined}
                datesHighlighted={undefined}
            />
        );

        const table = container.querySelector('table');
        expect(table).toBeInTheDocument();
    });
});
