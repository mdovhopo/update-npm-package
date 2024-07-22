import { PkgJson } from '../../domain/pkg-json.js';
import semver from 'semver';

export const dependenciesLocation = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
] as const;

export class ModifyPkgJson {
  public async updateDependencyVersion(
    pkgJson: PkgJson,
    name: string,
    version: string,
  ): Promise<PkgJson> {
    await this.validate(pkgJson, name, version);

    const pkgJsonCopy = structuredClone(pkgJson);

    const { updated } = this.updateDependency(pkgJsonCopy, name, version);

    if (!updated) {
      throw new Error(
        `Dependency ${name} not found in any of the locations - ${dependenciesLocation.join(', ')} in the package.json`,
      );
    }

    return pkgJsonCopy;
  }

  private updateDependency(pkgJson: PkgJson, name: string, version: string) {
    for (const location of dependenciesLocation) {
      if (pkgJson[location]?.[name]) {
        pkgJson[location][name] = version;
        return { updated: true };
      }
    }

    return { updated: false };
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
