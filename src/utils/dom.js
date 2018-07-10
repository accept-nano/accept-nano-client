import { el, setChildren, mount } from 'redom'

class Dom {
  constructor() {
    this.container = el('div', {
      style: {
        background: 'rgba(0, 0, 0, 0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 120391023182312,
      }
    })

    this.content = el('div', {
      style: {
        background: 'white',
        borderRadius: 6,
        width: 300,
        height: 600,
      }
    })
  }

  mount(targetElement) {
    mount(targetElement, this.container)
  }

  showLoading() {
    const loading = el('span', 'Loading')
    setChildren(this.container, loading)
  }

  showPaymentInfo(data) {
    const { account, amount } = data
    const paymentInfo = el('div', `${account} - ${amount}`)
    setChildren(this.content, paymentInfo)
    setChildren(this.container, this.content)
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

