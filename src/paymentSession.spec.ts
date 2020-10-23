import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { Server } from 'mock-socket'
import { screen, waitFor } from '@testing-library/dom'
import { createPaymentSession } from './paymentSession'
import * as webSocket from './webSocket'
import {
  mockAPIHost,
  mockAcceptNanoPayment,
  mockVerifiedAcceptNanoPayment,
  clearDOM,
} from './test-utils'

describe('createPaymentSession', () => {
  const sessionConfig = { apiHost: mockAPIHost, pollInterval: 100, debug: true }
  const { token, amount, currency } = mockAcceptNanoPayment
  const mock = new MockAdapter(axios)

  afterEach(() => {
    mock.reset()
    clearDOM()
  })

  describe('createPayment flow', () => {
    it('dispatches start event once the session is initialized', done => {
      const paymentSession = createPaymentSession({ apiHost: mockAPIHost })
      paymentSession.on('start', done)
      paymentSession.createPayment({ amount, currency })
    })

    it('dispatches success event once the payment is verified', done => {
      mock
        .onPost(`https://${mockAPIHost}/api/pay`)
        .reply(200, mockAcceptNanoPayment)

      mock
        .onGet(`https://${mockAPIHost}/api/verify`)
        .reply(200, mockVerifiedAcceptNanoPayment)

      const paymentSession = createPaymentSession(sessionConfig)

      paymentSession.on('end', (_error, payment) => {
        expect(payment).toEqual(mockVerifiedAcceptNanoPayment)
        done()
      })

      paymentSession.createPayment({ amount, currency })
    })
  })

  describe('verifyPayment flow', () => {
    it('dispatches start event once the session is initialized', done => {
      const paymentSession = createPaymentSession({ apiHost: mockAPIHost })
      paymentSession.on('start', done)
      paymentSession.verifyPayment({ token })
    })

    it('dispatches success event once the payment is verified', done => {
      mock
        .onGet(`https://${mockAPIHost}/api/verify`)
        .reply(200, mockVerifiedAcceptNanoPayment)

      const paymentSession = createPaymentSession(sessionConfig)

      paymentSession.on('end', (_error, payment) => {
        expect(payment).toEqual(mockVerifiedAcceptNanoPayment)
        done()
      })

      paymentSession.verifyPayment({ token })
    })

    it('dispatches success event once the payment is verified -- via websocket event', done => {
      // socket-mock doesn't work when we pass a URL with query param, had to mock URL here 😞 //
      const createWebSocketURLSpy = jest.spyOn(webSocket, 'createWebSocketURL')
      createWebSocketURLSpy.mockImplementation(() => `wss://localhost:8080`)
      // ------------------------------------------------------------------------------------ //

      const wss = new Server('wss://localhost:8080')
      wss.on('connection', server => {
        setTimeout(() => {
          server.send(JSON.stringify(mockVerifiedAcceptNanoPayment))
          server.close()
        }, sessionConfig.pollInterval * 2)
      })

      mock
        .onGet(`https://${mockAPIHost}/api/verify`)
        .reply(200, mockAcceptNanoPayment)

      const paymentSession = createPaymentSession(sessionConfig)

      paymentSession.on('end', (_error, payment) => {
        expect(payment).toEqual(mockVerifiedAcceptNanoPayment)
        done()
      })

      paymentSession.verifyPayment({ token })
    })

    it('dispatches cancel event if close button is clicked during the verification', done => {
      mock
        .onGet(`https://${mockAPIHost}/api/verify`)
        .reply(200, mockAcceptNanoPayment)

      const paymentSession = createPaymentSession(sessionConfig)

      paymentSession.on('start', async () => {
        await waitFor(() => {
          expect(screen.queryAllByAltText('X')).toBeTruthy()
          screen.getByText('X').click()
        })
      })

      paymentSession.on('end', (error, _payment) => {
        expect(error && error.reason).toBe('USER_TERMINATED')
        done()
      })

      paymentSession.verifyPayment({ token })
    })
  })
})
