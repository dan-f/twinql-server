# twinql-server
[![Build Status](https://travis-ci.org/dan-f/twinql-server.svg?branch=master)](https://travis-ci.org/dan-f/twinql-server)
[![Coverage Status](https://coveralls.io/repos/github/dan-f/twinql-server/badge.svg)](https://coveralls.io/github/dan-f/twinql-server)

Places the [twinql](https://github.com/dan-f/twinql) query engine behind an HTTP server.

## What is this?

While [twinql](https://github.com/dan-f/twinql) can run within client JS
processes, the [LDP backend
implementation](https://github.com/dan-f/twinql/blob/master/src/backends/ldp-backend.js)
works by loading all the named graphs visited by the query at runtime.  This
results in a lot of network activity which may slow down clients with low
bandwidth, especially mobile devices.

The twinql server process provides an endpoint to which clients can `POST` their
twinql queries.  The twinql server then runs the query and returns the response.
Clients get just the data they request and nothing more.


## Running

This package distributes a binary which you can install globally:

```sh
$ npm i -g twinql-server
$ twinql-server -h

  Usage: twinql-server [options]

  Options:

    -h, --help                       output usage information
    -V, --version                    output the version number
    -H, --hostname [value]           The hostname of this server
    -p, --port <n>                   The port this server should run on
    -r, --reverse-proxy-ip [value]   The trusted IP address of the reverse proxy.  Takes values accepted by https://expressjs.com/en/guide/behind-proxies.html
    -f, --forward-proxy-uri [value]  The URI of the forward-facing Solid agent

```

It's best to run this behind a reverse proxy to provide HTTPS.

If you want the twinql engine to use an authenticated agent to fetch on behalf
of the client, provide a `--forward-proxy-uri`.

## Developing

Please submit Github issues, and we can work together to address them!

When making code changes the server is in the `lib/` directory, the binary is in
the `bin/` directory, and the tests are in the `test/` directory.  If you'd like
to make a code change make sure you add tests and run `npm test` before
submitting a PR.  And don't forget to `npm i` initially.
