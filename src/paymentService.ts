import { AxiosError } from 'axios'
import { createMachine, assign, DoneInvokeEvent, Sender } from 'xstate'
import { API } from './api'
import { delay } from './utils'
import {
  AcceptNanoPayment,
  AcceptNanoPaymentToken,
  CreateAcceptNanoPaymentParams,
} from './types'

type PaymentFailureReason =
  | { type: 'NETWORK_ERROR'; error: unknown }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'USER_TERMINATED' }

type PaymentContext = {
  payment?: AcceptNanoPayment
  error?: PaymentFailureReason
}

type CreatePaymentEvent = {
  type: 'CREATE_PAYMENT'
  params: CreateAcceptNanoPaymentParams
}

type StartPaymentVerificationEvent = {
  type: 'START_PAYMENT_VERIFICATION'
  token: AcceptNanoPaymentToken
}

type VerifyPaymentEvent = {
  type: 'VERIFY_PAYMENT'
}

type PaymentVerifiedEvent = {
  type: 'PAYMENT_VERIFIED'
  payment: AcceptNanoPayment
}

type PaymentSessionExpiredEvent = {
  type: 'PAYMENT_SESSION_EXPIRED'
}

type CancelPaymentEvent = {
  type: 'CANCEL_PAYMENT'
}

type PaymentEvent =
  | CreatePaymentEvent
  | StartPaymentVerificationEvent
  | VerifyPaymentEvent
  | PaymentVerifiedEvent
  | PaymentSessionExpiredEvent
  | CancelPaymentEvent

type PaymentState =
  | {
      value: 'idle'
      context: PaymentContext & { payment: undefined; error: undefined }
    }
  | {
      value: 'creation'
      context: PaymentContext & { payment: undefined; error: undefined }
    }
  | {
      value: 'fetching'
      context: PaymentContext & { payment: undefined; error: undefined }
    }
  | {
      value: 'verification'
      context: PaymentContext & { error: undefined }
    }
  | { value: 'success'; context: PaymentContext & { error: undefined } }
  | { value: 'error'; context: PaymentContext }

export const createPaymentService = ({
  api,
  pollInterval,
}: {
  api: API
  pollInterval: number
}) => {
  const setPaymentData = assign<
    PaymentContext,
    DoneInvokeEvent<AcceptNanoPayment>
  >({
    payment: (_, event) => event.data,
  })

  const setPaymentError = assign<PaymentContext, DoneInvokeEvent<AxiosError>>({
    error: (_, event) => ({ type: 'NETWORK_ERROR', error: event }),
  })

  const sharedCancelPaymentHandler = {
    target: 'error',
    actions: assign<PaymentContext, CancelPaymentEvent>({
      error: { type: 'USER_TERMINATED' },
    }),
  }

  return createMachine<PaymentContext, PaymentEvent, PaymentState>({
    id: 'payment',
    initial: 'idle',
    context: {
      payment: undefined,
      error: undefined,
    },
    states: {
      idle: {
        on: {
          CREATE_PAYMENT: 'creation',
          START_PAYMENT_VERIFICATION: 'fetching',
        },
      },

      creation: {
        invoke: {
          src: (_context, event) =>
            api
              .createPayment((event as CreatePaymentEvent).params)
              .then(response => response.data),
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
          CANCEL_PAYMENT: sharedCancelPaymentHandler,
        },
      },

      fetching: {
        invoke: {
          src: (_context, event) =>
            api
              .fetchPayment((event as StartPaymentVerificationEvent).token)
              .then(response => response.data),
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
          CANCEL_PAYMENT: sharedCancelPaymentHandler,
        },
      },

      verification: {
        invoke: {
          src: context => async (callback: Sender<PaymentEvent>) => {
            await delay(pollInterval)

            const { token } = context.payment as AcceptNanoPayment
            const { data } = await api.fetchPayment(token)

            if (data.merchantNotified) {
              return callback({ type: 'PAYMENT_VERIFIED', payment: data })
            }

            if (data.remainingSeconds === 0) {
              return callback({ type: 'PAYMENT_SESSION_EXPIRED' })
            }

            return callback({ type: 'VERIFY_PAYMENT' })
          },
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
          VERIFY_PAYMENT: 'verification',
          PAYMENT_VERIFIED: 'success',
          PAYMENT_SESSION_EXPIRED: {
            target: 'error',
            actions: assign<PaymentContext, PaymentSessionExpiredEvent>({
              error: { type: 'SESSION_EXPIRED' },
            }),
          },
          CANCEL_PAYMENT: sharedCancelPaymentHandler,
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

export type PaymentService = ReturnType<typeof createPaymentService>
