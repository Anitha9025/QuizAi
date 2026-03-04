import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialTimeInMinutes: number, onExpire: () => void) => {
    // Convert minutes to seconds for internal tracking
    const [timeRemaining, setTimeRemaining] = useState(initialTimeInMinutes * 60);

    useEffect(() => {
        // If initial time is 0 or less, there is no timer
        if (initialTimeInMinutes <= 0) return;

        if (timeRemaining <= 0) {
            onExpire();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeRemaining((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeRemaining, initialTimeInMinutes, onExpire]);

    const formatTime = useCallback((seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, []);

    return {
        timeRemaining,
        formattedTime: formatTime(timeRemaining),
        isRunning: initialTimeInMinutes > 0 && timeRemaining > 0,
    };
};
