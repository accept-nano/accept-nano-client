import Api from './utils/api'
import DOM from './utils/dom'

class AcceptNano {
  constructor(options = {}) {
    this.options = Object.assign({}, AcceptNano.DEFAULT_OPTIONS, options)
    this.api = new Api(options.url)
    this.dom = new DOM()
  }

  startPayment(data) {
    this.log('Payment Starting', data)

    this.dom.mount(document.body)
    this.dom.showLoading()

    this.api.pay(data)
      .then((response) => {
        this.dom.showPaymentInfo(response)
        this.verifyPayment(response.token)
      })
      .catch((error) => {
        this.onPaymentFailed(error)
      })
  }

  verifyPayment(token) {
    this.log('Payment Verifying', { token })

    this.api.verify(token)
      .then((response) => {
        if (response.fulfilled) {
          return this.onPaymentSucceeded(response)
        }

        return setTimeout(() => this.verifyPayment(token), this.options.pollInterval)
      })
      .catch((error) => {
        this.onPaymentFailed(error)
      })
  }

  onPaymentSucceeded(data) {
    this.log('Payment Succeeded', data)
    this.dom.showPaymentSucceededMessage(data)
    this.options.onPaymentSucceeded(data)
  }

  onPaymentFailed(error) {
    this.log('Payment Failed', error)
    this.dom.showPaymentFailureMessage(error)
    this.options.onPaymentFailed(error)
  }

  log(message, payload = {}) {
    if (!this.options.debug) {
      return
    }

    console.log(`ACCEPT NANO -> ${message}`, payload)
  }
}

AcceptNano.DEFAULT_OPTIONS = {
  debug: true,
  pollInterval: 1500,
  onPaymentSucceeded: () => {},
  onPaymentFailed: () => {},
}

window.AcceptNano = AcceptNano

