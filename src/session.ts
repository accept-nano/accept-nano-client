import { Machine } from 'xstate'
import {
  AcceptNanoPayment,
  AcceptNanoPaymentToken,
  CreateAcceptNanoPaymentParams,
} from './types'

type SessionConfig = {
  apiURL: string
  pollInterval: number
  debug: boolean
}

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

interface PaymentContext {
  paymentToken: AcceptNanoPaymentToken | null
}

export const createSession = (config: SessionConfig) => {
  const paymentMachine = Machine<
    PaymentContext,
    PaymentStateSchema,
    PaymentEvent
  >({
    id: 'payment',
    initial: 'init',
    context: {
      paymentToken: null,
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
        },
      },
      verification: {
        on: {
          VERIFY_PAYMENT: 'verification',
          VERIFY_PAYMENT_SUCCESS: 'success',
          VERIFY_PAYMENT_FAILURE: 'error',
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
