import React from 'react';
import {render, waitFor} from '@testing-library/react';
import DatePickerSingle from '../../../src/fragments/DatePickerSingle';

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

describe('DatePickerSingle', () => {
    it('renders a date picker', () => {
        const mockSetProps = jest.fn();

        const {container, unmount} = render(
            <DatePickerSingle setProps={mockSetProps} />
        );

        const datepicker = container.querySelector('.dash-datepicker');
        expect(datepicker).toBeInTheDocument();
        
        unmount();
    });

    it('marks disabled days correctly', async () => {
        const mockSetProps = jest.fn();
        const disabledDays = ['2025-01-10', '2025-01-15'];

        const {container, unmount} = render(
            <DatePickerSingle
                setProps={mockSetProps}
                initial_visible_month="2025-01-01"
                disabled_days={disabledDays}
            />
        );

        // Click the trigger to open the calendar
        const trigger = container.querySelector('.dash-datepicker-input-wrapper');
        trigger?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

        // Wait for calendar to render
        await waitFor(() => {
            const allDays = container.querySelectorAll('td');
            expect(allDays.length).toBeGreaterThan(0);
        });

        const allDays = container.querySelectorAll('td');
        const disabledDays_rendered = Array.from(allDays).filter(td =>
            td.classList.contains('dash-datepicker-calendar-date-disabled')
        );

        expect(disabledDays_rendered.length).toBeGreaterThan(0);
        
        unmount();
    });
});
