import { PkgJson } from '../../domain/pkg-json.js';

export type UpdatedDependency = {
  name: string;
  sha: string;
  payload: PkgJson;
  currentVersion: string;
  updatedVersion: string;
};

export type DefaultRef = {
  defaultBranch: string;
  headRef: string;
};

// TODO: maybe consider splitting this class into two
// one for reading and one for writing. those 2 operations
// do not really reuse any logic at all.
export interface RemotePkgJson {
  getPkgJson(
    owner: string,
    repo: string,
  ): Promise<{ pkgJson: PkgJson; fileSha: string }>;

  openPullRequestWithUpdatedPkgJson(
    owner: string,
    repo: string,
    dependency: UpdatedDependency,
  ): Promise<{
    prLink: string;
  }>;
}
