import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { createSession } from './index'
import {
  mockAPIURL,
  mockAcceptNanoPayment,
  mockCompletedAcceptNanoPayment,
} from './test-utils'

export const mockSessionConfig = {
  apiURL: mockAPIURL,
  pollInterval: 100,
}

describe('acceptNano/createSession', () => {
  const mock = new MockAdapter(axios)

  afterEach(mock.reset)

  describe('verifyPayment flow', () => {
    it('dispatches start event once the session is initialized', done => {
      const paymentSession = createSession(mockSessionConfig)
      paymentSession.on('start', done)
      paymentSession.verifyPayment(mockAcceptNanoPayment.token)
    })

    it('dispatches success event once the payment is completed', done => {
      mock
        .onGet(`${mockAPIURL}/verify`)
        .reply(200, mockCompletedAcceptNanoPayment)

      const paymentSession = createSession(mockSessionConfig)

      paymentSession.on('success', payment => {
        expect(payment).toEqual(mockCompletedAcceptNanoPayment)
        done()
      })

      paymentSession.verifyPayment(mockAcceptNanoPayment.token)
    })
  })

  describe('createPayment flow', () => {
    it('dispatches start event once the session is initialized', done => {
      const paymentSession = createSession(mockSessionConfig)
      paymentSession.on('start', done)
      paymentSession.createPayment({
        amount: mockAcceptNanoPayment.amount,
        currency: mockAcceptNanoPayment.currency,
      })
    })

    it('dispatches success event once the payment is completed', done => {
      mock.onPost(`${mockAPIURL}/pay`).reply(200, mockAcceptNanoPayment)

      mock
        .onGet(`${mockAPIURL}/verify`)
        .reply(200, mockCompletedAcceptNanoPayment)

      const paymentSession = createSession(mockSessionConfig)

      paymentSession.on('success', payment => {
        expect(payment).toEqual(mockCompletedAcceptNanoPayment)
        done()
      })

      paymentSession.createPayment({
        amount: mockAcceptNanoPayment.amount,
        currency: mockAcceptNanoPayment.currency,
      })
    })
  })
})
