import { Config } from '../../../config/config.js';
import { Octokit } from 'octokit';
import { components } from '@octokit/openapi-types';
import {
  DefaultRef,
  RemotePkgJson,
  UpdatedDependency,
} from '../remote-pkg-json.interface.js';
import { PkgJson } from '../../../domain/pkg-json.js';

export class RemoteGithubPkgJson implements RemotePkgJson {
  private readonly api: Octokit;

  private readonly pkgJsonPath = 'package.json';

  constructor(config: Config) {
    this.api = new Octokit({ auth: config.getAuthToken() });
  }

  public async getPkgJson(
    owner: string,
    repo: string,
  ): Promise<{ pkgJson: PkgJson; fileSha: string }> {
    // TODO: handle absence of package.json
    const response = await this.api.rest.repos.getContent({
      owner,
      repo,
      type: 'file',
      path: this.pkgJsonPath,
    });

    // TODO: github sdk for some reason doesn't provide correct types for response.data
    const data = response.data as components['schemas']['content-file'];

    // TODO: validation for pkgJson
    const pkgJson = JSON.parse(Buffer.from(data.content, 'base64').toString());

    return { pkgJson, fileSha: data.sha };
  }

  public async openPullRequestWithUpdatedPkgJson(
    owner: string,
    repo: string,
    dependency: UpdatedDependency,
  ): Promise<{
    prLink: string;
  }> {
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

  private buildCommitMessage(dependency: UpdatedDependency): string {
    return `chore(deps): Update ${dependency.name} from ${dependency.currentVersion} to ${dependency.updatedVersion}`;
  }

  private async commitUpdatedFile(
    owner: string,
    repo: string,
    branch: string,
    dependency: UpdatedDependency,
  ): Promise<void> {
    const {
      data: { login, email },
    } = await this.api.request({ method: 'GET', url: '/user' });

    const encodedContent = Buffer.from(
      JSON.stringify(dependency.payload, null, 2) + '\n',
    ).toString('base64');

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

  private async createBranch(
    owner: string,
    repo: string,
    branch: string,
    headRef: string,
  ) {
    await this.api.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: headRef,
    });
  }

  private async getDefaultRef(
    owner: string,
    repo: string,
  ): Promise<DefaultRef> {
    const {
      data: { default_branch: defaultBranch },
    } = await this.api.rest.repos.get({
      owner,
      repo,
    });

    const {
      data: {
        object: { sha },
      },
    } = await this.api.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    return { defaultBranch, headRef: sha };
  }
}
