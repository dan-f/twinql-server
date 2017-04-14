/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const request = require('supertest')

chai.use(sinonChai)
const { expect } = chai

const SERVER_PATH = '../lib/server'

let { createServer } = require(SERVER_PATH)

describe('twinql server', () => {
  let server

  beforeEach(() => {
    server = createServer({})
  })

  function injectServer (twinqlResponse) {
    const backendStub = sinon.stub()
    const queryStub = twinqlResponse instanceof Error
      ? sinon.stub().rejects(twinqlResponse)
      : sinon.stub().resolves(twinqlResponse)
    const { createServer } = proxyquire(SERVER_PATH, {
      twinql: {
        WebBackend: backendStub,
        query: queryStub
      }
    })
    return { createServer, backendStub, queryStub }
  }

  it('returns HTTP 405 for non-POST requests to the "/" route', () => {
    return request(server)
      .get('/')
      .expect(405)
  })

  it('removes the x-powered-by header', () => {
    return request(server)
      .get('/')
      .expect(405)
      .then(response => expect(response.headers).not.to.have.property('x-powered-by'))
  })

  it('passes the forward proxy URI and user/origin headers to the twinql engine', () => {
    let { createServer, backendStub } = injectServer({})
    const user = 'https://alice.com/#alice'
    const origin = 'https://cool-app.biz'
    return request(createServer({ forwardProxyUri: 'https://example.com/proxy?uri=' }))
      .post('/')
      .set('user', user)
      .set('origin', origin)
      .send('')
      .expect(200)
      .then(() => {
        expect(backendStub).to.have.been.calledWith({
          proxyUri: 'https://example.com/proxy?uri=', headers: { user, origin }
        })
      })
  })

  it('sets the trust proxy to the reverse proxy IP address', () => {
    expect(server.settings['trust proxy']).to.equal('loopback')
    const reverseProxyIp = '0000:0000:0000:0000::'
    server = createServer({ reverseProxyIp })
    expect(server.settings['trust proxy']).to.equal(reverseProxyIp)
  })

  it('returns a 400 response if the query fails', () => {
    const error = new Error('Something bad happened')
    error.name = 'BadError'
    let { createServer } = injectServer(error)
    const user = 'https://alice.com/#alice'
    const origin = 'https://cool-app.biz'
    return request(createServer({ forwardProxyUri: 'https://example.com/proxy?uri=' }))
      .post('/')
      .set('user', user)
      .set('origin', origin)
      .send('')
      .expect(400)
      .then(response => {
        expect(response.body).to.eql({
          '@error': {
            message: 'Something bad happened',
            type: 'BadError'
          }
        })
      })
  })

  it('returns the result of the query if it succeeds', () => {
    let { createServer } = injectServer({data: 'stuff'})
    return request(createServer({ forwardProxyUri: 'https://example.com/proxy?uri=' }))
      .post('/')
      .set('user', 'https://alice.com/#alice')
      .set('origin', 'https://cool-app.biz')
      .send('')
      .expect(200, { data: 'stuff' })
      .then(response => expect(response.headers['content-type']).to.equal('application/ld+json; charset=utf-8'))
  })
})
