import { AcceptNanoPaymentToken, CreateAcceptNanoPaymentParams } from './types'
import { createAPI } from './api'
import { createDOM } from './dom'
import { createPaymentService } from './paymentService'

export type PaymentSessionConfig = {
  apiURL: string
  pollInterval: number
}

export const createPaymentSession = ({
  apiURL,
  pollInterval,
}: PaymentSessionConfig) => {
  const api = createAPI({ baseURL: apiURL })
  const dom = createDOM()
  const paymentService = createPaymentService({ api, pollInterval })
    .onTransition(state => {
      if (state.matches('idle')) {
        dom.mount()
        dom.renderLoading()
      }

      if (state.matches('verification')) {
        dom.renderPayment(state.context.payment)
      }

      if (state.matches('success')) {
        dom.renderSuccess()
      }

      if (state.matches('error')) {
        dom.renderFailure(state.context.error)
      }
    })
    .start()

  dom.once('CLOSE', () => {
    paymentService.send({ type: 'TERMINATE' })
    dom.unmount()
  })

  return {
    createPayment: (params: CreateAcceptNanoPaymentParams) => {
      paymentService.send({ type: 'CREATE_PAYMENT', params })
    },
    verifyPayment: (token: AcceptNanoPaymentToken) => {
      paymentService.send({ type: 'START_PAYMENT_VERIFICATION', token })
    },
  }
}
