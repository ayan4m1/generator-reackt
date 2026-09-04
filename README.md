# The Reactor - An Opinionated Generator

This project scaffolds a modern web application. It is fairly opinionated, but is customizable and extensible.

Here's the mile-long list of technologies the generated project can leverage:

- [TypeScript](https://www.typescriptlang.org/) - The language of the modern web
- [Webpack](https://webpack.js.org/) - Bundle code, styles, markup, and more
- [React](https://reactjs.org/) - Application framework library

Linting tools:

- [ESLint](https://eslint.org/) - Apply hundreds of style/usage rules to JS/TS
- [Prettier](https://prettier.io/) - Apply style/formatting rules to code
- [stylelint](https://stylelint.io/) - Apply style/usage rules to Sass

Optional pre-commit linting:

- [husky](https://www.npmjs.com/package/husky) - Execute lint-staged before committing to Git
- [lint-staged](https://www.npmjs.com/package/lint-staged) - Execute linters for specific file types

Optional style frameworks:

- [Bulma](https://bulma.io/)
- [Bootstrap](https://getbootstrap.com/)
- [Foundation](https://get.foundation/sites.html)
- [Material-UI](https://mui.com/material-ui/)
- [Materialize CSS](https://materializecss.com/)
- [UIkit](https://getuikit.com/)

Optional test frameworks:

- [Jest](https://jestjs.io/) - Unit, integration, and snapshot testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Opinionated unit testing for React

Optional state management:

- [Redux](https://redux.js.org/) - Application state container
- [Redux-Saga](https://redux-saga.js.org/) - Redux middleware for action/side-effect interaction

## Installation

> npm install -g generator-reackt

OR

> yarn add -g generator-reackt

## Usage

To create an application, run `yo reackt`.

To create a new React component, run `yo reackt:component`.

If you are using Redux, you can create a new module (slice of reducer and sagas) with `yo reackt:module`.
