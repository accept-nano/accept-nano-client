import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { screen, waitFor } from '@testing-library/dom'
import { createPaymentSession } from './paymentSession'
import {
  mockAPIURL,
  mockAcceptNanoPayment,
  mockCompletedAcceptNanoPayment,
  clearDOM,
} from './test-utils'

export const mockSessionConfig = {
  apiURL: mockAPIURL,
  pollInterval: 100,
}

describe('createPaymentSession', () => {
  const mock = new MockAdapter(axios)

  afterEach(() => {
    mock.reset()
    clearDOM()
  })

  describe('createPayment flow', () => {
    it('dispatches start event once the session is initialized', done => {
      const paymentSession = createPaymentSession(mockSessionConfig)
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

      const paymentSession = createPaymentSession(mockSessionConfig)

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

  describe('verifyPayment flow', () => {
    it('dispatches start event once the session is initialized', done => {
      const paymentSession = createPaymentSession(mockSessionConfig)
      paymentSession.on('start', done)
      paymentSession.verifyPayment(mockAcceptNanoPayment.token)
    })

    it('dispatches success event once the payment is completed', done => {
      mock
        .onGet(`${mockAPIURL}/verify`)
        .reply(200, mockCompletedAcceptNanoPayment)

      const paymentSession = createPaymentSession(mockSessionConfig)

      paymentSession.on('success', payment => {
        expect(payment).toEqual(mockCompletedAcceptNanoPayment)
        done()
      })

      paymentSession.verifyPayment(mockAcceptNanoPayment.token)
    })

    it('dispatches cancel event if close button is clicked during the verification', done => {
      mock.onGet(`${mockAPIURL}/verify`).reply(200, mockAcceptNanoPayment)

      const paymentSession = createPaymentSession(mockSessionConfig)

      paymentSession.on('start', async () => {
        await waitFor(() => {
          expect(screen.queryAllByAltText('X')).toBeTruthy()
          screen.getByText('X').click()
        })
      })

      paymentSession.on('failure', reason => {
        expect(reason.type).toBe('USER_TERMINATED')
        done()
      })

      paymentSession.verifyPayment(mockAcceptNanoPayment.token)
    })
  })
})
