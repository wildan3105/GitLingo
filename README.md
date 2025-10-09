# Github Language Checker

[![Deploy to VPS](https://github.com/wildan3105/github-langs/actions/workflows/deploy.yml/badge.svg)](https://github.com/wildan3105/github-langs/actions/workflows/deploy.yml)
[![Node.js test pipeline](https://github.com/wildan3105/github-langs/actions/workflows/test.yml/badge.svg)](https://github.com/wildan3105/github-langs/actions/workflows/test.yml)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/wildan3105/github-langs/issues)

## What ?

> A website to show the stats of programming language in the repos that a certain github account has.

[Go to the web!](https://gitstats.wildans.site)

![Screenshot](screenshot.png)

## Why does this project exist?

So people can see the stats of programming language being used in their repositories easily.

## Key features
- Show statistics of repo's programming language (overall) from a given github account
- Display the total of each programming language based on github [programming language color](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml)
- Browse the repo with specific programming language directly from the chart bar
- Ability to switch between multicolor or single color (white)
- Ability to download the chart in a JPG file
- Ability to share the result via facebook or X (formerly Twitter)

## Running locally

### Supported environment:
* Prerequisite: 
```bash
Node >= v18.18.0
NPM >= 9.5.0
```

* [Generate access token (classic)](https://github.com/settings/tokens/new) with `repo` scope to ensure you don't get rate limited API call.

* Define environment variable with the following values:
```
TOKEN=your-access-token
ENV=local
```

An example of environment variable is provided [here](.env.example)

* Install dependency: `npm install`
* Start the app `<list-of-env-and-values> npm run start` and go to `http://localhost:3000`

## Running with hot-reload
```bash
npm run dev # it will reload the application whenever there's scss file changes
```

## Feature tracker / bug report:
You can see the feature progress / bug report and pick up some issues in the [issues](https://github.com/wildan3105/github-langs/issues)

## Contributing

Check out this [page](CONTRIBUTING.md)
## Other similar projects:
- [Githut](https://github.com/madnight/githut)
- [Hacktoberfest Checker](https://github.com/jenkoian/hacktoberfest-checker) (it's now archived)

## License :

MIT (c) Wildan S. Nahar 2017 - 2025
