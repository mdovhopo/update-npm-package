import fs from 'node:fs';
import path from 'node:path';
export class Config {
    constructor() {
        this.configFilePath = `${process.env.HOME}/.config/update-pkg-config/config.json`;
        this.configFileBase = path.dirname(this.configFilePath);
    }
    setAuthToken(token) {
        this.setConfigFileProp('authToken', token);
    }
    getAuthToken() {
        return this.getConfigFile('authToken');
    }
    clearConfig() {
        fs.rmSync(this.configFileBase, { recursive: true });
    }
    ensureConfigFile() {
        const configFileExists = fs.existsSync(this.configFilePath);
        if (!configFileExists) {
            fs.mkdirSync(this.configFileBase, { recursive: true });
            fs.writeFileSync(this.configFilePath, '{}');
        }
    }
    setConfigFileProp(prop, value) {
        this.ensureConfigFile();
        const configFile = fs.readFileSync(this.configFilePath, 'utf-8');
        const config = JSON.parse(configFile);
        config[prop] = value;
        fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
    }
    getConfigFile(prop) {
        this.ensureConfigFile();
        const configFile = fs.readFileSync(this.configFilePath, 'utf-8');
        const config = JSON.parse(configFile);
        const value = config[prop];
        if (!value) {
            throw new Error(`Config property ${prop} not found. Try setting it first`);
        }
        return value;
    }
}
//# sourceMappingURL=config.js.map