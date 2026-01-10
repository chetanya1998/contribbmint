import Link from 'next/link';
import { Star, GitFork } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  stars: number;
  forks: number;
  tags?: string[] | null;
  language?: string | null;
  owner: string;
  repo: string;
}

export function ProjectCard({ id, name, description, stars, forks, language, owner }: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`} className="block group">
      <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-300">
        {/* Cover Image Placeholder - Simulating NFT Art */}
        <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:scale-105 transition-transform duration-500 relative flex items-center justify-center">
          <div className="text-6xl opacity-20 font-bold select-none text-white tracking-widest">{name.charAt(0).toUpperCase()}</div>
          {/* Gradient overlay for text legibility if we had real images */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b1d] to-transparent opacity-60"></div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col flex-grow relative z-10 -mt-2 bg-[#1b1b1d]">
          <div className="mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 opacity-80">{owner}</p>
            <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate">{name}</h3>
          </div>

          <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
            {description || 'No description provided.'}
          </p>

          {/* Footer Stats - mimicking "Price" and "Last Sale" */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-semibold">Stars</span>
              <span className="flex items-center gap-1 text-sm font-bold text-white">
                <Star size={12} className="text-white fill-white" /> {stars}
              </span>
            </div>
            <div className="text-right flex flex-col">
              <span className="text-[10px] uppercase text-slate-500 font-semibold">Language</span>
              <span className="text-sm font-bold text-white max-w-[100px] truncate">{language || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
