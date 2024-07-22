export class UpdateDependency {
    constructor(config, remotePkgJson, modifyPkgJson) {
        this.config = config;
        this.remotePkgJson = remotePkgJson;
        this.modifyPkgJson = modifyPkgJson;
    }
    async updateDependency(owner, repo, pkgToUpdate, requiredVersion) {
        const pkg = await this.remotePkgJson.getPkgJson(owner, repo);
        const updatedPkgJson = await this.modifyPkgJson.updateDependencyVersion(pkg.pkgJson, pkgToUpdate, requiredVersion);
        const { prLink } = await this.remotePkgJson.openPullRequestWithUpdatedPkgJson(owner, repo, {
            name: pkgToUpdate,
            sha: pkg.fileSha,
            payload: updatedPkgJson,
            currentVersion: pkgToUpdate,
            updatedVersion: requiredVersion,
        });
        return { prLink };
    }
}
//# sourceMappingURL=update-dependency.js.map