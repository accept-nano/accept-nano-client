# accept-nano-client

[![Build Status](https://travis-ci.org/accept-nano/accept-nano-client.svg?branch=master)](https://travis-ci.org/accept-nano/accept-nano-client)
[![Coverage Status](https://coveralls.io/repos/github/accept-nano/accept-nano-client/badge.svg?branch=master)](https://coveralls.io/github/accept-nano/accept-nano-client?branch=master)
![npm (scoped)](https://img.shields.io/npm/v/@accept-nano/client)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@accept-nano/client)
![GitHub](https://img.shields.io/github/license/accept-nano/accept-nano-client)

Payment gateway for [NANO](https://nano.org)

_accept-nano-client_ is a JavaScript package that helps you to communicate with [_accept-nano_](https://github.com/accept-nano/accept-nano) for receiving NANO payments easily in your client-side applications.

## Installing

### via NPM

```bash
npm install accept-nano-client

yarn add accept-nano-client
```

### Directly in Browser, as a UMD module

After the _accept-nano-client_ script is loaded there will be a global variable called _acceptNano_, which you can access via `window.acceptNano`

```HTML
<html>
  <head>
    ...
    <script src="https://unpkg.com/@accept-nano/client@beta"></script>
  </head>
  ...
</html>
```

## Using

### Creating a Payment Session

To be able to initiate the payment process, you **must create a new payment session.**

```ts
// 1- create a new payment session
type CreateSessionParams = {
  apiHost: string // host of your Accept NANO server
  pollInterval?: number // time interval (ms) to re-check for verification of a payment (default: 3s)
  debug?: boolean // enables debug mode and prints usefull stuff to console
}

const session = acceptNano.createSession({
  apiHost: 'accept-nano-demo.put.io',
})

// 2- register event listeners to shape-up your logic based on session events.
type PaymentSessionEvents = {
  start: () => void
  end: (error: PaymentError | null, payment: AcceptNanoPayment | null) => void
}

session.on('start', () => {
  myApp.paymentStarted()
})

session.on('end', (error, payment) => {
  if (error) {
    return myApp.paymentFailed({ reason: error.reason })
  }

  return myApp.paymentSucceeded({
    amount: payment.amount,
    state: payment.state,
  })
})
```

### Presenting the Payment Overlay

After creating your session and attaching the event listeners, you can follow one of those options to proceed with the payment flow.

#### Option 1: Create a Payment Through Client

If you want to create and verify an _accept-nano_ payment in your client application, you can use this option.

After the payment is created, the client will automatically proceed to the verification step.

```ts
type CreatePaymentParams = {
  amount: string // stringified number
  currency: 'NANO' | 'USD'
  state?: string // payload to share between your client and server, will be embedded into the payment object
}

session.createPayment({
  amount: '1',
  currency: 'USD',
  state: '{userId:7}',
})
```

#### Option 2: Verify a Payment Through Client

If you create an _accept-nano_ payment in another context (such as your application's backend), you can use this option to perform the verification on the client.

```ts
type VerifyPaymentParams = {
  token: string // the payment token created in your application's backend
}

session.verifyPayment({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' })
```

## Contributing

- Please open an issue if you have a question or suggestion.
- Don't create a PR before discussing it first.

## Who is using _accept-nano-client_ in production?

- [Put.io](https://put.io)
- [My Nano Ninja](https://mynano.ninja)

Please send a PR to list your site if _accept-nano_ is helping you to receive NANO payments.

## Sponsors

[![Browserstack](http://wallpapers-for-ipad.com/fullpage/imgs3/logos/browserstack3.png)](http://www.browserstack.com/)

Cross-browser compatibility is tested with [BrowserStack](https://browserstack.com), thanks for [supporting open source](https://www.browserstack.com/open-source) ❤️️
