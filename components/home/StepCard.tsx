import { ReactNode } from 'react';

interface StepCardProps {
    number: number;
    icon: string;
    title: string;
    description: string;
    details: string;
}

export function StepCard({ number, icon, title, description, details }: StepCardProps) {
    return (
        <div className="glass-card p-6 relative group hover:scale-105 transition-all duration-300">
            {/* Step Number Badge */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {number}
            </div>

            {/* Icon */}
            <div className="text-6xl mb-4 text-center mt-4">{icon}</div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2 text-center">{title}</h3>

            {/* Description */}
            <p className="text-slate-300 text-center mb-4 leading-relaxed">{description}</p>

            {/* Details (shown on hover) */}
            <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                <div className="pt-4 mt-4 border-t border-white/10">
                    <p className="text-sm text-slate-400 leading-relaxed">{details}</p>
                </div>
            </div>
        </div>
    );
}
