import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as Popover from '@radix-ui/react-popover';
import {CalendarIcon} from '@radix-ui/react-icons';
import Calendar from '../utils/calendar/Calendar';
import {DatePickerSingleProps} from '../types';
import {dateAsStr, strAsDate} from '../utils/calendar/helpers';
import '../components/css/datepickers.css';
import uuid from 'uniqid';

const DatePickerSingle = ({
    id,
    date,
    initial_visible_month,
    min_date_allowed,
    max_date_allowed,
    disabled_days,
    first_day_of_week,
    show_outside_days,
    setProps,
}: DatePickerSingleProps) => {
    const dateObj = strAsDate(date);
    const initialMonth = strAsDate(initial_visible_month);
    const minDate = strAsDate(min_date_allowed);
    const maxDate = strAsDate(max_date_allowed);
    const disabledDates = useMemo(
        () => disabled_days?.map(strAsDate).filter((d): d is Date => d !== undefined),
        [disabled_days]
    );

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [calendarFocused, setCalendarFocused] = useState(false);
    const [inputValue, setInputValue] = useState<string | undefined>(date);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(date);
    }, [date]);

    useEffect(() => {
        if (!isCalendarOpen) {
            inputRef.current?.focus();
            if (calendarFocused) {
                setCalendarFocused(false);
            }
        }
    }, [isCalendarOpen]);

    const sendInputAsDate = useCallback(() => {
        const parsed = strAsDate(inputValue);
        if (parsed) {
            setProps({date: dateAsStr(parsed)});
        } else {
            setInputValue(date);
        }
    }, [inputValue, setInputValue, date, setProps]);

    const handleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!isCalendarOpen) {
                    setIsCalendarOpen(true);
                    sendInputAsDate();
                }
                setCalendarFocused(true);
            } else if (e.key === 'Enter') {
                sendInputAsDate();
            }
        },
        [isCalendarOpen, inputValue]
    );

    const accessibleId = id ?? uuid();

    return (
        <div className="dash-datepicker" ref={containerRef}>
            <Popover.Root
                open={isCalendarOpen}
                onOpenChange={setIsCalendarOpen}
            >
                <Popover.Trigger asChild>
                    <div
                        className="dash-datepicker-input-wrapper"
                        aria-labelledby={`${accessibleId}`}
                        aria-haspopup="dialog"
                        aria-expanded={isCalendarOpen}
                    >
                        <CalendarIcon className="dash-datepicker-trigger-icon" />
                        <input
                            ref={inputRef}
                            type="text"
                            id={accessibleId}
                            className="dash-datepicker-input"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            onBlur={sendInputAsDate}
                            placeholder="YYYY-MM-DD"
                        />
                    </div>
                </Popover.Trigger>

                <Popover.Portal container={containerRef.current}>
                    <Popover.Content
                        className="dash-datepicker-content"
                        align="start"
                        sideOffset={5}
                        onOpenAutoFocus={e => e.preventDefault()}
                    >
                        <div ref={calendarRef}>
                            <Calendar
                                initialVisibleDate={initialMonth || dateObj}
                                selectionStart={dateObj}
                                minDateAllowed={minDate}
                                maxDateAllowed={maxDate}
                                disabledDates={disabledDates}
                                firstDayOfWeek={first_day_of_week}
                                showOutsideDays={show_outside_days}
                                autoFocus={calendarFocused}
                                onSelectionChange={selection => {
                                    const dateStr = dateAsStr(selection);
                                    setProps({date: dateStr});
                                    setInputValue(dateStr);
                                    setIsCalendarOpen(false);
                                }}
                            />
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
};

export default DatePickerSingle;
