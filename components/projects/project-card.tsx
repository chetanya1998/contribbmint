import Link from 'next/link';
import { Star, GitFork, AlertCircle } from 'lucide-react';

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

export function ProjectCard({ id, name, description, stars, forks, tags, language, owner, repo }: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`} className="block group">
      <div className="glass-card p-6 rounded-2xl h-full transition-all duration-300 hover:bg-white/10 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-purple-500/10 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">{owner}/{repo}</p>
          </div>
          <div className="p-2 bg-white/5 rounded-lg text-slate-300 group-hover:text-white transition-colors">
            <GitFork size={18} />
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
          {description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {language && (
            <span className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
              {language}
            </span>
          )}
          {tags?.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500 mt-auto pt-4 border-t border-white/5">
          <span className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
            <Star size={14} className="text-yellow-500" />
            {stars}
          </span>
          <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
            <GitFork size={14} />
            {forks}
          </span>
        </div>
      </div>
    </Link>
  );
}
