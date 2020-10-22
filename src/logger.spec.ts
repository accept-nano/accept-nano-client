import { logger } from './logger'

describe('logger', () => {
  const spy = jest.spyOn(console, 'log')

  beforeEach(() => {
    spy.mockImplementation(() => null)
  })

  afterEach(jest.clearAllMocks)

  it('does not log to console by default', () => {
    logger.log('my-namespace', { foo: 'bar' })
    expect(spy).not.toBeCalled()
  })

  it('logs to console if configured to do so 🤖👍', () => {
    logger.configure({ isEnabled: true })
    logger.log('my-namespace', { foo: 'bar' })
    expect(spy).toBeCalledTimes(1)
  })
})
