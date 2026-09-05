import {
  IndentationText,
  NewLineKind,
  Project,
  QuoteKind,
  SyntaxKind,
  type SourceFile
} from 'ts-morph';

import { SourceEdit, SourceEditStatus } from '../types';

const capitalize = (value: string) =>
  `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

// every edit is a whole-file parse of what yeoman already has in mem-fs -
// ts-morph runs on an in-memory filesystem and never touches the disk
const withSourceFile = (
  fileName: string,
  contents: string,
  mutate: (file: SourceFile) => SourceEditStatus
): SourceEdit => {
  try {
    const project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
        useTrailingCommas: false,
        // .prettierrc sets endOfLine: auto, so nothing downstream would clean
        // up a file we left with mixed endings
        newLineKind: contents.includes('\r\n')
          ? NewLineKind.CarriageReturnLineFeed
          : NewLineKind.LineFeed
      }
    });
    const file = project.createSourceFile(fileName, contents, {
      overwrite: true
    });
    const status = mutate(file);

    return status === 'updated'
      ? { status, contents: file.getFullText() }
      : { status };
  } catch {
    // a file we cannot parse is one we have no business rewriting
    return { status: 'unrecognized' };
  }
};

// a generated module owns a slice of the store, so AppState has to learn about
// it or nothing downstream of the reducer will type check
export const addStateSlice = (contents: string, name: string) =>
  withSourceFile('types.ts', contents, (file) => {
    const appState = file.getTypeAlias('AppState');
    const slices = appState?.getTypeNode()?.asKind(SyntaxKind.TypeLiteral);

    if (!appState || !slices) {
      return 'unrecognized';
    } else if (slices.getProperty(name)) {
      return 'unchanged';
    }

    const stateType = `${capitalize(name)}State`;

    if (!file.getTypeAlias(stateType)) {
      file.insertTypeAlias(appState.getChildIndex(), {
        name: stateType,
        type: 'Record<string, never>',
        isExported: true
      });
      // ts-morph packs inserted statements against their neighbour, and every
      // other declaration in this file is separated by a blank line
      appState.prependWhitespace('\n');
    }

    // optional because the slice only exists once its reducer is registered
    // with the root reducer
    file
      .getTypeAliasOrThrow('AppState')
      .getTypeNodeOrThrow()
      .asKindOrThrow(SyntaxKind.TypeLiteral)
      .addProperty({ name, hasQuestionToken: true, type: stateType });

    return 'updated';
  });

// combineReducers is what actually puts the slice in the store, so a module
// that is not in here is inert no matter what the types say
export const registerReducer = (contents: string, name: string) =>
  withSourceFile('reducers.ts', contents, (file) => {
    const slices = file
      .getExportAssignment((assignment) => !assignment.isExportEquals())
      ?.getExpression()
      .asKind(SyntaxKind.CallExpression)
      ?.getArguments()[0]
      ?.asKind(SyntaxKind.ObjectLiteralExpression);

    if (!slices) {
      return 'unrecognized';
    } else if (slices.getProperty(name)) {
      return 'unchanged';
    }

    slices.addShorthandPropertyAssignment({ name });
    file.addImportDeclaration({
      moduleSpecifier: `./${name}`,
      namedImports: [{ name: 'reducer', alias: name }]
    });

    return 'updated';
  });

// the root saga forks every module saga, and one that is never forked never runs
export const registerSaga = (contents: string, name: string) =>
  withSourceFile('sagas.ts', contents, (file) => {
    const moduleSpecifier = `./${name}`;
    const saga = file.getFunction((fn) => fn.isDefaultExport());

    if (!saga) {
      return 'unrecognized';
    } else if (
      file.getImportDeclaration(
        (declaration) =>
          declaration.getModuleSpecifierValue() === moduleSpecifier
      )
    ) {
      return 'unchanged';
    }

    saga.addStatements(`yield fork(${name});`);
    file.addImportDeclaration({ defaultImport: name, moduleSpecifier });

    return 'updated';
  });

// a page is only reachable once it is in the route table, and the nav is
// derived from that same table
export const registerRoute = (contents: string, name: string, url: string) =>
  withSourceFile('routes.tsx', contents, (file) => {
    // keyed off the declaration rather than its AppRoute[] annotation, so a
    // project that renamed or dropped the type still gets its routes
    const table = file
      .getVariableDeclaration('routes')
      ?.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);

    if (!table) {
      return 'unrecognized';
    }

    const target = `./pages/${name}`;

    if (table.getElements().some((route) => route.getText().includes(target))) {
      return 'unchanged';
    }

    table.insertElement(
      0,
      [
        '{',
        `  path: '${url}',`,
        `  handle: { title: '${name}' },`,
        `  lazy: () => import(\`${target}\`)`,
        '}'
      ].join('\n')
    );

    return 'updated';
  });
