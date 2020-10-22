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

type PaymentSessionConfig = {
  apiURL: string
  pollInterval?: number
}

type PaymentSessionEvents = {
  start: () => void
  end: (error: PaymentError | null, payment: AcceptNanoPayment | null) => void
}

export const createPaymentSession = ({
  apiURL,
  pollInterval = 1500,
}: PaymentSessionConfig) => {
  const eventEmitter = new EventEmitter<PaymentSessionEvents>()
  const api = createAPI({ baseURL: apiURL })
  const dom = createDOM()
  const paymentService = createPaymentService({ api, pollInterval })
    .onTransition(state => {
      if (state.matches('creation') || state.matches('fetching')) {
        dom.mount()
        dom.renderLoading()
        eventEmitter.emit('start')
      }

      if (state.matches('verification')) {
        dom.renderPayment(state.context.payment)
      }

      if (state.matches('success')) {
        dom.renderSuccess()
        eventEmitter.emit('end', null, state.context.payment)
      }

      if (state.matches('failure')) {
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
