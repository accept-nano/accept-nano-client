import { interpret } from 'xstate'
import { createAPI } from './api'
import { createPaymentService } from './paymentService'
import { AcceptNanoPaymentToken, CreateAcceptNanoPaymentParams } from './types'

export type SessionConfig = {
  apiURL: string
  pollInterval: number
  debug: boolean
}

export const createSession = (config: SessionConfig) => {
  const api = createAPI({ baseURL: config.apiURL })

  const paymentService = interpret(createPaymentService(api))
    .onTransition(state => {
      if (config.debug) {
        console.log(state.value)
      }
    })
    .start()

  return {
    createPayment: (params: CreateAcceptNanoPaymentParams) => {
      paymentService.send('CREATE_PAYMENT', { params })
    },
    verifyPayment: (token: AcceptNanoPaymentToken) => {
      paymentService.send('VERIFY_PAYMENT', { token })
    },
  }
}
