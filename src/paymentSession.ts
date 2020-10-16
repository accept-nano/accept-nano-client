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
        return dom.renderLoading()
      }

      if (state.matches('verification')) {
        return dom.renderPayment(state.context.payment)
      }

      if (state.matches('success')) {
        return dom.renderSuccess()
      }

      if (state.matches('error')) {
        return dom.renderFailure(state.context.error)
      }
    })
    .start()

  return {
    createPayment: (params: CreateAcceptNanoPaymentParams) => {
      paymentService.send({ type: 'CREATE_PAYMENT', params })
    },
    verifyPayment: (token: AcceptNanoPaymentToken) => {
      paymentService.send({ type: 'START_PAYMENT_VERIFICATION', token })
    },
  }
}
