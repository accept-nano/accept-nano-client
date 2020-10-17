# accept-nano-client

[![Build Status](https://travis-ci.org/accept-nano/accept-nano-client.svg?branch=master)](https://travis-ci.org/accept-nano/accept-nano-client)

Payment gateway for [NANO](https://nano.org)

_accept-nano-client_ is a JavaScript library that helps you to communicate with [accept-nano](https://github.com/accept-nano/accept-nano) server for receiving NANO payments easily.

Cross-browser compatibility is tested with [BrowserStack](https://browserstack.com), thanks to their sponsorship.

## Usage

### Installation

#### As an NPM Package

```bash
npm install accept-nano-client
```

```bash
yarn add accept-nano-client
```

#### Directly in Browser, via UMD

```HTML
<html>
  <head>
    ...
    <script src="https://unpkg.com/@accept-nano/client"></script>
  </head>
  ...
</html>
```

After the _accept-nano-client_ script is loaded there will be a global variable called _acceptNano_, which you can access as `window.acceptNano`.

### Creating a Payment Session

To be able to initiate the payment process, you **must create a new payment session.**

```ts
const session = acceptNano.createSession({
  apiURL: 'api.myAcceptNanoServer.com',
  pollInterval: 1500,
})

// You can also register your event listeners to continue the flow based on session events.
session.on('start', () => { ... })
session.on('success', (payment: AcceptNanoPayment) => { ... })
session.on('failure', (reason: AcceptNanoPaymentFailureReason) => { ... })
```

### Presenting the Payment Overlay

After creating your session and attaching the event listeners, you can follow one of the given options to proceed with your payment flow.

#### Option 1: Create a Payment Through Client

If you want to create and verify an _accept-nano_ payment in your client application, you can use this option to create and verify a payment on client.

```ts
session.createPayment({
  amount: '1',
  currenct: 'USD',
  state: '{userId:7}',
})
```

#### Option 2: Verify a Payment Through Client

If you create an _accept-nano_ payment from another source (such as your application's backend), you can use this option to perform the verification on client.

```ts
session.verifyPayment('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
```

## Contributing

- Please open an issue if you have a question or suggestion.
- Don't create a PR before discussing it first.

## Who is using _accept-nano-client_ in production?

- [Put.io](https://put.io)
- [My Nano Ninja](https://mynano.ninja)
