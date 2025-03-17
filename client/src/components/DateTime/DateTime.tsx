import { useState, useEffect } from 'react';
import './DateTime.css'

interface DateTimeProps {
    value: string;
    onChange?: (newTime: string) => void;
}

function DateTime(props: DateTimeProps) {
    const [day, setDay] = useState<number>(1);
    const [month, setMonth] = useState<number>(1);
    const [year, setYear] = useState<number>(1970);
    const [hour, setHour] = useState<number>(0);
    const [minute, setMinute] = useState<number>(0);

    useEffect(() => {
        const date = new Date(props.value);
        const formatter = new Intl.DateTimeFormat("default", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: false,
        });

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
    }, [props.value]);

    const updateDate = (newDay: number, newMonth: number, newYear: number, newHour: number, newMinute: number) => {
        const newDate = new Date(newYear, newMonth - 1, newDay, newHour, newMinute);

        if (props.onChange) {
            props.onChange(newDate.getTime().toString());
        }
    }

    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDay = Number(e.target.value);
        if (newDay >= 1 && newDay <= 31) {
            setDay(newDay);
        }
        updateDate(newDay, month, year, hour, minute);
    }

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonth = Number(e.target.value);
        if (newMonth >= 1 && newMonth <= 12) {
            setMonth(newMonth);
        }
        updateDate(newMonth, month, year, hour, minute);
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newYear = Number(e.target.value);
        // I really hope no-one is using this after the year 3000
        if (newYear >= 1 && newYear <= 3000) {
            setYear(newYear);
        }
        updateDate(newYear, month, year, hour, minute);
    }

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHour = Number(e.target.value);
        if (newHour >= 1 && newHour <= 23) {
            setHour(newHour);
        }
        updateDate(newHour, month, year, hour, minute);
    }

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMinute = Number(e.target.value);
        if (newMinute >= 1 && newMinute <= 59) {
            setMinute(newMinute);
        }
        updateDate(newMinute, month, year, hour, minute);
    }

    return (
        <div className="DateTime">
            <input type="text" inputMode="numeric" className="day" value={day.toString().padStart(2, "0")} onChange={handleDayChange} placeholder="Day" />
            <span className="delimiter">.</span>
            <input type="text" inputMode="numeric" className="month" value={month.toString().padStart(2, "0")} onChange={handleMonthChange} placeholder="Month" />
            <span className="delimiter">.</span>
            <input type="text" inputMode="numeric" className="year" value={year.toString().padStart(4, "0")} onChange={handleYearChange} placeholder="Year" />
            <span className="delimiter gap"></span>
            <input type="text" inputMode="numeric" className="hour" value={hour.toString().padStart(2, "0")} onChange={handleHourChange} placeholder="Hour" />
            <span className="delimiter">.</span>
            <input type="text" inputMode="numeric" className="minute" value={minute.toString().padStart(2, "0")} onChange={handleMinuteChange} placeholder="Minute" />
        </div>
    )
}

export default DateTime
