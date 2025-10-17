import React, {useCallback, useMemo, useState} from 'react';
import CalendarDay from './CalendarDay';
import {createMonthGrid} from './createMonthGrid';
import {dateAsNum, numAsDate, isDateInRange} from './helpers';
import {DateSet} from './DateSet';
import '../../components/css/calendar.css';

type CalendarMonthProps = {
    year: number;
    month: number; // 0-11 representing January-December;
    dateFocused?: Date;
    datesSelected?: DateSet;
    datesHighlighted?: DateSet;
    minDateAllowed?: Date;
    maxDateAllowed?: Date;
    disabledDates?: Date[];
    onDaySelected?: (date: Date) => void;
    onDayFocused?: (date: Date) => void;
    onDaysHighlighted?: (days: DateSet) => void;
    firstDayOfWeek?: number; // 0-7
    showOutsideDays?: boolean;
};

export const CalendarMonth = ({
    year,
    month,
    onDaySelected,
    onDayFocused,
    onDaysHighlighted,
    datesSelected,
    datesHighlighted,
    minDateAllowed,
    maxDateAllowed,
    disabledDates,
    firstDayOfWeek = 0,
    showOutsideDays = false,
    ...props
}: CalendarMonthProps): JSX.Element => {
    // Generate grid of dates
    const gridDates = useMemo(
        () => createMonthGrid(year, month, firstDayOfWeek),
        [year, month, firstDayOfWeek]
    );

    // Helper to compute if a date is disabled
    const disabledDateKeys = useMemo(
        () => new Set(disabledDates?.map(d => dateAsNum(d)) ?? []),
        [disabledDates]
    );

    const computeIsDisabled = useCallback(
        (date: Date): boolean => {
            return (
                !isDateInRange(date, minDateAllowed, maxDateAllowed) ||
                disabledDateKeys.has(dateAsNum(date))
            );
        },
        [minDateAllowed, maxDateAllowed, disabledDateKeys]
    );

    const computeIsOutside = useCallback(
        (date: Date): boolean => {
            return date.getMonth() !== month;
        },
        [month]
    );

    const computeLabel = useCallback(
        (date: Date): string => {
            const isOutside = computeIsOutside(date);
            if (!showOutsideDays && isOutside) {
                return '';
            }
            return String(date.getDate());
        },
        [showOutsideDays, computeIsOutside]
    );

    // Days of the week headers using user's locale, adjusted for first day of week
    const daysOfTheWeek = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(undefined, {
            weekday: 'short',
        });
        // eslint-disable-next-line no-magic-numbers
        return Array.from({length: 7}, (_, i) =>
            formatter.format(new Date(2023, 0, ((i + firstDayOfWeek) % 7) + 1))
        );
    }, [firstDayOfWeek]);

    const [selectionStart, setSelectionStart] = useState<Date>();

    const confirmSelection = useCallback(
        (date: Date) => {
            setSelectionStart(undefined);
            const isOutside = computeIsOutside(date);
            if (isOutside && !showOutsideDays) {
                return;
            }
            onDaySelected?.(date);
        },
        [onDaySelected, showOutsideDays, computeIsOutside]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, date: Date) => {
            // Use key arithmetic for efficient navigation
            const oldDate = dateAsNum(date);
            let newDate = oldDate;

            switch (e.key) {
                case 'ArrowRight':
                    newDate = oldDate + 1;
                    break;
                case 'ArrowLeft':
                    newDate = oldDate - 1;
                    break;
                case 'ArrowDown':
                    newDate = oldDate + 7;
                    break;
                case 'ArrowUp':
                    newDate = oldDate - 7;
                    break;
                case 'PageDown':
                    newDate = oldDate + 30;
                    break;
                case 'PageUp':
                    newDate = oldDate - 30;
                    break;
                default:
                    return;
            }

            if (newDate !== oldDate) {
                e.preventDefault();
                onDayFocused?.(numAsDate(newDate));
            }
        },
        [onDayFocused]
    );

    const handleKeyUp = useCallback(
        (e: React.KeyboardEvent, date: Date) => {
            switch (e.key) {
                case ' ':
                case 'Enter': {
                    e.preventDefault();
                    confirmSelection(date);
                    break;
                }
                default:
                    return;
            }
        },
        [confirmSelection]
    );

    return (
        <table className="dash-datepicker-calendar">
            <thead>
                <tr>
                    {daysOfTheWeek.map((day, i) => (
                        <th key={i}>
                            <span>{day}</span>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {gridDates.map((week, i) => (
                    <tr key={i} className="dash-datepicker-calendar-week">
                        {week.map((date, j) => (
                            <CalendarDay
                                key={j}
                                label={computeLabel(date)}
                                isOutside={computeIsOutside(date)}
                                onMouseDown={() => {
                                    setSelectionStart(date);
                                    onDaysHighlighted?.(new DateSet([date]));
                                }}
                                onMouseUp={() => confirmSelection(date)}
                                onMouseEnter={() => {
                                    if (!selectionStart) {
                                        return;
                                    }
                                    const selectionRange = DateSet.fromRange(
                                        selectionStart,
                                        date
                                    );
                                    onDaysHighlighted?.(selectionRange);
                                }}
                                onFocus={() => onDayFocused?.(date)}
                                onKeyDown={e => handleKeyDown(e, date)}
                                onKeyUp={e => handleKeyUp(e, date)}
                                isFocused={
                                    props.dateFocused !== undefined &&
                                    date.getFullYear() ===
                                        props.dateFocused.getFullYear() &&
                                    date.getMonth() ===
                                        props.dateFocused.getMonth() &&
                                    date.getDate() ===
                                        props.dateFocused.getDate()
                                }
                                isSelected={datesSelected?.has(date) ?? false}
                                isHighlighted={
                                    datesHighlighted?.has(date) ?? false
                                }
                                isDisabled={computeIsDisabled(date)}
                            />
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
