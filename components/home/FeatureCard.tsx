interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    status: 'ACTIVE' | 'PLANNED';
}

export function FeatureCard({ icon, title, description, status }: FeatureCardProps) {
    return (
        <div className="glass-card p-6 hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
            {/* Status Badge */}
            {status === 'ACTIVE' ? (
                <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                        LIVE
                    </span>
                </div>
            ) : (
                <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                        SOON
                    </span>
                </div>
            )}

            {/* Icon */}
            <div className="text-5xl mb-4">{icon}</div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>

            {/* Description */}
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
}
