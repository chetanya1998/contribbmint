import axios from 'axios';
import { RepoAdapter, ProjectMetadata, ContributionActivity } from './base';

export class GithubAdapter implements RepoAdapter {
    private token: string;

    constructor(token?: string) {
        // Fallback to env var if no token provided (useful for server-side)
        this.token = token || process.env.GITHUB_TOKEN || '';
    }

    private get headers() {
        return {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
        };
    }

    async fetchMetadata(sourceUrl: string): Promise<ProjectMetadata> {
        // Parse "owner/repo" from various URL formats
        const match = sourceUrl.replace('https://github.com/', '').split('/');
        if (match.length < 2) throw new Error('Invalid GitHub URL');
        const owner = match[0];
        const repo = match[1];
        const fullName = `${owner}/${repo}`;

        const { data } = await axios.get(`https://api.github.com/repos/${fullName}`, {
            headers: this.headers,
        });

        return {
            id: fullName,
            name: data.name,
            description: data.description,
            stars: data.stargazers_count,
            forks: data.forks_count,
            openIssues: data.open_issues_count,
            lastPushedAt: data.pushed_at,
            topics: data.topics || [],
        };
    }

    async syncActivities(projectId: string): Promise<ContributionActivity[]> {
        // Fetch recently merged PRs
        const query = `repo:${projectId} is:pr is:merged sort:updated-desc`;
        const { data } = await axios.get(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=10`, {
            headers: this.headers,
        });

        return data.items.map((item: any) => ({
            id: String(item.number),
            title: item.title,
            authorUsername: item.user.login,
            url: item.html_url,
            type: 'PR',
            createdAt: new Date(item.created_at),
            status: 'MERGED',
        }));
    }

    async verifyContribution(projectId: string, contributionId: string): Promise<boolean> {
        try {
            const { data } = await axios.get(`https://api.github.com/repos/${projectId}/pulls/${contributionId}`, {
                headers: this.headers,
            });
            return data.merged === true;
        } catch (e) {
            return false;
        }
    }
}
