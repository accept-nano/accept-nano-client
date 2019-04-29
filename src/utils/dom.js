import { el, setStyle, setChildren, mount, unmount } from 'redom'
import { Spinner } from 'spin.js'
import QRCode from 'qrcode'
import Big from 'big.js';

const multNANO = Big('1000000000000000000000000000000');

class DOM {
  constructor({ onClose }) {
    this.onClose = onClose

    this.container = el('div', {
      id: 'accept-nano',
      style: `
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        background: rgba(32, 36, 47, 0.8)!important;
        position: fixed!important;
        top: 0!important;
        left: 0!important;
        width: 100%!important;
        height: 100%!important;
        z-index: 999999999999999!important;
        overflow: scroll!important;
      `
    })

    this.main = el('div', {
      style: `
        position: absolute!important;
        margin: 5% 0!important;
        background: #F8F8F8!important;
        width: 360px!important;
        height: auto!important;
        text-align: center!important;
        border-radius: ${DOM.sharedStyles.mainBorderRadius}!important;
        box-shadow: 0 2px 32px 0 rgba(0, 0, 0, 0.85)!important;
        top: 20%!important;
        left: 50%!important;
        transform: translate(-50%, -20%)!important;
      `
    })

    this.statusBar = el('div', {
      style: `
        color: white!important;
        background: ${DOM.colors.navy}!important;
        font-size: 12px!important;
        padding: 8px!important;
      `
    }, 'Starting...')


    this.content = el('div', {
      style: `
        padding: 20px 30px!important;
      `,
    })

    this.createHeader()
    this.createFooter()

    setChildren(this.main, [
      this.header,
      this.statusBar,
      this.content,
      this.footer,
    ])
  }

  createHeader() {
    this.header = el('div', {
      style: `
        background: ${DOM.colors.blue}!important;
        padding: 20px!important;
        height: 18px!important;
        border-top-left-radius:  ${DOM.sharedStyles.mainBorderRadius}!important;
        border-top-right-radius:  ${DOM.sharedStyles.mainBorderRadius}!important;
      `,
    })

    const headerTitle = el('img', {
      src: 'https://nano.org/assets/img/logo-white.svg',
      style: `
        width: 120px!important;
        height: 16px!important;
        float: left!important;
      `
    })

    const headerCloseButton = el('button', {
      style: `
        font-size: 16px!important;
        color: rgba(255, 255, 255, 0.5)!important;
        background: transparent!important;
        padding: 0!important;
        margin: 0!important;
        border: none!important;
        outline: none!important;
        cursor: pointer!important;
        float: right!important;
      `,
      onclick: this.onClose,
    }, 'X')

    setChildren(this.header, [headerTitle, headerCloseButton])
  }

  createFooter() {
    this.footer = el('div', {
      style: `
        position: absolute!important;
        bottom: -30px!important;
        right: 0!important;
        width: 100%!important;
        text-align: center!important;
        font-size: 12px!important;
        font-style: italic!important;
        color: #ccc!important;
      `,
    })

    const footerSpan = el('span', 'Powered by')

    const footerLink = el('a', {
      href: 'https://accept-nano.com',
      target: '_blank',
      style: `
        padding-left: 5px!important;
        color: #ccc!important;
      `,
    }, 'accept-nano.com')

    setChildren(this.footer, [footerSpan, footerLink])
  }

  mount() {
    mount(document.body, this.container)
  }

  unmount() {
    unmount(document.body, this.container)
  }

  showLoading() {
    const loading = el('div', {
      style: {
        width: '100%',
        height: '100%',
      }
    })

    const styles = `
       @keyframes spinner-line-fade-quick {
        0%, 39%, 100% {
          opacity: 0.25;
        }
        40% {
          opacity: 1;
        }
      }
    `

    const styleNode = document.createElement('style')
    styleNode.innerHTML = styles

    const spinner = new Spinner(DOM.sharedStyles.spinner).spin()

    setChildren(loading, [spinner.el, styleNode])
    setChildren(this.container, loading)
  }

  showPaymentInfo(data) {
    const { account, amount } = data

    const amount_raw = Big(amount).times(multNANO).toFixed().toString()

    const qrText = `nano:${account}?amount=${amount_raw}`
    const qrCanvas= el('canvas', {
      style: `
        background: white!important;
        padding: 24px!important;
        border: 1px solid #e9e9e9!important;
        border-radius: 5px!important;
      `
    })

    const accountHeader = el('h5', { style: DOM.sharedStyles.infoHeader }, 'Account Address')
    const accountText = el('p', { style: DOM.sharedStyles.infoText }, account)

    const amountHeader = el('h5', { style: DOM.sharedStyles.infoHeader }, 'Amount')
    const amountText = el('p', { style: DOM.sharedStyles.infoText }, `${amount} NANO`)

    const paymentInfo = el('div', [accountHeader, accountText, amountHeader, amountText])

    QRCode.toCanvas(qrCanvas, qrText, (error) => {
      if (error) {
        console.error(error)
      }

      setChildren(this.content, [qrCanvas, paymentInfo])
      setChildren(this.container, this.main)
    })
  }

  updateTime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    const display = [
      h,
      m > 9 ? m : (h ? '0' + m : m || '0'),
      s > 9 ? s : '0' + s,
    ].filter(a => a).join(':')

    this.statusBar.textContent = `Waiting For Payment (${display})`
  }

  showPaymentSucceededMessage(data) {
    const title = el('h2', { style: DOM.sharedStyles.titleHeader }, 'Thank you')
    const message = el('p', { style: DOM.sharedStyles.messageBody }, `We've successfully received your payment.`)

    const button = el('button', {
      style: `
        ${DOM.sharedStyles.actionButton}
        background: ${DOM.colors.green}!important;
      `,
      onclick: this.onClose,
    }, 'Done')

    this.statusBar.textContent = 'Success'
    setStyle(this.statusBar, { background: DOM.colors.green })
    setChildren(this.content, [title, message, button])
    setChildren(this.container, this.main)
  }

  showPaymentFailureMessage(error) {
    const title = el('h2', { style: DOM.sharedStyles.titleHeader }, 'Oops!')
    const message = el('p', { style: DOM.sharedStyles.messageBody }, `An error occurred: ${error}`)

    const button = el('button', {
      style: `
        ${DOM.sharedStyles.actionButton}
        background: ${DOM.colors.red}!important;
      `,
      onclick: this.onClose,
    }, 'Close')

    this.statusBar.textContent = 'Error!'
    setStyle(this.statusBar, { background: DOM.colors.red})
    setChildren(this.content, [title, message, button])
    setChildren(this.container, this.main)
  }
}

DOM.colors = {
  blue: '#0b6cdc',
  navy: '#000134',
  green: '#06af76',
  red: '#B03738',
}

DOM.sharedStyles = {
  mainBorderRadius: '6px',
  actionButton: `
    border: none!important;
    outline: none!important;
    border-radius: 6px!important;
    font-size: 16px!important;
    padding: 12px 24px!important;
    font-weight: bold!important;
    color: white!important;
    margin: 20px!important;
    box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08)!important;
    cursor: pointer!important;
    text-transform: uppercase!important;
    letter-spacing: 0.5!important;
  `,
  titleHeader: `
    margin: 20px 0!important;
    font-size: 24px!important;
    color: black!important;
  `,
  messageBody: `
    color: black!important;
    margin: initial!important;
    padding: initial!important;
  `,
  infoHeader: `
    text-transform: uppercase!important;
    color: #000134!important;
    margin-top: 20px!important;
    margin-bottom: 5px!important;
    font-size: 13px!important;
  `,
  infoText: `
    word-wrap: break-word!important;
    margin-top: 0!important;
    font-size: 14px!important;
    color: #424754!important;
  `,
  spinner: {
    lines: 11,
    length: 5,
    width: 1.5,
    radius: 6,
    scale: 2,
    corners: 1,
    rotate: 0,
    direction: 1,
    speed: 1.5,
    trail: 60,
    fps: 20,
    zIndex: 2e9,
    shadow: false,
    hwaccel: false,
    color: '#ffffff',
    top: '20%',
    fadeColor: 'transparent',
    animation: 'spinner-line-fade-quick',
  },
}

export default DOM

