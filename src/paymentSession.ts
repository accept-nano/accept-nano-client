import { EventEmitter } from '@byungi/event-emitter'
import {
  AcceptNanoPayment,
  AcceptNanoPaymentToken,
  AcceptNanoPaymentFailureReason,
  CreateAcceptNanoPaymentParams,
} from './types'
import { createAPI } from './api'
import { createDOM } from './dom'
import { createPaymentService } from './paymentService'

export type PaymentSessionConfig = {
  apiURL: string
  pollInterval: number
}

export type PaymentSessionEvents = {
  start: () => void
  success: (payment: AcceptNanoPayment) => void
  failure: (reason: AcceptNanoPaymentFailureReason) => void
}

export const createPaymentSession = ({
  apiURL,
  pollInterval,
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
        eventEmitter.emit('success', state.context.payment)
      }

      if (state.matches('error')) {
        dom.renderFailure(state.context.error)
        eventEmitter.emit('failure', state.context.error)
      }
    })
    .start()

  dom.once('close', () => {
    paymentService.send({ type: 'TERMINATE' })
    dom.unmount()
  })

  return {
    on: eventEmitter.on.bind(eventEmitter),
    once: eventEmitter.once.bind(eventEmitter),
    createPayment: (params: CreateAcceptNanoPaymentParams) => {
      paymentService.send({ type: 'CREATE_PAYMENT', params })
    },
    verifyPayment: (token: AcceptNanoPaymentToken) => {
      paymentService.send({ type: 'START_PAYMENT_VERIFICATION', token })
    },
  }
}
