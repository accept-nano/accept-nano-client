import { createSession, SessionConfig } from '.'

const mockSessionConfig: SessionConfig = {
  apiURL: 'https://accept-nano-demo.put.io/api',
  pollInterval: 1500,
}

describe('createSession - integration', () => {
  describe('createPayment', () => {
    it('works', () => {
      expect(createSession(mockSessionConfig)).toBeTruthy()
    })
  })
})
