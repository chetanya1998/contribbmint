import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const client = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: GITHUB_TOKEN ? `Bearer ${GITHUB_TOKEN}` : undefined,
    Accept: 'application/vnd.github+json',
  },
});

export async function fetchRepoMetadata(repoUrl: string) {
  const [owner, repo] = parseRepoUrl(repoUrl);
  const { data } = await client.get(`/repos/${owner}/${repo}`);
  return {
    name: data.name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssuesCount: data.open_issues_count,
    topics: data.topics,
    primaryLanguage: data.language,
    lastPushedAt: data.pushed_at,
    githubOwner: owner,
    githubRepo: repo,
    githubUrl: data.html_url,
  };
}

export async function fetchGoodFirstIssues(owner: string, repo: string) {
  const { data } = await client.get(`/search/issues`, {
    params: { q: `repo:${owner}/${repo} label:"good first issue" state:open` },
  });
  return data.total_count as number;
}

export async function fetchRecentPulls(owner: string, repo: string) {
  const { data } = await client.get(`/repos/${owner}/${repo}/pulls`, {
    params: { state: 'closed', per_page: 50, sort: 'updated' },
  });
  return data;
}

export async function fetchRecentIssues(owner: string, repo: string) {
  const { data } = await client.get(`/repos/${owner}/${repo}/issues`, {
    params: { state: 'closed', per_page: 50, sort: 'updated' },
  });
  return data.filter((issue: any) => !issue.pull_request);
}

export function parseRepoUrl(repoUrl: string): [string, string] {
  const parts = repoUrl.replace('https://github.com/', '').split('/');
  return [parts[0], parts[1]];
}
