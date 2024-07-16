_Lerna:_ gerenciando projetos JavaScript com vários pacotes. Ele otimiza o fluxo de trabalho em torno do gerenciamento de repositórios de vários pacotes com git e npm.

_Vite:_ ferramenta de construção que fornece substituição rápida de módulo quente, suporte imediato ao módulo ES, recurso extensivo e suporte a plug-ins para React

_Storybook:_ uma ferramenta de código aberto para desenvolver e organizar componentes de interface do usuário isoladamente, que também serve como uma plataforma para testes visuais e criação de documentação interativa.

```bat
@rem lerna initial setup
npx lerna init

@rem create a "packages" folder if not exists
@rem create "ui" folder inside "packages" folder

cd ui
yarn create vite
@rem . react ts

npx storybook@latest init
npx sb init --builder @storybook/builder-vite

@rem delete all from "ui" folder excpet
@rem ├── package.json
@rem ├── src
@rem │   └── vite-env.d.ts
@rem ├── tsconfig.json
@rem └── vite.config.ts

@rem cut all from packages\ui\package.json ("devDependencies": {})
@rem paste in ./package.json ("devDependencies": {})

cd .
npx storybook@latest init
```

```ts update .storybook\main.ts
// stories: [
//   "../stories/**/*.mdx",
//   "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
// ],

stories: [
  "../packages/*/src/**/*..mdx",
  "../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)"
],
```

```json update package.json
// "scripts": {
//   "storybook": "storybook dev -p 6006",
//   "build-storybook": "storybook build"
// }

"scripts": {}
```

- create packages\ui\src\components\index.tsx and packages\ui\src\index.tsx

- create root config files

# lerna configuration
First, let’s examine the Lerna configuration file that helps manage our monorepo project with multiple packages.

```json update lerna.json
// {
//   "$schema": "node_modules/lerna/schemas/lerna-schema.json",
//   "version": "0.0.0"
// }

{
  "$schema": "node_modules/lerna/schemas/lerna-schema.json",
  "useWorkspaces": true,
  "packages": ["packages/*"],
  "version": "independent"
}
```

First of all, "$schema" provides structure and validation for the Lerna configuration.

When "useWorkspaces" is true, Lerna will use yarn workspaces for better linkage and management of dependencies across packages. If false, Lerna manages interpackage dependencies in monorepo.

"packages" defines where Lerna can find the packages in the project.

"version" when set to "independent", Lerna allows each package within the monorepo to have its own version number, providing flexibility in releasing updates for individual packages.

# vite configuration

This file will export the common configs for Vite with extra plugins and libraries which we will reuse in each package. defineConfig serves as a utility function in Vite’s configuration file. While it doesn’t directly execute any logic or alter the passed configuration object, its primary role is to enhance type inference and facilitate autocompletion in specific code editors.

rollupOptions allows you to specify custom Rollup options. Rollup is the module bundler that Vite uses under the hood for its build process. By providing options directly to Rollup, developers can have more fine-grained control over the build process. The external option within rollupOptions is used to specify which modules should be treated as external dependencies.

In general, usage of the external option can help reduce the size of your bundle by excluding dependencies already present in the environment where your code will be run.

The output option with globals: { react: "React" } in Rollup's configuration means that in your generated bundle, any import statements for react will be replaced with the global variable React. Essentially, it's assuming that React is already present in the user's environment and should be accessed as a global variable rather than included in the bundle.

# tsconfig.node.json

The tsconfig.node.json file is used to specifically control how TypeScript transpiles with vite.config.ts file, ensuring it's compatible with Node.js. Vite, which serves and builds frontend assets, runs in a Node.js environment. This separation is needed because the Vite configuration file may require different TypeScript settings than your frontend code, which is intended to run in a browser.

# tsconfig.json

By including "types": ["vite/client"] in tsconfig.json, is necessary because Vite provides some additional properties on the import.meta object that is not part of the standard JavaScript or TypeScript libraries, such as import.meta.env and import.meta.glob.

# common storybook configuration

The .storybook directory defines Storybook's configuration, add-ons, and decorators. It's essential for customizing and configuring how Storybook behaves.

main.ts is the main configuration file for Storybook and allows you to control the behavior of Storybook. As you can see, we’re just exporting common configs, which we’re gonna reuse in each package.

preview.ts allows us to wrap stories with decorators, which we can use to provide context or set styles across our stories globally. We can also use this file to configure global parameters. Also, it will export that general configuration for package usage.

# root package.json

In a Lerna monorepo project, the package.json serves a similar role as in any other JavaScript or TypeScript project. However, some aspects are unique to monorepos.

Scripts will manage the monorepo. Running tests across all packages or building all packages. This package.json also include development dependencies that are shared across multiple packages in the monorepo, such as testing libraries or build tools. The private field is usually set to true in this package.json to prevent it from being accidentally published.

# package level configuration

As far as we exported all configs from the root for reusing those configs, let’s apply them at our package level.

Vite configuration will use root vite configuration where we just import getBaseConfig function and provide there lib. This configuration is used to build our component package as a standalone library. It specifies our package's entry point, library name, and output file name. With this configuration, Vite will generate a compiled file that exposes our component package under the specified library name, allowing it to be used in other projects or distributed separately.

For the .storybook, we use the same approach. We just import the commonConfigs.

And preview it as well.

For the last one from the .storybook folder, we need to add preview-head.html.

And the best part is that we have a pretty clean package.json without dependencies, we all use them for all packages from the root.

# components

By organizing our component packages in this manner, we can easily manage and publish each package independently while sharing common dependencies and infrastructure provided by our monorepo.

The vite-env.d.ts file in the src folder helps TypeScript understand and provide accurate type checking for Vite-related code in our project. It ensures that TypeScript can recognize and validate Vite-specific properties, functions, and features.

We use four packages in this example, but the approach is the same. Once you create all the packages, you have to be able to build, run, and test them independently. Before all are in the root level, run yarn install then yarn build to build all packages, or build yarn build:vite-common and you can start using that package in your other packages.

# publish

To publish all the packages in our monorepo, we can use the npx lerna publish command. This command guides us through versioning and publishing each package based on the changes made.