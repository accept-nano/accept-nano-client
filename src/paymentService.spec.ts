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
  const mockFetchPayment = mockAPI.fetchPayment as jest.Mock
  const mockCreatePayment = mockAPI.createPayment as jest.Mock

  afterEach(jest.clearAllMocks)

  describe('create payment', () => {
    it('creates a payment session through API and transitions to verification state', done => {
      mockFetchPayment.mockResolvedValueOnce(
        createMockAPIResponseWithPayment({
          ...mockAcceptNanoPayment,
          merchantNotified: true,
        }),
      )

      const paymentService = interpret(
        createPaymentService({ api: mockAPI, pollInterval: 100 }),
      )
        .onTransition(state => {
          if (state.matches('verification')) {
            expect(mockAPI.createPayment).toBeCalledTimes(1)
          }

          if (state.matches('success')) {
            expect(mockAPI.fetchPayment).toBeCalledTimes(1)
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
      mockCreatePayment.mockRejectedValueOnce(new Error('Network Error!'))

      const paymentService = interpret(
        createPaymentService({ api: mockAPI, pollInterval: 100 }),
      )
        .onTransition(state => {
          if (state.matches('error')) {
            expect(mockAPI.createPayment).toBeCalledTimes(1)
            expect(state.context.error?.type).toBe('NETWORK_ERROR')
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

  describe('verify payment flow', () => {
    it('starts verifying a payment through API and transitions to success state', done => {
      const paymentService = interpret(
        createPaymentService({ api: mockAPI, pollInterval: 100 }),
      )
        .onTransition(state => {
          if (
            state.matches('verification') &&
            mockFetchPayment.mock.calls.length === 2
          ) {
            mockFetchPayment.mockResolvedValueOnce(
              createMockAPIResponseWithPayment({
                ...mockAcceptNanoPayment,
                merchantNotified: true,
              }),
            )
          }

          if (state.matches('success')) {
            expect(mockFetchPayment).toBeCalledTimes(3)
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
      const paymentService = interpret(
        createPaymentService({ api: mockAPI, pollInterval: 100 }),
      )
        .onTransition(state => {
          if (state.matches('verification')) {
            mockFetchPayment.mockRejectedValueOnce(new Error('Network Error!'))
          }

          if (state.matches('error')) {
            expect(mockAPI.fetchPayment).toBeCalledTimes(2)
            expect(state.context.error?.type).toBe('NETWORK_ERROR')
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

  it('cancels ongoing flow if CANCEL_PAYMENT action has been sent', done => {
    const paymentService = interpret(
      createPaymentService({ api: mockAPI, pollInterval: 100 }),
    )
      .onTransition(state => {
        if (state.matches('creation')) {
          paymentService.send({
            type: 'CANCEL_PAYMENT',
          })
        }

        if (state.matches('error')) {
          expect(state.context.error?.type).toBe('USER_TERMINATED')
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
