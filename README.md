# Github Language Checker

[![Deploy to VPS](https://github.com/wildan3105/github-langs/actions/workflows/deploy.yml/badge.svg)](https://github.com/wildan3105/github-langs/actions/workflows/deploy.yml)
[![Node.js test pipeline](https://github.com/wildan3105/github-langs/actions/workflows/test.yml/badge.svg)](https://github.com/wildan3105/github-langs/actions/workflows/test.yml)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/wildan3105/github-langs/issues)

## What ?

> A website to show the stats of programming language in the repos that a certain github account has.

[Go to the web!](https://gitstats.wildans.site)

![Screenshot](screenshot.png)

## Why does this project exist?

So people and/or organization can see the stats of programming language being used in their repositories easily.

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
Node >= 20.6.0+ (to enable .env support)
NPM >= 9.8.1
```

* [Generate access token (classic)](https://github.com/settings/tokens/new) with `repo` scope to ensure you don't get rate limited API call.

* Copy `.env.example` to `.env` and fill in the required environment variables:
```
ENV=local
TOKEN=your_github_access_token_here
PORT=3000
```

* Install dependency: `npm install`
* Start the app `npm run start:local` and go to `http://localhost:3000`

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
