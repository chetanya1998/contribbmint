import { Octokit } from 'octokit';

// Use an unauthenticated instance if no token, scanning only public data.
// For higher rate limits, use process.env.GITHUB_ACCESS_TOKEN
const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN,
});

export interface DiscoveredProject {
    githubOwner: string;
    githubRepo: string;
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    topics: string[];
    githubUrl: string;
}

export async function searchGithubProjects(query: string = 'stars:>1000'): Promise<DiscoveredProject[]> {
    try {
        const response = await octokit.request('GET /search/repositories', {
            q: query,
            sort: 'stars',
            order: 'desc',
            per_page: 9,
        });

        return response.data.items.map((repo: any) => ({
            githubOwner: repo.owner.login,
            githubRepo: repo.name,
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language || 'Unknown',
            topics: repo.topics || [],
            githubUrl: repo.html_url,
        }));
    } catch (error) {
        console.error('GitHub Search Error:', error);
        return [];
    }
}

export async function getTrendingProjects(): Promise<DiscoveredProject[]> {
    // Search for top JS/TS projects created recently or generally popular
    return searchGithubProjects('language:typescript sort:stars');
}
