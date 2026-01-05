'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import clsx from 'clsx';
import { Star } from 'lucide-react';

interface VoteButtonProps {
    contributionId: string;
    initialScore?: number;
}

export function VoteButton({ contributionId, initialScore = 0 }: VoteButtonProps) {
    const [score, setScore] = useState(initialScore);
    const [hovered, setHovered] = useState(0);

    const { mutate, isPending } = useMutation({
        mutationFn: async (newScore: number) => {
            await axios.post('/api/consensus', { contributionId, score: newScore });
        },
        onSuccess: (_, newScore) => {
            setScore(newScore);
        },
    });

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
                <button
                    key={value}
                    disabled={isPending}
                    onMouseEnter={() => setHovered(value)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => mutate(value)}
                    className={clsx(
                        'p-1 transition-colors',
                        (hovered || score) >= value ? 'text-yellow-400' : 'text-gray-300'
                    )}
                >
                    <Star className="w-5 h-5 fill-current" />
                </button>
            ))}
            <span className="text-sm text-gray-500 ml-2">
                {isPending ? 'Saving...' : ''}
            </span>
        </div>
    );
}
