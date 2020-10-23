import { EventEmitter } from '@byungi/event-emitter'
import {
  AcceptNanoPayment,
  AcceptNanoPaymentToken,
  CreateAcceptNanoPaymentParams,
  PaymentError,
} from './types'
import { createAPI } from './api'
import { createDOM } from './dom'
import { createPaymentService } from './paymentService'
import { logger } from './logger'
import {
  createWebSocket,
  createWebSocketURL,
  AcceptNanoWebSocket,
} from './webSocket'

type PaymentSessionEvents = {
  start: () => void
  end: (error: PaymentError | null, payment: AcceptNanoPayment | null) => void
}

type PaymentSessionConfig = {
  apiHost: string
  pollInterval?: number
  debug?: boolean
}

export const createPaymentSession = ({
  apiHost,
  pollInterval = 5_000,
  debug = false,
}: PaymentSessionConfig) => {
  logger.configure({ isEnabled: debug })

  const eventEmitter = new EventEmitter<PaymentSessionEvents>()
  const dom = createDOM()
  const api = createAPI({ baseURL: `https://${apiHost}/api` })
  let ws: AcceptNanoWebSocket | undefined

  const paymentService = createPaymentService({ api, pollInterval })
    .onTransition(state => {
      if (state.matches('creation') || state.matches('fetching')) {
        dom.mount()
        dom.renderLoading()
        eventEmitter.emit('start')
      }

      if (state.matches('verification')) {
        if (!ws) {
          ws = createWebSocket(
            createWebSocketURL({
              baseURL: `wss://${apiHost}/websocket`,
              paymentToken: state.context.payment.token,
            }),
          )

          ws.on('payment_verified', payment => {
            paymentService.send({ type: 'PAYMENT_VERIFIED', payment })
          })
        }

        dom.renderPayment(state.context.payment)
      }

      if (state.matches('success')) {
        ws && ws.close()
        dom.renderSuccess()
        eventEmitter.emit('end', null, state.context.payment)
      }

      if (state.matches('failure')) {
        ws && ws.close()
        dom.renderFailure(state.context.error)
        eventEmitter.emit('end', state.context.error, null)
      }
    })
    .start()

  dom.on('close', () => {
    paymentService.send({ type: 'TERMINATE' })
    dom.unmount()
  })

  return {
    on: eventEmitter.once.bind(eventEmitter),
    createPayment: (params: CreateAcceptNanoPaymentParams) => {
      paymentService.send({ type: 'CREATE_PAYMENT', params })
    },
    verifyPayment: ({ token }: { token: AcceptNanoPaymentToken }) => {
      paymentService.send({ type: 'START_PAYMENT_VERIFICATION', token })
    },
  }
}
