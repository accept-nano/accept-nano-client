import { Machine } from 'xstate'
import { API } from './api'
import {
  AcceptNanoPayment,
  AcceptNanoPaymentToken,
  CreateAcceptNanoPaymentParams,
} from './types'

type PaymentFailureReason =
  | { type: 'SYSTEM_ERROR'; error: Error }
  | { type: 'NETWORK_ERROR' }
  | { type: 'USER_TERMINATED' }

interface PaymentStateSchema {
  states: {
    init: {}
    creation: {}
    verification: {}
    success: {}
    error: {}
  }
}

type PaymentEvent =
  | { type: 'CREATE_PAYMENT'; params: CreateAcceptNanoPaymentParams }
  | { type: 'CREATE_PAYMENT_SUCCESS'; payment: AcceptNanoPayment }
  | { type: 'CREATE_PAYMENT_FAILURE'; reason: PaymentFailureReason }
  | { type: 'VERIFY_PAYMENT'; token: AcceptNanoPaymentToken }
  | { type: 'VERIFY_PAYMENT_SUCCESS'; payment: AcceptNanoPayment }
  | { type: 'VERIFY_PAYMENT_FAILURE'; reason: PaymentFailureReason }
  | { type: 'CANCEL_PAYMENT' }

interface PaymentContext {
  paymentToken: AcceptNanoPaymentToken | null
  payment: AcceptNanoPayment | null
  error: PaymentFailureReason | null
}

export const createPaymentService = (api: API) => {
  console.log(api)

  return Machine<PaymentContext, PaymentStateSchema, PaymentEvent>({
    id: 'payment',
    initial: 'init',
    context: {
      paymentToken: null,
      payment: null,
      error: null,
    },
    states: {
      init: {
        on: {
          CREATE_PAYMENT: 'creation',
          VERIFY_PAYMENT: 'verification',
        },
      },
      creation: {
        on: {
          CREATE_PAYMENT_SUCCESS: 'verification',
          CREATE_PAYMENT_FAILURE: 'error',
          CANCEL_PAYMENT: 'error',
        },
      },
      verification: {
        on: {
          VERIFY_PAYMENT: 'verification',
          VERIFY_PAYMENT_SUCCESS: 'success',
          VERIFY_PAYMENT_FAILURE: 'error',
          CANCEL_PAYMENT: 'error',
        },
      },
      success: {
        type: 'final',
      },
      error: {
        type: 'final',
      },
    },
  })
}
