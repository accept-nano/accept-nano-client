import { el, setChildren, mount, unmount, setStyle } from 'redom'
import eventEmitter from 'event-emitter'
import { AcceptNanoPayment, PaymentFailureReason } from '../types'
import {
  containerStyle,
  bodyStyle,
  statusBarStyle,
  contentStyle,
  sharedStyles,
  colors,
} from './styles'
import { createHeader } from './header'
import { createFooter } from './footer'
import { createLoading } from './loading'
import { createPayment } from './payment'
import { formatSeconds } from '../utils'

export const createDOM = () => {
  const { on, once, emit } = eventEmitter()
  const handleClose = () => emit('CLOSE')

  const container = el('div', { id: 'accept-nano', style: containerStyle })
  const main = el('div', { id: 'accept-nano-body', style: bodyStyle })
  const header = createHeader({ onClose: handleClose })
  const statusBar = el('div', { style: statusBarStyle }, 'Starting...')
  const content = el('div', { style: contentStyle })
  const footer = createFooter()
  setChildren(main, [header, statusBar, content, footer])

  // countdown
  let countdownSeconds = 0
  let countdownInterval: any = undefined
  const startCoundownInterval = (seconds: number) => {
    countdownSeconds = seconds
    countdownInterval = setInterval(() => {
      countdownSeconds = countdownSeconds - 1
      statusBar.textContent = `Waiting For Payment (${formatSeconds(
        countdownSeconds,
      )})`
    }, 1000)
  }
  const clearCountdownInterval = () => {
    clearInterval(countdownInterval)
  }

  return {
    on,
    once,

    mount: () => mount(document.body, container),
    unmount: () => {
      // @TODO: centralise
      clearCountdownInterval()
      unmount(document.body, container)
    },

    renderLoading: () => {
      const loading = createLoading()
      setChildren(container, [loading])
    },

    renderPayment: (payment: AcceptNanoPayment) => {
      createPayment(payment).then(paymentElement => {
        startCoundownInterval(payment.remainingSeconds)
        setChildren(content, [paymentElement])
        setChildren(container, [main])
      })
    },

    renderSuccess: () => {
      // @TODO: centralise
      clearCountdownInterval()

      const title = el('h2', { style: sharedStyles.titleHeader }, 'Thank you')
      const message = el(
        'p',
        { style: sharedStyles.messageBody },
        `We've successfully received your payment.`,
      )
      const button = el(
        'button',
        {
          style: `
          ${sharedStyles.actionButton}
          background: ${colors.green}!important;
        `,
          onclick: handleClose,
        },
        'Done',
      )

      statusBar.textContent = 'Success'
      setStyle(statusBar, { background: colors.green })

      setChildren(content, [title, message, button])
      setChildren(container, [main])
    },

    renderFailure: (reason: PaymentFailureReason) => {
      // @TODO: centralise
      clearCountdownInterval()

      const title = el('h2', { style: sharedStyles.titleHeader }, 'Oops!')
      const message = el(
        'p',
        { style: sharedStyles.messageBody },
        `An error occurred: ${reason.type}`,
      )
      const button = el(
        'button',
        {
          style: `
          ${sharedStyles.actionButton}
          background: ${colors.red}!important;
        `,
          onclick: handleClose,
        },
        'Close',
      )

      statusBar.textContent = 'Error!'
      setStyle(statusBar, { background: colors.red })

      setChildren(content, [title, message, button])
      setChildren(container, [main])
    },
  }
}

export type DOM = ReturnType<typeof createDOM>
