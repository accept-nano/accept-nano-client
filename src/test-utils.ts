import { AcceptNanoPayment } from './types'

export const mockAPIURL = 'https://accept-nano-demo.put.io/api'

export const mockAcceptNanoPayment: AcceptNanoPayment = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  account: 'nano_3c9pkkgdy5n8qkkrzj96ncjnpcbuj6ux3177wawn1wu5ynoejquumbffdxny',
  amount: '0.000001',
  amountInCurrency: '0.000001',
  currency: 'NANO',
  balance: '0',
  subPayments: {},
  remainingSeconds: 14399,
  state: '',
  fulfilled: false,
  merchantNotified: false,
}

export const mockCompletedAcceptNanoPayment: AcceptNanoPayment = {
  ...mockAcceptNanoPayment,
  merchantNotified: true,
}

export const createMockAPIResponseWithPayment = (
  payment = mockAcceptNanoPayment,
) => ({
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  data: payment,
})
