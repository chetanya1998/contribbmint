import axios from 'axios';

// GSOC Organizations API: https://api.gsocorganizations.dev/
const GSOC_API_BASE = 'https://api.gsocorganizations.dev';

export interface GSOCOrganization {
    name: string;
    description: string;
    url: string;
    category: string;
    technologies: string[];
    topics: string[];
    contact_email?: string;
    mailing_list?: string;
    twitter?: string;
    blog?: string;
    chat?: string;
    guide_to_working?: string;
    year: number;
}

export interface DiscoveredProject {
    name: string;
    description: string;
    githubUrl?: string;
    githubOwner?: string;
    githubRepo?: string;
    tags: string;
    topics: string;
    primaryLanguage?: string;
    officialWebsite?: string;
    chatUrl?: string;
    documentationUrl?: string;
    gsocYear: number;
    source: 'GSOC';
    status: 'APPROVED';
    stars: number;
    forks: number;
    openIssuesCount: number;
}

/**
 * Fetch GSOC organizations for a specific year
 */
export async function fetchGSOCOrganizations(year: number = 2024): Promise<GSOCOrganization[]> {
    try {
        const response = await axios.get(`${GSOC_API_BASE}/${year}.json`);
        const data = response.data;

        // The API returns an object with org names as keys
        const organizations: GSOCOrganization[] = Object.entries(data).map(([name, org]: [string, any]) => ({
            name: org.name || name,
            description: org.description || '',
            url: org.url || '',
            category: org.category || 'Other',
            technologies: org.technologies || [],
            topics: org.topics || [],
            contact_email: org.contact_email,
            mailing_list: org.mailing_list,
            twitter: org.twitter_url,
            blog: org.blog_url,
            chat: org.irc_channel || org.chat,
            guide_to_working: org.guide_to_working,
            year,
        }));

        return organizations;
    } catch (error: any) {
        console.error(`Failed to fetch GSOC ${year} organizations:`, error.message);
        return [];
    }
}

/**
 * Extract GitHub info from URL
 */
function extractGitHubInfo(url: string): { owner: string; repo: string } | null {
    if (!url) return null;

    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
        return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, ''),
        };
    }
    return null;
}

/**
 * Transform GSOC org to our Project schema
 */
export function transformToProject(org: GSOCOrganization): DiscoveredProject {
    const githubInfo = extractGitHubInfo(org.url);

    return {
        name: org.name,
        description: org.description,
        githubUrl: githubInfo ? org.url : undefined,
        githubOwner: githubInfo?.owner,
        githubRepo: githubInfo?.repo,
        tags: org.technologies.join(','),
        topics: org.topics.join(','),
        primaryLanguage: org.technologies[0] || undefined,
        officialWebsite: !githubInfo ? org.url : undefined,
        chatUrl: org.chat,
        documentationUrl: org.guide_to_working,
        gsocYear: org.year,
        source: 'GSOC',
        status: 'APPROVED',
        // Defaults since we don't have real GitHub stats yet
        stars: 0,
        forks: 0,
        openIssuesCount: 0,
    };
}

/**
 * Fetch and transform organizations for multiple years
 */
export async function fetchMultipleYears(years: number[]): Promise<DiscoveredProject[]> {
    const allOrgs: DiscoveredProject[] = [];

    for (const year of years) {
        console.log(`Fetching GSOC ${year} organizations...`);
        const orgs = await fetchGSOCOrganizations(year);
        const projects = orgs.map(transformToProject);
        allOrgs.push(...projects);
    }

    // Remove duplicates by name
    const uniqueProjects = allOrgs.reduce((acc, project) => {
        if (!acc.find(p => p.name === project.name)) {
            acc.push(project);
        }
        return acc;
    }, [] as DiscoveredProject[]);

    return uniqueProjects;
}
