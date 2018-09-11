# accept-nano-client

[![Build Status](https://travis-ci.org/accept-nano/accept-nano-client.svg?branch=master)](https://travis-ci.org/accept-nano/accept-nano-client)

Payment gateway for [NANO](https://nano.org)

*accept-nano-client* is a JavaScript library that helps you to communicate with [accept-nano](https://github.com/accept-nano/accept-nano) server for receiving NANO payments easily.

Cross-browser compatibility is tested with [BrowserStack](https://browserstack.com), thanks to their sponsorship.

## Installing
*accept-nano-client* is pushed to npm on each tagged build, so you can easily include it by inserting a script tag into your <HEAD> part of the HTML page, like this:

```HTML
<html>
    <head>
        ...
        <script src="https://unpkg.com/@accept-nano/client"></script>
    </head>
    ...
</html>
```

## Usage
After the *accept-nano-client* script is loaded there will be a global variable called *acceptNano*, which is an instance of our primary AcceptNano class and will be used for communicating your server, starting and controlling payment sessions.

### Setting up the Client
Before initiating the payment process, you **must** configure the *acceptNano* instance by using the following method and parameters:
```JS
window.acceptNano.setup({
    apiURL: 'api.myAcceptNanoServer.com', // URL of your Accept NANO server (String, required)
    debug: false, // used for enabling debug mode, (Bool, non-required, false by default)
    pollInterval: 1500, // time period (ms) to check for verification of the payment sessions (Number, non-required, 1500 by default)
})
```

### Initiating Payment Session
After you configure the acceptNano instance, you can initiate a payment session by using the following:
```JS
window.acceptNano.startPayment({
    data: {
        amount: '10' // (String, required)
        currency: 'USD' // (String, required, 'USD' or 'nano')
        state: '{userId:7}' // State to share between client and server, (String, non-required)
    },
    onStart: (paymentData) => {} // Function, fired when the payment session starts
    onSuccess: (paymentData) => {} // Function, fired when the payment session completed succesfully
    onFailure: (failureReason) => {} // Function, fired when the payment session fails
    onCancel: () => {} // Function, fired when the payment session is cancelled by the user
})
```

## Contributing
 - Please open an issue if you have a question or suggestion.
 - Don't create a PR before discussing it first.

## Who is using *accept-nano-client* in production?
 - [Put.io](https://put.io)
