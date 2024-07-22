// TODO: maybe use more accurate type for pkgJson
export type PkgJson = {
  // 'dependencies' here is required, because we will validate it before using
  dependencies: Record<string, string>;
};
