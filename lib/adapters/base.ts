export interface ProjectMetadata {
    id: string; // "owner/repo"
    name: string;
    description: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    lastPushedAt: string | null; // ISO Date
    topics: string[];
}

export interface ContributionActivity {
    id: string; // PR Number or Commit Hash
    title: string;
    authorUsername: string;
    url: string;
    type: 'PR' | 'ISSUE';
    createdAt: Date;
    status: 'OPEN' | 'MERGED' | 'CLOSED';
}

export interface RepoAdapter {
    /**
     * Fetches metadata for a project given a source locator.
     * @param sourceUrl URL or identifier (e.g. "github.com/owner/repo" or "owner/repo")
     */
    fetchMetadata(sourceUrl: string): Promise<ProjectMetadata>;

    /**
     * Syncs recent contributions (PRs) from the source.
     * @param projectId The adapter-specific project ID (e.g. "owner/repo")
     */
    syncActivities(projectId: string): Promise<ContributionActivity[]>;

    /**
     * Verifies if a specific contribution exists and matches the criteria.
     * @param projectId The adapter-specific project ID
     * @param contributionId The PR number or ID
     */
    verifyContribution(projectId: string, contributionId: string): Promise<boolean>;
}
