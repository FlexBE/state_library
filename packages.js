/*
    Package entry format:
    - owner:  Github user or organization where the repo is located.
    - repo:   Name of the repository.
    - path:   Path inside the repository of the folder which contains the state python files.
              If the repository contains multiple ROS packages with states, add multiple entries.
    - ref:    Git reference of the repository, e.g., branch name.
*/
var packages = [
    {
        'owner': "team-vigir",
        'repo': "flexbe_behavior_engine",
        'path': "flexbe_states/src/flexbe_states",
        'ref': "master"
    },
    {
        'owner': "FlexBE",
        'repo': "generic_flexbe_states",
        'path': "flexbe_utility_states/src/flexbe_utility_states",
        'ref': "master"
    },
    {
        'owner': "FlexBE",
        'repo': "generic_flexbe_states",
        'path': "flexbe_manipulation_states/src/flexbe_manipulation_states",
        'ref': "master"
    },
    {
        'owner': "FlexBE",
        'repo': "generic_flexbe_states",
        'path': "flexbe_navigation_states/src/flexbe_navigation_states",
        'ref': "master"
    },
    {
        'owner': "FlexBE",
        'repo': "youbot_behaviors",
        'path': "youbot_flexbe_states/src/youbot_flexbe_states",
        'ref': "master"
    },
    {
        'owner': "FlexBE",
        'repo': "flexbe_strands",
        'path': "strands_flexbe_states/src/strands_flexbe_states",
        'ref': "master"
    },
    {
        'owner': "CNURobotics",
        'repo': "flexible_manipulation",
        'path': "flexible_manipulation_flexbe_states/src/flexible_manipulation_flexbe_states",
        'ref': "kinetic_alpha"
    },
    {
        'owner': "CNURobotics",
        'repo': "flexible_navigation",
        'path': "flex_nav_flexbe_states/src/flex_nav_flexbe_states",
        'ref': "kinetic_devel"
    },
    {
        'owner': "tu-darmstadt-ros-pkg",
        'repo': "hector_flexbe_behavior",
        'path': "hector_flexbe_states/src/hector_flexbe_states",
        'ref': "rc18"
    },
    {
        'owner': "team-vigir",
        'repo': "vigir_behaviors",
        'path': "vigir_flexbe_states/src/vigir_flexbe_states",
        'ref': "master"
    }
];
