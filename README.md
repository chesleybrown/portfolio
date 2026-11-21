portfolio
=========================

My personal portfolio to showcase my adventures in web development.

# Running Locally

Server runs on port `8000` by default, but will use the port set
on the environment variable `PORT` if set.

1. Copy `.env.dist` to `.env`
1. Set all the ENV vars in `.env`
1. Run `npm run grunt server` to start the server.

## Running Tests
To execute all the tests, just run:

```
npm test
```

# Scuttle trailer

`web/scuttle/media/trailer.mp4` is made from Scuttle's iPhone App Preview
(`Design/trailer/preview-iphone.mp4` in the scuttle-sandbox repo). Don't
re-encode it by hand: the preview has variable frame timing, and a plain
re-encode can put the picture out of sync with the sound. Run:

```
scripts/scuttle-trailer.sh ../scuttle-sandbox/Design/trailer/preview-iphone.mp4
```

It writes the web trailer and fails if any scene cut lands more than a frame
away from the source. `--check` runs only the check on the current file.
