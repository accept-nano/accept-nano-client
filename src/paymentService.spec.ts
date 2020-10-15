import { interpret } from 'xstate'
import { createPaymentService } from './paymentService'
import { API } from './api'
import {
  createMockAPIResponseWithPayment,
  mockAcceptNanoPayment,
} from './test-utils'

const mockAPI: API = {
  createPayment: jest.fn(async () => createMockAPIResponseWithPayment()),
  fetchPayment: jest.fn(async () => createMockAPIResponseWithPayment()),
}

describe('paymentService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createPayment', () => {
    it('creates a payment session through API and transitions to verification state', done => {
      const paymentService = interpret(
        createPaymentService({ api: mockAPI, pollInterval: 100 }),
      )
        .onTransition(state => {
          if (state.matches('verification')) {
            expect(mockAPI.createPayment).toBeCalledTimes(1)
            done()
          }
        })
        .start()

      paymentService.send({
        type: 'CREATE_PAYMENT',
        params: { amount: '0.1', currency: 'USD' },
      })
    })

    it('transitions to error state if payment creation fails', done => {
      ;(mockAPI.createPayment as jest.Mock).mockRejectedValue(
        new Error('Network Error!'),
      )

      const paymentService = interpret(
        createPaymentService({ api: mockAPI, pollInterval: 100 }),
      )
        .onTransition(state => {
          if (state.matches('error')) {
            expect(mockAPI.createPayment).toBeCalledTimes(1)
            done()
          }
        })
        .start()

      paymentService.send({
        type: 'CREATE_PAYMENT',
        params: { amount: '0.1', currency: 'USD' },
      })
    })
  })

  describe('verifyPayment', () => {
    it('starts verifying a payment through API and transitions to success state', done => {
      const mockFetchPayment = mockAPI.fetchPayment as jest.Mock

      const paymentService = interpret(
        createPaymentService({ api: mockAPI, pollInterval: 100 }),
      )
        .onTransition(state => {
          if (state.matches('verification')) {
            mockFetchPayment.mockResolvedValue(
              createMockAPIResponseWithPayment({
                ...mockAcceptNanoPayment,
                merchantNotified: true,
              }),
            )
          }

          if (state.matches('success')) {
            expect(mockFetchPayment).toBeCalled()
            done()
          }
        })
        .start()

      paymentService.send({
        type: 'START_PAYMENT_VERIFICATION',
        token: mockAcceptNanoPayment.token,
      })
    })

    it('starts verifying a payment through API and transitions to failure state', done => {
      const mockFetchPayment = mockAPI.fetchPayment as jest.Mock

      const paymentService = interpret(
        createPaymentService({ api: mockAPI, pollInterval: 100 }),
      )
        .onTransition(state => {
          if (state.matches('verification')) {
            mockFetchPayment.mockRejectedValue(new Error('Network Error!'))
          }

          if (state.matches('error')) {
            expect(mockAPI.fetchPayment).toBeCalledTimes(2)
            done()
          }
        })
        .start()

      paymentService.send({
        type: 'START_PAYMENT_VERIFICATION',
        token: mockAcceptNanoPayment.token,
      })
    })
  })
})
