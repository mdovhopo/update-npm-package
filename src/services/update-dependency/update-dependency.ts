import { Config } from '../../config/config.js';
import { ModifyPkgJson } from '../modify-pkg-json/modify-pkg-json.js';
import { RemotePkgJson } from '../remote-pkg-json/remote-pkg-json.interface.js';

export class UpdateDependency {
  constructor(
    protected readonly config: Config,
    protected readonly remotePkgJson: RemotePkgJson,
    protected readonly modifyPkgJson: ModifyPkgJson,
  ) {}

  public async updateDependency(
    owner: string,
    repo: string,
    pkgToUpdate: string,
    requiredVersion: string,
  ): Promise<{ prLink: string }> {
    const pkg = await this.remotePkgJson.getPkgJson(owner, repo);

    const updatedPkgJson = await this.modifyPkgJson.updateDependencyVersion(
      pkg.pkgJson,
      pkgToUpdate,
      requiredVersion,
    );

    const { prLink } =
      await this.remotePkgJson.openPullRequestWithUpdatedPkgJson(owner, repo, {
        name: pkgToUpdate,
        sha: pkg.fileSha,
        payload: updatedPkgJson,
        currentVersion: pkgToUpdate,
        updatedVersion: requiredVersion,
      });

    return { prLink };
  }
}
