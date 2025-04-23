import { useEffect, useState } from "react";

interface NumberInputProps {
    value: number;
    min: number;
    max: number;
    step: number;
    placeholder: string;
    onChange?: (value: number) => void;
};

function NumberInput(props: NumberInputProps) {
    const [value, setValue] = useState<number | string>("");

    useEffect(() => {
        setValue(props.value);
    }, [props.value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;

        if (raw === "") {
            setValue("");
        }

        const num = parseInt(raw, 10);
        if (isNaN(num)) {
            return;
        }

        const clamped = Math.max(props.min, Math.min(props.max, num));

        setValue(clamped);
    }

    function handleFocus() {
        // setValue("");
    }

    function handleBlur() {
        if (typeof value == "number") {
            props.onChange?.(value);
        }
    }

    return (
        <div className="DTPicker">
            <input type="number"
                min={props.min} max={props.max} step={props.step}
                placeholder="dd"
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        </div>
    )
}

interface DTPickerProps {
    time: Date;
    onChange?: (value: Date) => void;
}

function DTPicker(props: DTPickerProps) {
    const [day, setDay] = useState<number>(1);
    const [month, setMonth] = useState<number>(0);
    const [year, setYear] = useState<number>(1900);
    const [hour, setHour] = useState<number>(0);
    const [minute, setMinute] = useState<number>(0);

    useEffect(() => {
        setDay(props.time.getDate());
        setMonth(props.time.getMonth() + 1);
        setYear(props.time.getFullYear());
        setHour(props.time.getHours());
        setMinute(props.time.getMinutes());
    }, [props.time])

    function handleDayChange(value: number) {
        setDay(value);
        const next: Date = (new Date(year, month - 1, value, hour, minute));
        props.onChange?.(next);
    }

    function handleMonthChange(value: number) {
        setMonth(value);
        const next: Date = (new Date(year, value - 1, day, hour, minute));
        props.onChange?.(next);
    }

    function handleYearChange(value: number) {
        setYear(value);
        const next: Date = (new Date(value, month - 1, day, hour, minute));
        props.onChange?.(next);
    }

    function handleHourChange(value: number) {
        setHour(value);
        const next: Date = (new Date(year, month - 1, day, value, minute));
        props.onChange?.(next);
    }

    function handleMinuteChange(value: number) {
        setMinute(value);
        const next: Date = (new Date(year, month - 1, day, hour, value));
        props.onChange?.(next);
    }

    // useEffect(() => {
    //     props.onChange?.(time);
    // }, [time, props]);

    return (
        <div className="DTPicker">
            <NumberInput value={day} min={1} max={31} step={1} placeholder="DD" onChange={handleDayChange} />
            <NumberInput value={month} min={1} max={12} step={1} placeholder="MM" onChange={handleMonthChange} />
            <NumberInput value={year} min={1} max={2100} step={1} placeholder="YYYY" onChange={handleYearChange} />
            <NumberInput value={hour} min={0} max={23} step={1} placeholder="hh" onChange={handleHourChange} />
            <NumberInput value={minute} min={0} max={59} step={1} placeholder="mm" onChange={handleMinuteChange} />
        </div>
    );
}

export default DTPicker;
