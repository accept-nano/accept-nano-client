import { el, setStyle, setChildren, mount, unmount } from 'redom'
import { Spinner } from 'spin.js'
import QRCode from 'qrcode'

class DOM {
  constructor(target, onClose) {
    this.target = target || document.body
    this.onClose = onClose

    this.container = el('div', {
      id: 'accept-nano',
      style: {
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
        background: 'rgba(32, 36, 47, 0.8)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 999999999999999,
        overflow: 'scroll',
      }
    })

    this.main = el('div', {
      style: {
        position: 'absolute',
        margin: '5% 0',
        background: '#F8F8F8',
        width: 360,
        height: 'auto',
        textAlign: 'center',
        borderRadius: DOM.sharedStyles.mainBorderRadius,
        boxShadow: '0 2px 32px 0 rgba(0, 0, 0, 0.85)',
      }
    })

    this.statusBar = el('div', {
      style: {
        color: 'white',
        background: DOM.colors.navy,
        fontSize: 12,
        padding: 8,
      }
    }, 'Waiting for Payment...')


    this.content = el('div', {
      style: {
        padding: '20px 30px',
      },
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
      style: {
        background: DOM.colors.blue,
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius:  DOM.sharedStyles.mainBorderRadius,
        borderTopRightRadius:  DOM.sharedStyles.mainBorderRadius,
      },
    })

    const headerTitle = el('img', {
      src: 'https://nano.org/assets/img/logo-white.svg',
      style: {
        maxWidth: 120,
        height: 'auto',
      }
    })

    const headerCloseButton = el('button', {
      style: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
        background: 'transparent',
        padding: 0,
        margin: 0,
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
      },
      onclick: this.onClose,
    }, 'X')

    setChildren(this.header, [headerTitle, headerCloseButton])
  }

  createFooter() {
    this.footer = el('div', {
      style: {
        position: 'absolute',
        bottom: -30,
        right: 0,
        width: '100%',
        textAlign: 'center',
        fontSize: 12,
        fontStyle: 'italic',
        color: '#ccc',
      },
    })

    const footerSpan = el('span', 'Powered by')

    const footerLink = el('a', {
      href: 'https://accept-nano.com',
      target: '_blank',
      style: {
        paddingLeft: 5,
        color: '#ccc',
      },
    }, 'accept-nano.com')

    setChildren(this.footer, [footerSpan, footerLink])
  }

  mount() {
    mount(this.target, this.container)
  }

  unmount() {
    unmount(this.target, this.container)
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

    const accountHeader = el('h5', { style: DOM.sharedStyles.infoHeader }, 'Wallet Address')
    const accountText = el('p', { style: DOM.sharedStyles.infoText }, account)

    const amountHeader = el('h5', { style: DOM.sharedStyles.infoHeader }, 'Amount')
    const amountText = el('p', { style: DOM.sharedStyles.infoText }, `${amount} NANO`)

    const paymentInfo = el('div', [accountHeader, accountText, amountHeader, amountText])

    const qrText = `xrb:${account}?amount=${amount}`
    const qrCanvas= el('canvas', {
      style: {
        background: 'white',
        padding: 24,
        border: '1px solid #e9e9e9',
        borderRadius: '5px',
      }
    })

    QRCode.toCanvas(qrCanvas, qrText, (error) => {
      if (error) {
        console.error(error)
      }

      setChildren(this.content, [qrCanvas, paymentInfo])
      setChildren(this.container, this.main)
    })
  }

  showPaymentSucceededMessage(data) {
    const title = el('h2', 'Thank You!')
    const message = el('p', `We've successfully received your payment.`)

    const button = el('button', {
      style: Object.assign({}, DOM.sharedStyles.actionButton, {
        background: DOM.colors.green,
      }),
      onclick: this.onClose,
    }, 'Done')

    this.statusBar.textContent = 'Success'
    setStyle(this.statusBar, { background: DOM.colors.green })
    setChildren(this.content, [title, message, button])
  }

  showPaymentFailureMessage(error) {
    const title = el('h2', 'Oops!')
    const message = el('p', `An error occurred: ${error}`)

    const button = el('button', {
      style: Object.assign({}, DOM.sharedStyles.actionButton, {
        background: DOM.colors.red,
      }),
      onclick: this.onClose,
    }, 'Close')

    this.statusBar.textContent = 'Error!'
    setStyle(this.statusBar, { background: DOM.colors.red})
    setChildren(this.content, [title, message, button])
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
  actionButton: {
    border: 'none',
    outline: 'none',
    borderRadius: '6px',
    fontSize: 16,
    padding: '12px 24px',
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
    margin: 20,
    boxShadow: '0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08)',
    cursor: 'pointer',
    letterSpacing: 0.5,
  },
  infoHeader: {
    textTransform: 'uppercase',
    color: '#000134',
    marginBottom: 5,
  },
  infoText: {
    wordWrap: 'break-word',
    marginTop: 0,
    fontSize: 14,
    color: '#424754',
  },
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

