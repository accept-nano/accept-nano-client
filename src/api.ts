import axios from 'axios'
import {
  AcceptNanoPayment,
  AcceptNanoPaymentToken,
  CreateAcceptNanoPaymentParams,
} from './types'

export const createAPI = ({ baseURL }: { baseURL: string }) => {
  const instance = axios.create({
    baseURL,
    timeout: 3000,
  })

  return {
    createPayment: ({
      amount,
      currency,
      state,
    }: CreateAcceptNanoPaymentParams) => {
      const form = new FormData()

      form.append('amount', amount)
      form.append('currency', currency)
      form.append('state', state || '')

      return instance.post<AcceptNanoPayment>('/pay', form)
    },

    fetchPayment: ({ token }: { token: AcceptNanoPaymentToken }) => {
      return instance.get<AcceptNanoPayment>('/verify', {
        params: {
          token,
        },
      })
    },
  }
}

export type AcceptNanoAPI = ReturnType<typeof createAPI>
