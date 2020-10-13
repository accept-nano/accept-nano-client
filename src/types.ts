type StringifiedNumber = string
type StringifiedObject = string

export type NanoAccount = string
export type AcceptNanoPaymentToken = string
export type AcceptNanoCurrency = 'NANO' | 'USD'

export type CreateAcceptNanoPaymentParams = {
  amount: StringifiedNumber
  currency: AcceptNanoCurrency
  state: StringifiedObject
}

export interface AcceptNanoPayment {
  token: AcceptNanoPaymentToken
  account: NanoAccount
  amount: StringifiedNumber
  amountInCurrency: StringifiedNumber
  currency: AcceptNanoCurrency
  balance: StringifiedNumber
  subPayments: Record<string, unknown>
  remainingSeconds: number
  state: StringifiedObject
  fulfilled: boolean
  merchantNotified: false
}
