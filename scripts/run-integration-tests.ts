import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';

import * as commander from 'commander';

class TestProject {
    readonly name: string;
    readonly path: string;

    constructor(args: { name: string, path: string }) {
        const { name, path } = args;

        this.name = name;
        this.path = path;
    }

    async clean(): Promise<void> {
        const packageLockPath = path.join(this.path, 'package-lock.json');

        console.log(`Deleting: ${packageLockPath}`);
        await fs.promises.rm(packageLockPath, { force: true });
    }

    async run(): Promise<void> {
        console.log(`Running: ${this.name}`);
        const started_process = spawn(
            'npm',
            ['run', 'test'],
            {
                // See https://github.com/nodejs/node/issues/52554#issuecomment-2060026269:
                shell: true,
                cwd: this.path,
                stdio: [process.stdin, process.stdout, process.stderr],
            });

        const resultPromise = new Promise<number>((resolve, reject) => {
            started_process.on('close', (exitCode) => {
                if (exitCode == 0) {
                    resolve(exitCode);
                } else {
                    reject(exitCode);
                }
            });
        });
        const result = await resultPromise;

        assert.strictEqual(result, 0);
    }
}


async function main(cliArgs: { runNpmPackageTests: boolean }) {
    const { runNpmPackageTests } = cliArgs;
    console.log("Running integration tests.");

    const testsDir = await fs.promises.opendir('tests/integration');

    for await (const dirEntry of testsDir) {
        if (!dirEntry.isDirectory()) {
            continue;
        }
        const testName = dirEntry.name;

        if (testName.startsWith('test_npm_') && !runNpmPackageTests) {
            continue;
        }

        const testProject = new TestProject({
            name: testName,
            path: path.join(dirEntry.parentPath, dirEntry.name)
        });

        await testProject.clean();
        await testProject.run();
    }
}

commander.program
    .option(
        '--run-npm-package-tests',
        'Run tests that require that the package is published on NPM.')
    .parse();

await main(commander.program.opts());
