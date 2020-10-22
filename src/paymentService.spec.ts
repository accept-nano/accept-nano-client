import { createPaymentService } from './paymentService'
import {
  createMockAPIResponse,
  mockAcceptNanoPayment,
  mockAPIURL,
} from './test-utils'

const mockCreatePayment = jest.fn(async () => createMockAPIResponse())
const mockFetchPayment = jest.fn(async () => createMockAPIResponse())

jest.mock('./api', () => ({
  createAPI: () => ({
    createPayment: mockCreatePayment,
    fetchPayment: mockFetchPayment,
  }),
}))

describe('paymentService', () => {
  const paymentServiceConfig = {
    apiURL: mockAPIURL,
    pollInterval: 100,
  }

  afterEach(jest.clearAllMocks)

  describe('createPayment flow', () => {
    it('creates a payment session through API and transitions to verification state', done => {
      mockFetchPayment.mockResolvedValueOnce(
        createMockAPIResponse({
          ...mockAcceptNanoPayment,
          merchantNotified: true,
        }),
      )

      const paymentService = createPaymentService(paymentServiceConfig)
        .onTransition(state => {
          if (state.matches('verification')) {
            expect(mockCreatePayment).toBeCalledTimes(1)
          }

          if (state.matches('success')) {
            expect(mockFetchPayment).toBeCalledTimes(1)
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

      const paymentService = createPaymentService(paymentServiceConfig)
        .onTransition(state => {
          if (state.matches('failure')) {
            expect(mockCreatePayment).toBeCalledTimes(1)
            expect(state.context.error?.reason).toBe('NETWORK_ERROR')
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

  describe('verifyPayment flow', () => {
    it('starts verifying a payment through API and transitions to success state', done => {
      const paymentService = createPaymentService(paymentServiceConfig)
        .onTransition(state => {
          if (
            state.matches('verification') &&
            mockFetchPayment.mock.calls.length === 2
          ) {
            mockFetchPayment.mockResolvedValueOnce(
              createMockAPIResponse({
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
      const paymentService = createPaymentService(paymentServiceConfig)
        .onTransition(state => {
          if (state.matches('verification')) {
            mockFetchPayment.mockRejectedValueOnce(new Error('Network Error!'))
          }

          if (state.matches('failure')) {
            expect(mockFetchPayment).toBeCalledTimes(2)
            expect(state.context.error?.reason).toBe('NETWORK_ERROR')
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

  it('cancels ongoing flow if TERMINATE action has been sent', done => {
    const paymentService = createPaymentService(paymentServiceConfig)
      .onTransition(state => {
        if (state.matches('creation')) {
          paymentService.send({ type: 'TERMINATE' })
        }

        if (state.matches('failure')) {
          expect(state.context.error?.reason).toBe('USER_TERMINATED')
          done()
        }
      })
      .start()

    paymentService.send({
      type: 'CREATE_PAYMENT',
      params: { amount: '0.1', currency: 'USD' },
    })
  })

  it('cancels ongoing flow if payment session is expired', done => {
    mockFetchPayment.mockResolvedValueOnce(
      createMockAPIResponse({
        ...mockAcceptNanoPayment,
        remainingSeconds: 0,
      }),
    )

    const paymentService = createPaymentService(paymentServiceConfig)
      .onTransition(state => {
        if (state.matches('failure')) {
          expect(state.context.error?.reason).toBe('SESSION_EXPIRED')
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
