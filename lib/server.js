const bodyParser = require('body-parser')
const compression = require('compression')
const express = require('express')
const twinql = require('twinql')

module.exports = {
  createServer,
  runServer
}

function createServer ({ reverseProxyIp = 'loopback', forwardProxyUri = '' }) {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', reverseProxyIp)
  app.use(bodyParser.text({ type: '*/*' }))
  app.use(compression())

  app.all('/', (req, res, next) => {
    if (req.method === 'POST') {
      next()
    } else {
      const err = new Error('To query, use HTTP POST with the query in the request body')
      err.name = 'Method Not Allowed'
      err.status = 405
      next(err)
    }
  })

  app.post('/', (req, res, next) => {
    const { user, origin } = req.headers
    const backend = new twinql.WebBackend({ proxyUri: forwardProxyUri, headers: { user, origin } })
    res.set('access-control-allow-origin', '*')
    res.set('vary', 'origin')
    return twinql.query(backend, req.body)
      .then(twinqlResponse => (
        res.set('content-type', 'application/ld+json').json(twinqlResponse)
      ))
      .catch(next)
  })

  app.use((err, req, res, next) => {
    res.status(err.status || 400).json({
      '@error': {
        type: err.name,
        message: err.message
      }
    })
  })

  return app
}

function runServer (app, { hostname = null, port = 8000 }) {
  return app.listen(port, hostname, () => {
    console.log(
      '...twinql server listening on ' + (
        hostname
          ? `<http://${hostname}:${port}>`
          : `port ${port}`
      )
    )
  })
}
