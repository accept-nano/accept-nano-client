import { delay, formatSeconds } from './utils'

describe('utils', () => {
  describe('delay', () => {
    it('delays... 🤡', async () => {
      const before = Date.now()
      await delay(100)
      const after = Date.now()
      expect(after - before).toBeGreaterThanOrEqual(100)
    })
  })

  describe('formatSeconds', () => {
    it('generates a hh:mm:ss output from given input', () => {
      expect(formatSeconds(1)).toBe('0:01')
      expect(formatSeconds(10)).toBe('0:10')
      expect(formatSeconds(61)).toBe('1:01')
      expect(formatSeconds(100)).toBe('1:40')
      expect(formatSeconds(601)).toBe('10:01')
      expect(formatSeconds(1000)).toBe('16:40')
      expect(formatSeconds(4001)).toBe('1:06:41')
      expect(formatSeconds(10000)).toBe('2:46:40')
      expect(formatSeconds(100000)).toBe('27:46:40')
    })
  })
})
