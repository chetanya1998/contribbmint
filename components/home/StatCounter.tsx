'use client';

import { useEffect, useState } from 'react';

interface StatCounterProps {
    end: number;
    label: string;
    suffix?: string;
    duration?: number;
}

export function StatCounter({ end, label, suffix = '', duration = 2000 }: StatCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - percentage, 3);
            setCount(Math.floor(end * eased));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wider">{label}</div>
        </div>
    );
}
