import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { createAPI } from './api'
import { mockAcceptNanoPayment, mockBaseURL } from './test-utils'

describe('api', () => {
  const mock = new MockAdapter(axios)
  const api = createAPI({ baseURL: mockBaseURL })

  afterEach(mock.reset)

  it('creates the payment with correctly constructed request', async () => {
    mock.onPost(`${mockBaseURL}/pay`).reply(200, mockAcceptNanoPayment)

    const response = await api.createPayment({
      amount: '0.1',
      currency: 'NANO',
      state: '',
    })

    expect(response).toMatchInlineSnapshot(`
      Object {
        "config": Object {
          "baseURL": "https://accept-nano-demo.put.io/api",
          "data": FormData {},
          "headers": Object {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          "maxBodyLength": -1,
          "maxContentLength": -1,
          "method": "post",
          "timeout": 3000,
          "transformRequest": Array [
            [Function],
          ],
          "transformResponse": Array [
            [Function],
          ],
          "url": "/pay",
          "validateStatus": [Function],
          "xsrfCookieName": "XSRF-TOKEN",
          "xsrfHeaderName": "X-XSRF-TOKEN",
        },
        "data": Object {
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
        "headers": undefined,
        "request": Object {
          "responseUrl": "/pay",
        },
        "status": 200,
      }
    `)
  })

  it('fetches the payment info with correctly constructed request', async () => {
    mock
      .onGet(`${mockBaseURL}/verify`, {
        params: { token: mockAcceptNanoPayment.token },
      })
      .reply(200, mockAcceptNanoPayment)

    const response = await api.fetchPayment(mockAcceptNanoPayment.token)

    expect(response).toMatchInlineSnapshot(`
      Object {
        "config": Object {
          "baseURL": "https://accept-nano-demo.put.io/api",
          "data": undefined,
          "headers": Object {
            "Accept": "application/json, text/plain, */*",
          },
          "maxBodyLength": -1,
          "maxContentLength": -1,
          "method": "get",
          "params": Object {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
          },
          "timeout": 3000,
          "transformRequest": Array [
            [Function],
          ],
          "transformResponse": Array [
            [Function],
          ],
          "url": "/verify",
          "validateStatus": [Function],
          "xsrfCookieName": "XSRF-TOKEN",
          "xsrfHeaderName": "X-XSRF-TOKEN",
        },
        "data": Object {
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
        "headers": undefined,
        "request": Object {
          "responseUrl": "/verify",
        },
        "status": 200,
      }
    `)
  })
})
