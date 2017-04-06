// TODO:
// - logging?
// - http or https depending on environment variables
// - hostname
// - see https://expressjs.com/en/guide/behind-proxies.html
// - see https://expressjs.com/en/advanced/best-practice-security.html

const bodyParser = require('body-parser')
const express = require('express')
const twinql = require('twinql')

let { PORT, PROXY_URI } = process.env
PORT = PORT || 80
PROXY_URI = PROXY_URI || ''

const app = express()

app.use(bodyParser.text())

app.post('/', (req, res, next) => {
  const backend = new twinql.LdpBackend({ proxyUri: PROXY_URI })
  res.set('access-control-allow-origin', '*')
  res.set('vary', 'origin')
  return twinql.query(backend, req.body)
    .then(resp => res.json(resp))
    .catch(err => next(err))
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(400).json({ '@error': err })
})

app.listen(PORT, () => {
  console.log(`...twinql server listening on port ${PORT}`)
})
