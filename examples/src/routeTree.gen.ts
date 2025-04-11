/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as GuidesMultipleCellSelectionImport } from './routes/guides/multiple-cell-selection'
import { Route as GuidesCellSelectionImport } from './routes/guides/cell-selection'
import { Route as GuidesBasicImport } from './routes/guides/basic'
import { Route as GettingStartedInstallationImport } from './routes/getting-started/installation'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const GuidesMultipleCellSelectionRoute =
  GuidesMultipleCellSelectionImport.update({
    id: '/guides/multiple-cell-selection',
    path: '/guides/multiple-cell-selection',
    getParentRoute: () => rootRoute,
  } as any)

const GuidesCellSelectionRoute = GuidesCellSelectionImport.update({
  id: '/guides/cell-selection',
  path: '/guides/cell-selection',
  getParentRoute: () => rootRoute,
} as any)

const GuidesBasicRoute = GuidesBasicImport.update({
  id: '/guides/basic',
  path: '/guides/basic',
  getParentRoute: () => rootRoute,
} as any)

const GettingStartedInstallationRoute = GettingStartedInstallationImport.update(
  {
    id: '/getting-started/installation',
    path: '/getting-started/installation',
    getParentRoute: () => rootRoute,
  } as any,
)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/getting-started/installation': {
      id: '/getting-started/installation'
      path: '/getting-started/installation'
      fullPath: '/getting-started/installation'
      preLoaderRoute: typeof GettingStartedInstallationImport
      parentRoute: typeof rootRoute
    }
    '/guides/basic': {
      id: '/guides/basic'
      path: '/guides/basic'
      fullPath: '/guides/basic'
      preLoaderRoute: typeof GuidesBasicImport
      parentRoute: typeof rootRoute
    }
    '/guides/cell-selection': {
      id: '/guides/cell-selection'
      path: '/guides/cell-selection'
      fullPath: '/guides/cell-selection'
      preLoaderRoute: typeof GuidesCellSelectionImport
      parentRoute: typeof rootRoute
    }
    '/guides/multiple-cell-selection': {
      id: '/guides/multiple-cell-selection'
      path: '/guides/multiple-cell-selection'
      fullPath: '/guides/multiple-cell-selection'
      preLoaderRoute: typeof GuidesMultipleCellSelectionImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/getting-started/installation': typeof GettingStartedInstallationRoute
  '/guides/basic': typeof GuidesBasicRoute
  '/guides/cell-selection': typeof GuidesCellSelectionRoute
  '/guides/multiple-cell-selection': typeof GuidesMultipleCellSelectionRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/getting-started/installation': typeof GettingStartedInstallationRoute
  '/guides/basic': typeof GuidesBasicRoute
  '/guides/cell-selection': typeof GuidesCellSelectionRoute
  '/guides/multiple-cell-selection': typeof GuidesMultipleCellSelectionRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/getting-started/installation': typeof GettingStartedInstallationRoute
  '/guides/basic': typeof GuidesBasicRoute
  '/guides/cell-selection': typeof GuidesCellSelectionRoute
  '/guides/multiple-cell-selection': typeof GuidesMultipleCellSelectionRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/getting-started/installation'
    | '/guides/basic'
    | '/guides/cell-selection'
    | '/guides/multiple-cell-selection'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/getting-started/installation'
    | '/guides/basic'
    | '/guides/cell-selection'
    | '/guides/multiple-cell-selection'
  id:
    | '__root__'
    | '/'
    | '/getting-started/installation'
    | '/guides/basic'
    | '/guides/cell-selection'
    | '/guides/multiple-cell-selection'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  GettingStartedInstallationRoute: typeof GettingStartedInstallationRoute
  GuidesBasicRoute: typeof GuidesBasicRoute
  GuidesCellSelectionRoute: typeof GuidesCellSelectionRoute
  GuidesMultipleCellSelectionRoute: typeof GuidesMultipleCellSelectionRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  GettingStartedInstallationRoute: GettingStartedInstallationRoute,
  GuidesBasicRoute: GuidesBasicRoute,
  GuidesCellSelectionRoute: GuidesCellSelectionRoute,
  GuidesMultipleCellSelectionRoute: GuidesMultipleCellSelectionRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/getting-started/installation",
        "/guides/basic",
        "/guides/cell-selection",
        "/guides/multiple-cell-selection"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/getting-started/installation": {
      "filePath": "getting-started/installation.tsx"
    },
    "/guides/basic": {
      "filePath": "guides/basic.tsx"
    },
    "/guides/cell-selection": {
      "filePath": "guides/cell-selection.tsx"
    },
    "/guides/multiple-cell-selection": {
      "filePath": "guides/multiple-cell-selection.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
