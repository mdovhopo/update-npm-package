import { describe, it, beforeEach, afterEach } from 'node:test';
import fs from 'node:fs';
import { Config } from '../../src/config/config.js';
import { ModifyPkgJson } from '../../src/services/modify-pkg-json/modify-pkg-json.js';
import { RemoteGithubPkgJson } from '../../src/services/remote-pkg-json/git-vendors/remote-github-pkg-json.js';
import { UpdateDependency } from '../../src/services/update-dependency/update-dependency.js';
import assert from 'node:assert';
import { Octokit } from 'octokit';

describe('E2E happy flow', () => {
  const owner = 'mdovhopo';
  const repo = 'demo-repo';
  const pkgToUpdate = 'test';
  let createdPrLink: string;

  const token = Buffer.from(
    fs.readFileSync('./demo-gh-token.base64.txt', 'utf8').trim(),
    'base64',
  ).toString();

  afterEach(async () => {
    if (createdPrLink) {
      const config = new Config();
      config.clearConfig();
      config.setAuthToken(token);

      const octokit = new Octokit({ auth: token });
      const prNumber = createdPrLink.split('/').at(-1) as string;

      await octokit.rest.pulls
        .update({
          owner,
          pull_number: +prNumber,
          repo,
          state: 'closed',
        })
        .catch(() => 0);

      await octokit.rest.git
        .deleteRef({
          owner,
          repo,
          ref: `heads/update-dependency-test`,
        })
        .catch(() => 0);

      createdPrLink = '';
    }
  });

  it('show create a pull request for a dependency update', async () => {
    const requiredVersion = '3.0.0';

    const config = new Config();

    const updateDependency = new UpdateDependency(
      config,
      new RemoteGithubPkgJson(config),
      new ModifyPkgJson(),
    );

    const { prLink } = await updateDependency.updateDependency(
      owner,
      repo,
      pkgToUpdate,
      requiredVersion,
    );

    createdPrLink = prLink;

    console.log(prLink);

    assert.equal(
      prLink.startsWith('https://github.com/mdovhopo/demo-repo/pull/'),
      true,
    );
  });
});
