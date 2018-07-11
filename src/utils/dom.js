import { el, setStyle, setChildren, mount } from 'redom'
import QRCode from 'qrcode'

class Dom {
  constructor() {
    this.colors = {
      blue: '#4A91E3',
      navy: '#000134',
      green: '#06af76',
      red: '#B03738',
    }

    this.sharedStyles = {
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
    }

    // Whole Container
    this.body = el('div', {
      style: {
        fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
        background: 'rgba(32, 36, 47, 0.8)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999999999999999,
        overflow: 'scroll',
      }
    })

    // Main (Modal) Element
    this.main = el('div', {
      style: {
        position: 'absolute',
        margin: '5% 0',
        background: '#F5F5F7',
        width: 360,
        minHeight: 360,
        height: 'auto',
        textAlign: 'center',
        borderRadius: '7px',
        boxShadow: '0 2px 32px 0 rgba(0, 0, 0, 0.85)',
      }
    })

    // Header
    const header = el('div', {
      style: {
        background: this.colors.blue,
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    })

    const headerTitle = el('h1', {
      style: {
        color: 'white',
        fontSize: 18,
        margin: 0,
      }
    }, 'Accept Nano')

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
      onclick: () => console.log('Clicked Close Button'),
    }, 'X')

    setChildren(header, [headerTitle, headerCloseButton])

    // Status Bar
    this.statusBar = el('div', {
      style: {
        color: 'white',
        background: this.colors.navy,
        fontSize: 12,
        padding: 8,
      }
    }, 'Waiting for Payment...')

    // Footer
    const footer = el('span', {
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
    }, 'Powered by accept-nano.com')

    this.content = el('div', {
      style: {
        padding: '20px 30px',
      },
    })

    setChildren(this.main, [
      header,
      this.statusBar,
      this.content,
      footer,
    ])
  }

  mount(targetElement) {
    mount(targetElement, this.body)
  }

  showLoading() {
    const container = el('div', {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
      }
    })

    const spinner = el('span', 'Loading')

    setChildren(container, spinner)
    setChildren(this.body, container)
  }

  showPaymentInfo(data) {
    const { account, amount } = data

    const accountHeader = el('h5', { style: this.sharedStyles.infoHeader }, 'Wallet Address')
    const accountText = el('p', { style: this.sharedStyles.infoText }, account)

    const amountHeader = el('h5', { style: this.sharedStyles.infoHeader }, 'Amount')
    const amountText = el('p', { style: this.sharedStyles.infoText }, `${amount} nano`)

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
      setChildren(this.body, this.main)
    })
  }

  showPaymentSucceededMessage(data) {
    const title = el('h2', 'Thank You!')
    const message = el('p', `We've successfully received your payment.`)

    const button = el('button', {
      style: Object.assign({}, this.sharedStyles.actionButton, {
        background: this.colors.green,
      }),
      onclick: () => console.log('Clicked Done Button'),
    }, 'Done!')

    this.statusBar.textContent = 'Success!'
    setStyle(this.statusBar, { background: this.colors.green })
    setChildren(this.content, [title, message, button])
  }

  showPaymentFailureMessage(error) {
    const title = el('h2', 'Oops!')
    const message = el('p', `An error occurred: ${error}`)

    const button = el('button', {
      style: Object.assign({}, this.sharedStyles.actionButton, {
        background: this.colors.red,
      }),
      onclick: () => console.log('Clicked Close (Error) Button'),
    }, 'Close')

    this.statusBar.textContent = 'Error!'
    setStyle(this.statusBar, { background: this.colors.red})
    setChildren(this.content, [title, message, button])
  }
}

export default Dom

