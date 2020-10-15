import { createSession, SessionConfig } from '.'

const mockSessionConfig: SessionConfig = {
  apiURL: 'https://accept-nano-demo.put.io/api',
  pollInterval: 1500,
  debug: true,
}

describe('createSession - integration', () => {
  describe('createPayment', () => {
    it('works', () => {
      const session = createSession(mockSessionConfig)
      session.createPayment({ amount: '0.1', currency: 'NANO' })
    })
  })
})
