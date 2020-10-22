import { AxiosError } from 'axios'
import {
  interpret,
  createMachine,
  assign,
  DoneInvokeEvent,
  Sender,
} from 'xstate'
import { createAPI } from './api'
import { delay } from './utils'
import {
  AcceptNanoPayment,
  AcceptNanoPaymentToken,
  CreateAcceptNanoPaymentParams,
  PaymentError,
  PaymentSessionConfig,
} from './types'

type PaymentContext = {
  payment?: AcceptNanoPayment
  error?: PaymentError
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

type TerminatePaymentEvent = {
  type: 'TERMINATE'
}

type PaymentEvent =
  | CreatePaymentEvent
  | StartPaymentVerificationEvent
  | VerifyPaymentEvent
  | PaymentVerifiedEvent
  | PaymentSessionExpiredEvent
  | TerminatePaymentEvent

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
      context: PaymentContext & { payment: AcceptNanoPayment; error: undefined }
    }
  | {
      value: 'success'
      context: PaymentContext & { payment: AcceptNanoPayment; error: undefined }
    }
  | {
      value: 'failure'
      context: PaymentContext & { error: PaymentError }
    }

type PaymentServiceConfig = PaymentSessionConfig & {
  pollInterval: number
}

export const createPaymentService = ({
  apiURL,
  pollInterval,
}: PaymentServiceConfig) => {
  const api = createAPI({ baseURL: apiURL })

  const paymentMachineActions = {
    setPaymentData: assign<PaymentContext, DoneInvokeEvent<AcceptNanoPayment>>({
      payment: (_, event) => event.data,
    }),

    handleAPIError: {
      target: 'failure',
      actions: assign<PaymentContext, DoneInvokeEvent<AxiosError>>({
        error: (_, event) => ({ reason: 'NETWORK_ERROR', details: event.data }),
      }),
    },

    handleTerminate: {
      target: 'failure',
      actions: assign<PaymentContext, TerminatePaymentEvent>({
        error: { reason: 'USER_TERMINATED' },
      }),
    },
  }

  const paymentMachine = createMachine<
    PaymentContext,
    PaymentEvent,
    PaymentState
  >({
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
            actions: paymentMachineActions.setPaymentData,
          },
          onError: paymentMachineActions.handleAPIError,
        },
        on: {
          TERMINATE: paymentMachineActions.handleTerminate,
        },
      },

      fetching: {
        invoke: {
          src: (_context, event) =>
            api
              .fetchPayment({
                token: (event as StartPaymentVerificationEvent).token,
              })
              .then(response => response.data),
          onDone: {
            target: 'verification',
            actions: paymentMachineActions.setPaymentData,
          },
          onError: paymentMachineActions.handleAPIError,
        },
        on: {
          TERMINATE: paymentMachineActions.handleTerminate,
        },
      },

      verification: {
        invoke: {
          src: context => async (callback: Sender<PaymentEvent>) => {
            await delay(pollInterval)

            const { token } = context.payment as AcceptNanoPayment
            const { data } = await api.fetchPayment({ token })

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
            actions: paymentMachineActions.setPaymentData,
          },
          onError: paymentMachineActions.handleAPIError,
        },
        on: {
          VERIFY_PAYMENT: 'verification',
          PAYMENT_VERIFIED: {
            target: 'success',
            actions: assign<PaymentContext, PaymentVerifiedEvent>({
              payment: (_, event) => event.payment,
            }),
          },
          PAYMENT_SESSION_EXPIRED: {
            target: 'failure',
            actions: assign<PaymentContext, PaymentSessionExpiredEvent>({
              error: { reason: 'SESSION_EXPIRED' },
            }),
          },
          TERMINATE: paymentMachineActions.handleTerminate,
        },
      },

      success: {
        type: 'final',
      },

      failure: {
        type: 'final',
      },
    },
  })

  return interpret(paymentMachine)
}

export type PaymentService = ReturnType<typeof createPaymentService>
