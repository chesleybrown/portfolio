portfolio
=========================
[![Build Status](https://travis-ci.org/chesleybrown/portfolio.svg?branch=master)](https://travis-ci.org/chesleybrown/portfolio)
[![Dependency Status](https://david-dm.org/chesleybrown/portfolio.svg)](https://david-dm.org/chesleybrown/portfolio)
[![devDependency Status](https://david-dm.org/chesleybrown/portfolio/dev-status.svg)](https://david-dm.org/chesleybrown/portfolio#info=devDependencies)

My personal portfolio that includes a social feed and a blog powered by Evernote.

# Running on Heroku

You can just deploy a free instance of the app on heroku using the button and
set the required ENV vars accordingly. 

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

# Running Locally

Server runs on port `8000` by default, but will use the port set
on the environment variable `PORT` if set.

1. Copy `.env.dist` to `.env`
1. Set all the ENV vars in `.env`
1. Run `grunt server` to start the server.

## Running Tests
To execute all the tests, just run:

```
npm test
```
