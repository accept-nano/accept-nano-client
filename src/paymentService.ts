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

type CancelPaymentEvent = {
  type: 'CANCEL_PAYMENT'
}

type PaymentEvent =
  | CreatePaymentEvent
  | StartPaymentVerificationEvent
  | VerifyPaymentEvent
  | PaymentVerifiedEvent
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

const setPaymentData = assign<
  PaymentContext,
  DoneInvokeEvent<AcceptNanoPayment>
>({
  payment: (_, event) => event.data,
})

const setPaymentError = assign<PaymentContext, DoneInvokeEvent<AxiosError>>({
  error: (_, event) => ({ type: 'NETWORK_ERROR', error: event }),
})

export const createPaymentService = ({
  api,
  pollInterval,
}: {
  api: API
  pollInterval: number
}) =>
  createMachine<PaymentContext, PaymentEvent, PaymentState>({
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
        },
      },

      success: {
        type: 'final',
      },

      error: {
        type: 'final',
      },
    },
    on: {
      CANCEL_PAYMENT: {
        target: 'error',
        actions: assign<PaymentContext, CancelPaymentEvent>({
          error: { type: 'USER_TERMINATED' },
        }),
      },
    },
  })

export type PaymentService = ReturnType<typeof createPaymentService>
