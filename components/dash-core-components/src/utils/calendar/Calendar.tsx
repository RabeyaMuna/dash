import React, {useEffect, useMemo, useRef, useState} from 'react';
import Input, {HTMLInputTypes} from '../../components/Input';
import Dropdown from '../../fragments/Dropdown';
import {DayOfWeek} from '../../types';
import {CalendarMonth} from './CalendarMonth';
import {DateSet} from './DateSet';

type CalendarProps = {
    onSelectionChange: (selectionStart: Date, selectionEnd?: Date) => void;
    selectionStart?: Date;
    selectionEnd?: Date;
    highlightStart?: Date;
    highlightEnd?: Date;
    initialVisibleDate?: Date;
    minDateAllowed?: Date;
    maxDateAllowed?: Date;
    disabledDates?: Date[];
    firstDayOfWeek?: DayOfWeek;
    showOutsideDays?: boolean;
    calendarOrientation?: 'vertical' | 'horizontal';
    numberOfMonthsShown?: number;
    daySize?: number;
    isRTL?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
};

const Calendar = ({
    initialVisibleDate = new Date(),
    onSelectionChange,
    selectionStart,
    selectionEnd,
    highlightStart,
    highlightEnd,
    minDateAllowed,
    maxDateAllowed,
    disabledDates,
    firstDayOfWeek,
    showOutsideDays,
    calendarOrientation,
    numberOfMonthsShown,
    daySize,
    isRTL,
    disabled,
    autoFocus = true,
}: CalendarProps) => {
    const [activeYear, setActiveYear] = useState(() =>
        initialVisibleDate.getFullYear()
    );
    const [activeMonth, setActiveMonth] = useState(() =>
        initialVisibleDate.getMonth()
    );
    const [focusedDate, setFocusedDate] = useState(initialVisibleDate);
    const [highlightedDates, setHighlightedDates] = useState(new DateSet());
    const calendarContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const monthChanged = focusedDate.getMonth() !== activeMonth;
        const yearChanged = focusedDate.getFullYear() !== activeYear;
        if (monthChanged || yearChanged) {
            setActiveMonth(focusedDate.getMonth());
            setActiveYear(focusedDate.getFullYear());
        }
    }, [focusedDate]);

    useEffect(() => {
        setHighlightedDates(DateSet.fromRange(highlightStart, highlightEnd));
    }, [highlightStart, highlightEnd]);

    const selectedDates = useMemo(
        () => DateSet.fromRange(selectionStart, selectionEnd),
        [selectionStart, selectionEnd]
    );

    const monthOptions = Array.from({length: 12}, (_, i) => {
        const date = new Date(activeYear, i, 1);
        const monthName = new Intl.DateTimeFormat(undefined, {
            month: 'long',
        }).format(date);
        return {
            label: monthName,
            value: i,
        };
    });

    // Set up native wheel event listener with passive: false to prevent page scroll
    useEffect(() => {
        const container = calendarContainerRef.current;
        if (!container) {
            return undefined;
        }

        let scrollAccumulator = 0;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Accumulate scroll delta until threshold is reached, then change the active month
            // This respects OS scroll speed settings and works well with trackpads
            const threshold = 100; // Adjust this to control sensitivity

            scrollAccumulator += e.deltaY;

            // Check if we've scrolled enough to change months
            if (Math.abs(scrollAccumulator) >= threshold) {
                // Determine direction and change month
                if (scrollAccumulator > 0) {
                    // Scroll down - go to next month
                    setActiveMonth(m => {
                        if (m === 11) {
                            setActiveYear(y => y + 1);
                            return 0;
                        }
                        return m + 1;
                    });
                } else {
                    // Scroll up - go to previous month
                    setActiveMonth(m => {
                        if (m === 0) {
                            setActiveYear(y => y - 1);
                            return 11;
                        }
                        return m - 1;
                    });
                }
                scrollAccumulator = 0; // Reset accumulator after month change
            }
        };

        // Add listener with passive: false to allow preventDefault
        container.addEventListener('wheel', handleWheel, {passive: false});

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div className="dash-datepicker-calendar-wrapper">
            <Dropdown
                options={monthOptions}
                value={activeMonth}
                maxHeight={250}
                searchable={false}
                setProps={({value}) => {
                    if (Number.isInteger(value)) {
                        setActiveMonth(value as number);
                    }
                }}
            />
            <Input
                type={HTMLInputTypes.number}
                debounce={0.5}
                value={activeYear}
                setProps={({value}) => {
                    if (Number.isInteger(value)) {
                        setActiveYear(value as number);
                    }
                }}
                style={{width: '118px'}}
            />
            <div ref={calendarContainerRef}>
                <CalendarMonth
                    year={activeYear}
                    month={activeMonth}
                    minDateAllowed={minDateAllowed}
                    maxDateAllowed={maxDateAllowed}
                    disabledDates={disabledDates}
                    dateFocused={focusedDate}
                    onDayFocused={setFocusedDate}
                    datesSelected={selectedDates}
                    onDaySelected={onSelectionChange}
                    datesHighlighted={highlightedDates}
                    onDaysHighlighted={setHighlightedDates}
                    firstDayOfWeek={firstDayOfWeek}
                    showOutsideDays={showOutsideDays}
                />
            </div>
        </div>
    );
};

export default Calendar;
