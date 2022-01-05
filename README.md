# clean-node-projects

CLI package to find and delete unused folders such as `node_modules`, `dist`.

<img width="835" alt="screen shot" src="https://user-images.githubusercontent.com/55728594/148258568-14aff2f9-8ad0-4300-8d5c-69ffd416474d.png">

## Requirement

- Node.js v12 or above

## Usage

Run temporarily

```
npx clean-node-projects
```

or install globally and run

```
npm i -g clean-node-projects
```

```
clean-node-projects
```

### Help

```
Usage: clean-node-projects [path] [options]

Options:
      --version  Show version number                                             [boolean]
  -t, --target   Folder names to find           [array] [default: ["node_modules","dist"]]
  -q, --quick    Do not calculate size                                           [boolean]
      --help     Show help                                                       [boolean]

Examples:
  clean-node-projects                            Find node_modules, dist folders under the
                                                 current path and remove selected ones.
  clean-node-projects ~/Desktop --target         Find node_modules and build folders under
  node_modules build                             the Desktop and remove selected ones.

```

## License

"clean-node-projects" is under [MIT license](https://en.wikipedia.org/wiki/MIT_License).
