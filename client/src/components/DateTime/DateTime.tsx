import { useState, useEffect } from 'react';
import './DateTime.css'

interface DateTimeProps {
    value: string | undefined;
    onDateUpdate?: (newTime: string) => void;
    onChange?: () => void;
}

function DateTime(props: DateTimeProps) {
    const [day, setDay] = useState<number>(1);
    const [month, setMonth] = useState<number>(1);
    const [year, setYear] = useState<number>(0);
    const [hour, setHour] = useState<number>(0);
    const [minute, setMinute] = useState<number>(0);

    useEffect(() => {
        if (props.value) {
            const date = new Date(props.value);
            console.log(props.value, date);
            const formatter = new Intl.DateTimeFormat("default", {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: false,
            });

            console.log(date);
            const parts = formatter.formatToParts(date);
            const partMap: Record<string, string> = {};
            parts.forEach(({ type, value }) => {
                partMap[type] = value;
            });

            setDay(Number(partMap.day));
            setMonth(Number(partMap.month));
            setYear(Number(partMap.year));
            setHour(Number(partMap.hour));
            setMinute(Number(partMap.minute));
        }
    }, [props.value]);

    const updateDate = (newDay: number, newMonth: number, newYear: number, newHour: number, newMinute: number) => {
        const newDate = new Date(newYear, newMonth - 1, newDay, newHour, newMinute);

        if (props.onDateUpdate) {
            console.log(newDate);
            props.onDateUpdate(newDate.getTime().toString());
        }
    }

    const notifyInputChange = () => {
        if (props.onInputChange) {
            props.onInputChange();
        }
    }

    const handleBlur = () => {
        updateDate(day, month, year, hour, minute);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            updateDate(day, month, year, hour, minute);

            const form = e.currentTarget.form;
            if (form) {
                if (typeof form.requestSubmit === "function") {
                    form.requestSubmit();
                } else {
                    form.submit();
                }
            }
        }
    }

    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDay = Number(e.target.value);
        if (newDay >= 1 && newDay <= 31) {
            setDay(newDay);
        }
        notifyInputChange();
    }

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonth = Number(e.target.value);
        if (newMonth >= 1 && newMonth <= 12) {
            setMonth(newMonth);
        }
        notifyInputChange();
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("???", e.target.value);
        const newYear = Number(e.target.value);
        // I really hope no-one is using this after the year 3000
        if (newYear >= 1 && newYear <= 3000) {
            setYear(newYear);
        }
        notifyInputChange();
    }

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHour = Number(e.target.value);
        if (newHour >= 0 && newHour <= 23) {
            setHour(newHour);
        }
        notifyInputChange();
    }

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMinute = Number(e.target.value);
        if (newMinute >= 0 && newMinute <= 59) {
            setMinute(newMinute);
        }
        notifyInputChange();
    }

    return (
        <div className="DateTime">
            <input type="text" inputMode="numeric" className="day" value={day.toString().padStart(2, "0")} onChange={handleDayChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="Day" />
            <span className="delimiter">.</span>
            <input type="text" inputMode="numeric" className="month" value={month.toString().padStart(2, "0")} onChange={handleMonthChange} onKeyDown={handleKeyDown} onBlur={handleBlur}  placeholder="Month" />
            <span className="delimiter">.</span>
            <input type="text" inputMode="numeric" className="year" value={year.toString().padStart(4, "0")} onChange={handleYearChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="Year" />
            <span className="delimiter gap"></span>
            <input type="text" inputMode="numeric" className="hour" value={hour.toString().padStart(2, "0")} onChange={handleHourChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="Hour" />
            <span className="delimiter">.</span>
            <input type="text" inputMode="numeric" className="minute" value={minute.toString().padStart(2, "0")} onChange={handleMinuteChange} onKeyDown={handleKeyDown} onBlur={handleBlur} placeholder="Minute" />
        </div>
    )
}

export default DateTime
