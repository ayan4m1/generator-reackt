import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { mkdirp } from 'mkdirp';

import fileSystem, { src } from '../generators/util/fs.js';

const packageRoot = resolvePath(fileURLToPath(new URL('..', import.meta.url)));

type Call = [string, ...unknown[]];

type StubGenerator = {
  calls: Call[];
  answers: Record<string, unknown>;
  templatePath: (file: string) => string;
  destinationPath: (file: string) => string;
  fs: Record<string, (...args: unknown[]) => string>;
};

// the module is pure delegation, so the stub tags both sides of every path it
// hands out - a swapped source and destination shows up in the assertion
const stubGenerator = (): StubGenerator => {
  const calls: Call[] = [];
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push([name, ...args]);

      return `${name}-result`;
    };

  return {
    calls,
    answers: { component: { name: 'Widget' } },
    templatePath: (file: string) => `tmpl:${file}`,
    destinationPath: (file: string) => `dest:${file}`,
    fs: {
      copy: record('copy'),
      copyTpl: record('copyTpl'),
      write: record('write')
    }
  };
};

describe('util/fs', () => {
  describe('src', () => {
    it('puts a file under the source directory', () => {
      assert.equal(src('index.ts'), join('src', 'index.ts'));
    });

    it('joins every segment it is given', () => {
      assert.equal(
        src('components', 'Widget', 'index.tsx'),
        join('src', 'components', 'Widget', 'index.tsx')
      );
    });

    it('is the source directory itself when given nothing', () => {
      assert.equal(src(), 'src');
    });

    it('normalizes segments that already contain separators', () => {
      assert.equal(src('pages/About.tsx'), join('src', 'pages', 'About.tsx'));
    });
  });

  describe('resolve', () => {
    const { resolve } = fileSystem(stubGenerator());

    it('points at the package root, not the util directory', () => {
      assert.equal(resolve(), packageRoot);
    });

    it('resolves the paths the app generator reads at write time', () => {
      assert.ok(existsSync(resolve('templates')));
      assert.ok(existsSync(resolve('.prettierrc')));
      assert.ok(existsSync(resolve('.stylelintrc')));
    });

    it('joins every segment it is given', () => {
      assert.equal(
        resolve('templates', 'app'),
        join(packageRoot, 'templates', 'app')
      );
    });

    it('does not depend on the generator or the working directory', () => {
      const fromAnotherGenerator =
        fileSystem(stubGenerator()).resolve('templates');

      assert.equal(fromAnotherGenerator, resolve('templates'));
    });
  });

  describe('copy', () => {
    it('copies a template to the same path in the destination', () => {
      const gen = stubGenerator();

      fileSystem(gen).copy('gitignore');

      assert.deepEqual(gen.calls, [
        ['copy', 'tmpl:gitignore', 'dest:gitignore']
      ]);
    });

    it('does not template the file', () => {
      const gen = stubGenerator();

      fileSystem(gen).copy('gitignore');

      assert.equal(gen.calls[0][0], 'copy');
    });

    it('returns whatever the underlying editor returned', () => {
      const gen = stubGenerator();

      assert.equal(fileSystem(gen).copy('gitignore'), 'copy-result');
    });
  });

  describe('copyTo', () => {
    it('copies a template to a different destination path', () => {
      const gen = stubGenerator();

      fileSystem(gen).copyTo('gitignore', '.gitignore');

      assert.deepEqual(gen.calls, [
        ['copy', 'tmpl:gitignore', 'dest:.gitignore']
      ]);
    });
  });

  describe('copyDirectory', () => {
    it('globs the template directory and writes it to the same path', () => {
      const gen = stubGenerator();

      fileSystem(gen).copyDirectory('src/components');

      assert.deepEqual(gen.calls, [
        [
          'copyTpl',
          'tmpl:src/components/**/*',
          'dest:src/components',
          gen.answers
        ]
      ]);
    });

    it('leaves the glob suffix posix, so it matches on every platform', () => {
      const gen = stubGenerator();

      fileSystem(gen).copyDirectory(src('components'));

      assert.ok(String(gen.calls[0][1]).endsWith('/**/*'));
    });

    it('passes the answers object itself, so later prompts still apply', () => {
      const gen = stubGenerator();
      const { copyDirectory } = fileSystem(gen);

      gen.answers = { component: { name: 'Renamed' } };
      copyDirectory('src');

      assert.equal(gen.calls[0][3], gen.answers);
    });
  });

  describe('copyTemplate', () => {
    it('renders a template into a different destination path', () => {
      const gen = stubGenerator();

      fileSystem(gen).copyTemplate('_package.json', 'package.json');

      assert.deepEqual(gen.calls, [
        ['copyTpl', 'tmpl:_package.json', 'dest:package.json', gen.answers]
      ]);
    });
  });

  describe('copyTemplateInPlace', () => {
    it('renders a template to the same path in the destination', () => {
      const gen = stubGenerator();

      fileSystem(gen).copyTemplateInPlace('README.md');

      assert.deepEqual(gen.calls, [
        ['copyTpl', 'tmpl:README.md', 'dest:README.md', gen.answers]
      ]);
    });
  });

  describe('createFile', () => {
    it('writes contents to the destination without reading a template', () => {
      const gen = stubGenerator();

      fileSystem(gen).createFile('.husky/pre-commit', 'npx lint-staged\n');

      assert.deepEqual(gen.calls, [
        ['write', 'dest:.husky/pre-commit', 'npx lint-staged\n']
      ]);
    });

    it('passes a buffer through untouched', () => {
      const gen = stubGenerator();
      const contents = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

      fileSystem(gen).createFile('favicon.png', contents);

      assert.equal(gen.calls[0][2], contents);
    });
  });

  describe('makeDirectory', () => {
    let workDir: string;

    before(async () => {
      workDir = await mkdtemp(join(tmpdir(), 'reackt-fs-'));
    });

    after(async () => {
      await rm(workDir, { recursive: true, force: true });
    });

    it('is mkdirp', () => {
      assert.equal(fileSystem(stubGenerator()).makeDirectory, mkdirp);
    });

    it('creates a directory and its missing parents', async () => {
      const { makeDirectory } = fileSystem(stubGenerator());
      const target = join(workDir, 'src', 'components', 'Widget');

      await makeDirectory(target);

      assert.ok((await stat(target)).isDirectory());
    });

    it('succeeds when the directory already exists', async () => {
      const { makeDirectory } = fileSystem(stubGenerator());
      const target = join(workDir, 'existing');

      await makeDirectory(target);

      assert.equal(await makeDirectory(target), undefined);
    });
  });

  describe('the returned helpers', () => {
    it('are bound to their own generator', () => {
      const one = stubGenerator();
      const two = stubGenerator();

      fileSystem(one).copy('a');
      fileSystem(two).copy('b');

      assert.deepEqual(one.calls, [['copy', 'tmpl:a', 'dest:a']]);
      assert.deepEqual(two.calls, [['copy', 'tmpl:b', 'dest:b']]);
    });

    it('survive being detached, since generators pass them to forEach', () => {
      const gen = stubGenerator();
      const { copy, copyTemplateInPlace } = fileSystem(gen);

      ['a', 'b'].forEach(copy);
      ['c'].forEach(copyTemplateInPlace);

      assert.deepEqual(
        gen.calls.map(([name]) => name),
        ['copy', 'copy', 'copyTpl']
      );
    });
  });
});
