import { AcceptNanoPayment, PaymentFailureReason } from './types'

export const createDOM = () => ({
  renderLoading: () => {},
  renderPayment: (payment: AcceptNanoPayment) => {
    console.log(payment)
  },
  renderSuccess: () => {},
  renderFailure: (reason: PaymentFailureReason) => {
    console.log(reason)
  },
})
