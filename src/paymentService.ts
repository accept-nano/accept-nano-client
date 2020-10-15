import { AxiosError } from 'axios'
import { Machine, assign, DoneInvokeEvent } from 'xstate'
import { API } from './api'
import {
  AcceptNanoPayment,
  AcceptNanoPaymentToken,
  CreateAcceptNanoPaymentParams,
} from './types'

type PaymentFailureReason =
  | { type: 'SYSTEM_ERROR'; error: unknown }
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

type CreatePaymentEvent = {
  type: 'CREATE_PAYMENT'
  params: CreateAcceptNanoPaymentParams
}

type VerifyPaymentEvent = {
  type: 'VERIFY_PAYMENT'
  token: AcceptNanoPaymentToken
}

// websocket
type PaymentVerifiedEvent = {
  type: 'PAYMENT_VERIFIED'
  payment: AcceptNanoPayment
}

type CancelPaymentEvent = {
  type: 'CANCEL_PAYMENT'
}

type PaymentEvent =
  | CreatePaymentEvent
  | VerifyPaymentEvent
  | PaymentVerifiedEvent
  | CancelPaymentEvent

interface PaymentContext {
  payment: AcceptNanoPayment | null
  error: PaymentFailureReason | null
}

const invokeCreatePayment = (api: API) => (
  _context: PaymentContext,
  event: PaymentEvent,
) =>
  api
    .createPayment((event as CreatePaymentEvent).params)
    .then(response => response.data)

const invokeVerifyPayment = (api: API) => (
  context: PaymentContext,
  event: PaymentEvent,
) =>
  new Promise((resolve, reject) => {
    const token = context.payment?.token || (event as VerifyPaymentEvent).token

    const pollVerifyPayment = () =>
      api
        .verifyPayment(token)
        .then(response => {
          if (response.data.merchantNotified) {
            return resolve()
          }

          setTimeout(pollVerifyPayment, 1500)
        })
        .catch(error => reject(error))

    pollVerifyPayment()
  })

const setPaymentData = assign<
  PaymentContext,
  DoneInvokeEvent<AcceptNanoPayment>
>({
  payment: (_, event) => event.data,
})

const setPaymentError = assign<PaymentContext, DoneInvokeEvent<AxiosError>>({
  error: (_, event) => ({ type: 'SYSTEM_ERROR', error: event }),
})

export const createPaymentService = (api: API) =>
  Machine<PaymentContext, PaymentStateSchema, PaymentEvent>({
    id: 'payment',
    initial: 'init',
    context: {
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
        invoke: {
          src: invokeCreatePayment(api),
          onDone: {
            target: 'verification',
            actions: setPaymentData,
          },
          onError: {
            target: 'error',
            actions: setPaymentError,
          },
        },
        on: {
          CANCEL_PAYMENT: 'error',
        },
      },
      verification: {
        invoke: {
          src: invokeVerifyPayment(api),
          onDone: {
            target: 'success',
            actions: setPaymentData,
          },
          onError: {
            target: 'error',
            actions: setPaymentError,
          },
        },
        on: {
          PAYMENT_VERIFIED: 'success',
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
