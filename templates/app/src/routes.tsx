import type { RouteObject } from 'react-router-dom';

// handle.title is what Layout renders in the nav - routes without one
// (the index route) are reachable but not linked
export type AppRoute = RouteObject & {
  handle?: { title: string };
};

export const routes: AppRoute[] = [
  {
    index: true,
    lazy: () => import(`./pages/index`)
  }
];
