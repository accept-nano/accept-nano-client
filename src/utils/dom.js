import { el, setChildren, mount } from 'redom'
import QRCode from 'qrcode'

class Dom {
  constructor() {
    this.body = el('div', {
      style: {
        background: 'rgba(0, 0, 0, 0.75)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999999999999999,
        paddingTop: '5%',
      }
    })

    this.main = el('div', {
      style: {
        position: 'relative',
        background: 'white',
        width: 320,
        height: 400,
        padding: 20,
        textAlign: 'center',
      }
    })

    const header = el('h3', 'Accept Nano')

    const footer = el('span', {
      style: {
        position: 'absolute',
        bottom: 20,
        right: 0,
        width: '100%',
        textAlign: 'center',
      },
    }, 'accept-nano.com')

    this.content = el('div')

    setChildren(this.main, [
      header,
      this.content,
      footer,
    ])
  }

  mount(targetElement) {
    mount(targetElement, this.body)
  }

  showLoading() {
    const loading = el('span', 'Loading')
    setChildren(this.body, loading)
  }

  showPaymentInfo(data) {
    const { account, amount } = data

    const accountText = el('p', {
      style: {
        wordWrap: 'break-word',
      },
    }, account)
    const amountText = el('p', amount)
    const paymentInfo = el('div', [accountText, amountText])

    const qrText = `xrb:${account}?amount=${amount}`
    const qrCanvas= el('canvas')

    QRCode.toCanvas(qrCanvas, qrText, (error) => {
      if (error) {
        console.error(error)
      }

      setChildren(this.content, [qrCanvas, paymentInfo])
      setChildren(this.body, this.main)
    })
  }

  showPaymentSucceededMessage(data) {
    const message = el('div', 'Completed!')
    setChildren(this.content, message)
  }

  showPaymentFailureMessage(error) {
    const message = el('div', error)
    setChildren(this.content, message)
  }
}

export default Dom

