import Api from './utils/api'
import DOM from './utils/dom'

class AcceptNano {
  constructor() {
    this.onClose = this.onClose.bind(this)
  }

  setup(options = {}) {
    this.options = Object.assign({}, AcceptNano.DEFAULT_OPTIONS, options)
    this.api = new Api(this.options.url)
    this.dom = new DOM(this.options.target, this.onClose)
    this.reset()

    return this
  }

  reset() {
    this.onStart = null
    this.onSuccess = null
    this.onFailure = null
    this.state = AcceptNano.STATES.UNINITIALIZED
    this.shouldVerify = true
  }

  startPayment({ data, onStart, onSuccess, onFailure }) {
    this.log('Payment Starting', data)

    this.dom.mount()
    this.dom.showLoading()
    this.state = AcceptNano.STATES.STARTING

    this.onStart = onStart
    this.onSuccess = onSuccess
    this.onFailure = onFailure

    this.api.pay(data)
      .then(({ data }) => {
        this.state = AcceptNano.STATES.STARTED

        if (typeof this.onStart === 'function') {
          this.onStart(data)
        }

        this.dom.showPaymentInfo(data)
        this.verifyPayment(data.token)
      })
      .catch((error) => {
        this.onPaymentFailed(error)
      })
  }

  verifyPayment(token) {
    this.log('Payment Verifying', { token })

    this.api.verify(token)
      .then(({ data }) => {
        if (data.fulfilled) {
          return this.onPaymentSucceeded(data)
        }

        if (this.shouldVerify) {
          return setTimeout(() => this.verifyPayment(token), this.options.pollInterval)
        }
      })
      .catch((error) => {
        this.onPaymentFailed(error)
      })
  }

  onPaymentSucceeded(data) {
    this.log('Payment Succeeded', data)

    this.state = AcceptNano.STATES.SUCCEEDED
    this.dom.showPaymentSucceededMessage(data)

    if (typeof this.onSuccess === 'function') {
      this.onSuccess(data)
    }
  }

  onPaymentFailed(error) {
    this.log('Payment Failed', error)

    this.state = AcceptNano.STATES.FAILED
    this.dom.showPaymentFailureMessage(error)

    if (typeof this.onFailure === 'function') {
      this.onFailure(error)
    }
  }

  onClose() {
    if (this.state === AcceptNano.STATES.STARTED) {
      this.shouldVerify = false
    }

    this.reset()
    this.dom.unmount()
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
  target: null,
  url: null,
}

AcceptNano.STATES = {
  UNINITIALIZED: 0,
  STARTING: 1,
  STARTED: 2,
  SUCCEEDED: 3,
  FAILED: 4,
}

window.acceptNano = new AcceptNano()

