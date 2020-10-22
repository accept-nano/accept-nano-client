import { Server } from 'mock-socket'
import { createWebSocket, createWebSocketURL } from './webSocket'
import {
  mockAcceptNanoPayment,
  mockCompletedAcceptNanoPayment,
} from './test-utils'

const socketConfig = {
  baseURL: 'wss://localhost:8080',
  paymentToken: mockAcceptNanoPayment.token,
}

describe('createWebSocket', () => {
  const mockServer = new Server(socketConfig.baseURL)

  it('emits `open` event', done => {
    mockServer.on('connection', server => {
      server.send('hello')
      server.close()
    })

    const socket = createWebSocket(socketConfig.baseURL)
    socket.on('open', done)
  })

  it('emits `close` event', done => {
    mockServer.on('connection', server => {
      server.send('hello')
    })

    const socket = createWebSocket(socketConfig.baseURL)
    socket.on('close', done)
    socket.close()
  })

  it('emits `error` event', done => {
    const socket = createWebSocket(socketConfig.baseURL + 'oops')
    socket.on('error', () => {
      done()
    })
  })

  describe('after receiving a message', () => {
    it('emits `payment_updated` event for expected payloads', done => {
      mockServer.on('connection', server => {
        server.send(JSON.stringify(mockAcceptNanoPayment))
        server.close()
      })

      const socket = createWebSocket(socketConfig.baseURL)
      socket.on('payment_updated', payment => {
        expect(payment).toEqual(mockAcceptNanoPayment)
        done()
      })
    })

    it('emits `payment_completed` event for completed payments', done => {
      mockServer.on('connection', server => {
        server.send(JSON.stringify(mockCompletedAcceptNanoPayment))
        server.close()
      })

      const socket = createWebSocket(socketConfig.baseURL)
      socket.on('payment_completed', payment => {
        expect(payment).toEqual(mockCompletedAcceptNanoPayment)
        done()
      })
    })

    it('ignores weird payloads', done => {
      mockServer.on('connection', server => {
        server.send(JSON.stringify(`{ foo: bar }`))
        server.close()
      })

      const socket = createWebSocket(socketConfig.baseURL)
      socket.on('close', done)
    })
  })
})

describe('createWebSocketURL', () => {
  it('works 🤡', () => {
    expect(createWebSocketURL(socketConfig)).toMatchInlineSnapshot(
      `"wss://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"`,
    )
  })
})
