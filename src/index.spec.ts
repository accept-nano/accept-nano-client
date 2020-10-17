import * as AcceptNano from './index'

describe('exposed API', () => {
  it('matches the snapshot', () => {
    expect(AcceptNano).toMatchInlineSnapshot(`
      Object {
        "createSession": [Function],
        "mockAcceptNanoPayment": Object {
          "account": "nano_3c9pkkgdy5n8qkkrzj96ncjnpcbuj6ux3177wawn1wu5ynoejquumbffdxny",
          "amount": "0.000001",
          "amountInCurrency": "0.000001",
          "balance": "0",
          "currency": "NANO",
          "fulfilled": false,
          "merchantNotified": false,
          "remainingSeconds": 14399,
          "state": "",
          "subPayments": Object {},
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        },
      }
    `)
  })
})
