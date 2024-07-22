# update npm package

This is a small utility that updates the version of a dependency in a `package.json` file and opens a pull request with the changes.

## Usage

### Requirements
- node 20

### Configuration
Before getting into actual usage, you need to configure the utility. Utility requires auth token to be configured. 

To do that run:
```bash
npx tsx src/ui/cli.ts set-auth-token --token <token>
```

> Note: utility will store the token in the `~/.config/update-pkg-config/config.json` file. To clean it up, run:
> ```bash
> npx tsx src/ui/cli.ts clear-config
> ```

### Usage

To update dependency version, run:
```bash
npx tsx src/ui/cli.ts update --repo-name <repo> --repo-owner <owner> --package-name <name> --package-version <version>
```

### Testing

Repo also contains automated e2e tests with real Github.

Run tests via node's default testrunner

```bash
node --import tsx --test tests/e2e/e2e.test.ts
```

### Demo

I've created a demo github repo https://github.com/mdovhopo/demo-repo for easier demonstration.

To run demo:
1. Clone the repo
2. Set correct node version - `nvm use`
3. Install dependencies - `npm ci`
4. Set token - `npx tsx src/ui/cli.ts set-auth-token --token <token>`
5. Run the utility - `npx tsx src/ui/cli.ts update --repo-name demo-repo --repo-owner mdovhopo --package-name test --package-version 3.0.0`

> Note: Token is located at `./demo-gh-token.base64.txt`. token is base64 encoded, to bypass github secret leak protection
> Note: token has only access to demo repo and is set to expire in 7 days

