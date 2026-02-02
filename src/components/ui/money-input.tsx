"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
    value: string | number;
    onValueChange: (value: string) => void;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ value, onValueChange, className, ...props }, ref) => {
        // Format number with dots
        const formatValue = (val: string | number) => {
            if (!val) return "";
            const numStr = val.toString().replace(/\D/g, "");
            return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value.replace(/\./g, "");
            if (!/^\d*$/.test(rawValue)) return; // Only allow digits
            onValueChange(rawValue);
        };

        return (
            <Input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={formatValue(value)}
                onChange={handleChange}
                className={className}
                {...props}
            />
        );
    }
);

MoneyInput.displayName = "MoneyInput";
