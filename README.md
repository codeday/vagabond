# Vagabond

A lightweight scaffolding system for building your own Nomad template system.

Vagabond will take a `.yml` taskspec file as input, and pass the config to the `render` export of `template.js`, which
is expected to generate Nomad-capable (JSON-style) object in some way.

Optionally, your module may export a `mergePrevious(job, previous)` method which receives the currently running job spec
(if any) and returns the final job object. This is useful for, e.g., not updating the count on a task group, or not
updating the tag of a running docker container, allowing you to maintain deployment state separate from config.

For an example check out the `jobs` folder in [srnd/containercfg](https://github.com/srnd/containercfg).

## Commands

- `render` - Renders the JSON
- `plan` - Shows the execution plan, and provides the Job Modify Index value
- `run` - Runs the job on the live cluster

Syntax and ENV variables are similar to the `nomad` utility.
