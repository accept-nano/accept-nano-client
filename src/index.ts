import { interpret } from 'xstate'
import { createAPI } from './api'
import { createPaymentService } from './paymentService'
import { AcceptNanoPaymentToken, CreateAcceptNanoPaymentParams } from './types'

export type SessionConfig = {
  apiURL: string
  pollInterval: number
}

export const createSession = ({ apiURL, pollInterval }: SessionConfig) => {
  const api = createAPI({ baseURL: apiURL })

  const paymentService = interpret(createPaymentService({ api, pollInterval }))
    .onTransition(state => {
      console.log(state.value)
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
