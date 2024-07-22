import fs from 'node:fs';
import path from 'node:path';

export type ConfigProps = {
  authToken: string;
};

export class Config {
  // TODO: may be configurable
  public readonly configFilePath = `${process.env.HOME}/.config/update-pkg-config/config.json`;
  private readonly configFileBase = path.dirname(this.configFilePath);

  private ensureConfigFile(): void {
    const configFileExists = fs.existsSync(this.configFilePath);

    if (!configFileExists) {
      fs.mkdirSync(this.configFileBase, { recursive: true });
      fs.writeFileSync(this.configFilePath, '{}');
    }
  }

  private setConfigFileProp<T extends keyof ConfigProps>(
    prop: T,
    value: ConfigProps[T],
  ): void {
    this.ensureConfigFile();

    const configFile = fs.readFileSync(this.configFilePath, 'utf-8');
    const config = JSON.parse(configFile);

    config[prop] = value;

    fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
  }

  private getConfigFile<T extends keyof ConfigProps>(prop: T): ConfigProps[T] {
    this.ensureConfigFile();

    const configFile = fs.readFileSync(this.configFilePath, 'utf-8');
    // TODO: add validation of config file
    const config = JSON.parse(configFile) as ConfigProps;

    const value = config[prop];

    if (!value) {
      throw new Error(
        `Config property ${prop} not found. Try setting it first`,
      );
    }

    return value;
  }

  public setAuthToken(token: string): void {
    this.setConfigFileProp('authToken', token);
  }

  public getAuthToken(): string {
    return this.getConfigFile('authToken');
  }

  public clearConfig(): void {
    fs.rmSync(this.configFileBase, { recursive: true });
  }
}
