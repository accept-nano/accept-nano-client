import { createPaymentSession } from './paymentSession'
import { mockAPIURL } from './test-utils'

export const mockSessionConfig = {
  apiURL: mockAPIURL,
  pollInterval: 1500,
}

describe('payment session', () => {
  it('works', () => {
    expect(createPaymentSession(mockSessionConfig)).toBeTruthy()
  })
})
