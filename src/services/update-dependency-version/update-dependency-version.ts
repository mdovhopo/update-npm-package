import { PkgJson } from '../../domain/pkg-json.js';
import semver from 'semver';

export class UpdateDependencyVersion {
  public async updateDependencyVersion(
    pkgJson: PkgJson,
    name: string,
    version: string,
  ): Promise<PkgJson> {
    await this.validate(pkgJson, name, version);

    const pkgJsonCopy = structuredClone(pkgJson);

    pkgJsonCopy.dependencies[name] = version;

    return pkgJsonCopy;
  }

  private async validate(
    pkgJson: PkgJson,
    name: string,
    version: string,
  ): Promise<void> {
    const regex = /^[a-z0-9\-_]{1,128}$/i;

    if (!regex.test(name)) {
      throw new Error(
        'Invalid package name, expected name to match ' + regex.toString(),
      );
    }

    if (semver.valid(version) === null) {
      throw new Error(
        'Invalid version, expected a valid semver version (major.minor.patch). Example - 16.5.10',
      );
    }

    await this.validatePackage(name, version);

    if (!pkgJson?.dependencies[name]) {
      throw new Error(`Dependency ${name} not found in package.json`);
    }

    if (pkgJson.dependencies[name] === version) {
      throw new Error(`Dependency ${name} is already ${version}`);
    }
  }

  // based on https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md#getpackageversion
  private async validatePackage(name: string, version: string): Promise<void> {
    const response = await fetch(
      `https://registry.npmjs.org/${name}/${version}`,
    );

    if (response.status === 200) {
      return;
    }

    if (response.status === 404) {
      throw new Error(`Package ${name} with version ${version} not found`);
    }

    throw new Error(
      `Failed to fetch package ${name} with version ${version}: ${await response.text()}`,
    );
  }
}
