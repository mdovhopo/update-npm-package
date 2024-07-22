import { Octokit } from 'octokit';
export class RemoteGithubPkgJson {
    constructor(config) {
        this.pkgJsonPath = 'package.json';
        this.api = new Octokit({ auth: config.getAuthToken() });
    }
    async getPkgJson(owner, repo) {
        const response = await this.api.rest.repos.getContent({
            owner,
            repo,
            type: 'file',
            path: this.pkgJsonPath,
        });
        const data = response.data;
        const pkgJson = JSON.parse(Buffer.from(data.content, 'base64').toString());
        return { pkgJson, fileSha: data.sha };
    }
    async openPullRequestWithUpdatedPkgJson(owner, repo, dependency) {
        const { defaultBranch, headRef } = await this.getDefaultRef(owner, repo);
        const branch = `update-dependency-${dependency.name}`;
        await this.createBranch(owner, repo, branch, headRef);
        await this.commitUpdatedFile(owner, repo, branch, dependency);
        const { data: pull } = await this.api.rest.pulls.create({
            owner,
            repo,
            title: this.buildCommitMessage(dependency),
            body: 'Automated dependency update',
            base: defaultBranch,
            head: `${owner}:${branch}`,
        });
        return { prLink: pull.html_url };
    }
    buildCommitMessage(dependency) {
        return `chore(deps): Update ${dependency.name} from ${dependency.currentVersion} to ${dependency.updatedVersion}`;
    }
    async commitUpdatedFile(owner, repo, branch, dependency) {
        const { data: { login, email }, } = await this.api.request({ method: 'GET', url: '/user' });
        const encodedContent = Buffer.from(JSON.stringify(dependency.payload, null, 2) + '\n').toString('base64');
        await this.api.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            message: this.buildCommitMessage(dependency),
            committer: { name: login, email },
            content: encodedContent,
            sha: dependency.sha,
            branch: `refs/heads/${branch}`,
            path: this.pkgJsonPath,
        });
    }
    async createBranch(owner, repo, branch, headRef) {
        await this.api.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branch}`,
            sha: headRef,
        });
    }
    async getDefaultRef(owner, repo) {
        const { data: { default_branch: defaultBranch }, } = await this.api.rest.repos.get({
            owner,
            repo,
        });
        const { data: { object: { sha }, }, } = await this.api.rest.git.getRef({
            owner,
            repo,
            ref: `heads/${defaultBranch}`,
        });
        return { defaultBranch, headRef: sha };
    }
}
//# sourceMappingURL=remote-github-pkg-json.js.map