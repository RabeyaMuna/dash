import React from 'react';
import {render} from '@testing-library/react';
import Calendar from '../../../src/utils/calendar/Calendar';

// Mock the Dropdown component to avoid issues with optionTypes.js in tests
jest.mock('../../../src/fragments/Dropdown', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require('react');
    return function Dropdown() {
        return React.createElement('div', {'data-testid': 'dropdown-mock'});
    };
});

// Mock the Input component to avoid Dash context issues in tests
jest.mock('../../../src/components/Input', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require('react');
    const InputMock = function Input() {
        return React.createElement('input', {'data-testid': 'input-mock'});
    };
    return {
        __esModule: true,
        default: InputMock,
        HTMLInputTypes: {
            number: 'number',
            text: 'text',
        },
    };
});

describe('Calendar', () => {
    it('renders a calendar', () => {
        const mockOnSelectionChange = jest.fn();

        const {container} = render(
            <Calendar onSelectionChange={mockOnSelectionChange} />
        );

        const calendarWrapper = container.querySelector('.dash-datepicker-calendar-wrapper');
        expect(calendarWrapper).toBeInTheDocument();
    });

    it('marks disabled dates correctly', () => {
        const mockOnSelectionChange = jest.fn();
        const disabledDates = [
            new Date(2025, 0, 10),
            new Date(2025, 0, 15),
        ];

        const {container} = render(
            <Calendar
                onSelectionChange={mockOnSelectionChange}
                initialVisibleDate={new Date(2025, 0, 1)}
                disabledDates={disabledDates}
            />
        );

        const allDays = container.querySelectorAll('td');
        const disabledDays = Array.from(allDays).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-disabled')
        );

        expect(disabledDays.length).toBeGreaterThan(0);
    });

    it('marks selected dates from selectionStart and selectionEnd', () => {
        const mockOnSelectionChange = jest.fn();

        const {container} = render(
            <Calendar
                onSelectionChange={mockOnSelectionChange}
                initialVisibleDate={new Date(2025, 0, 1)}
                selectionStart={new Date(2025, 0, 10)}
                selectionEnd={new Date(2025, 0, 15)}
            />
        );

        const allCells = container.querySelectorAll('td');
        const selectedCells = Array.from(allCells).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-selected')
        );

        // Should have 6 selected days (Jan 10-15 inclusive)
        expect(selectedCells.length).toBe(6);
    });

    it('marks highlighted dates from highlightStart and highlightEnd', () => {
        const mockOnSelectionChange = jest.fn();

        const {container} = render(
            <Calendar
                onSelectionChange={mockOnSelectionChange}
                initialVisibleDate={new Date(2025, 0, 1)}
                highlightStart={new Date(2025, 0, 5)}
                highlightEnd={new Date(2025, 0, 10)}
            />
        );

        const allCells = container.querySelectorAll('td');
        const highlightedCells = Array.from(allCells).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-highlighted')
        );

        // Should have 6 highlighted days (Jan 5-10 inclusive)
        expect(highlightedCells.length).toBe(6);
    });

    it('handles single date selection', () => {
        const mockOnSelectionChange = jest.fn();

        const {container} = render(
            <Calendar
                onSelectionChange={mockOnSelectionChange}
                initialVisibleDate={new Date(2025, 0, 1)}
                selectionStart={new Date(2025, 0, 15)}
            />
        );

        const allCells = container.querySelectorAll('td');
        const selectedCells = Array.from(allCells).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-selected')
        );

        // Should have 1 selected day
        expect(selectedCells.length).toBe(1);
    });
});
