import * as acceptNano from './index'

describe('acceptNano', () => {
  it('exposes the snapshotted API', () => {
    expect(acceptNano).toMatchInlineSnapshot(`
      Object {
        "createSession": [Function],
      }
    `)
  })
})
