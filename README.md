# FlexBE State Library

Web application to browse through available FlexBE states from various organizations.

Available via GitHub Pages: [flexbe.github.io/state_library](https://flexbe.github.io/state_library)

## Contribution

If you would like to add a repository of FlexBE states, please create a pull request by modifying the file `packages.js`.
Add a new entry for your ROS state package as in the example below. 

```javascript
/*
    Package entry format:
    - owner:  Github user or organization where the repo is located.
    - repo:   Name of the repository.
    - path:   Path inside the repository of the folder which contains the state python files.
              If the repository contains multiple ROS packages with states, add multiple entries.
    - ref:    Git reference of the repository, e.g., branch name.
*/
var packages = [
[...]
    {
        'owner': "FlexBE",
        'repo': "youbot_behaviors",
        'path': "youbot_flexbe_states/src/youbot_flexbe_states",
        'ref': "master"
    },
];
```

Thank you!
