#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Config } from '../config/config.js';
import { RemoteGithubPkgJson } from '../services/remote-pkg-json/git-vendors/remote-github-pkg-json.js';
import { ModifyPkgJson } from '../services/modify-pkg-json/modify-pkg-json.js';
import { UpdateDependency } from '../services/update-dependency/update-dependency.js';

yargs(hideBin(process.argv))
  .command(
    'update',
    'Update package version in package.json in specified repo',
    (yargs) => {
      yargs
        .option('repo-name', {
          type: 'string',
          description: 'The name of the repository to update dependency in',
          required: true,
        })
        .option('repo-owner', {
          type: 'string',
          description: 'The owner of the repository to update dependency in',
        })
        .option('package-name', {
          type: 'string',
          description: 'The name of the package to update',
          required: true,
        })
        .option('package-version', {
          type: 'string',
          description: 'The version to update the package to',
          required: true,
        });
    },
    async (argv) => {
      const owner = argv.repoOwner as string;
      const repo = argv.repoName as string;
      const pkgToUpdate = argv.packageName as string;
      const requiredVersion = argv.packageVersion as string;

      // TODO: consider using a dependency injection container
      const config = new Config();

      const updateDependency = new UpdateDependency(
        config,
        // TODO: consider using a parameter for git vendor and select correct implementation
        new RemoteGithubPkgJson(config),
        new ModifyPkgJson(),
      );

      const { prLink } = await updateDependency.updateDependency(
        owner,
        repo,
        pkgToUpdate,
        requiredVersion,
      );

      console.log(`done! PR link: ${prLink}`);
    },
  )
  .command(
    'set-auth-token',
    'Set Auth token with access to repository',
    (yargs) => {
      yargs.option('token', {
        type: 'string',
        description: 'The token to set',
        required: true,
      });
    },
    (argv) => {
      const config = new Config();
      config.setAuthToken(argv.token as string);

      console.log('Token set successfully');
    },
  )
  .command(
    'clear-config',
    'This command will remove all side effects that it created in local environment',
    () => {},
    () => {
      const config = new Config();
      config.clearConfig();

      console.log('Config cleared successfully');
    },
  )
  // TODO: add force option, to override existing branch and/or PR
  // .option('force', {})
  .demandCommand(1)
  .parse();
