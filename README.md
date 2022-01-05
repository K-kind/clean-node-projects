# clean-node-projects

Select and delete unused folders from stale node projects.

## help

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
