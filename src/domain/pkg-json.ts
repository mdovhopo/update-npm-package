// TODO: maybe use more accurate type for pkgJson
export type PkgJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
