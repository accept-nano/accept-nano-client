import { el, setChildren, mount, unmount, setStyle } from 'redom'
import { EventEmitter } from '@byungi/event-emitter'
import { AcceptNanoPayment, AcceptNanoPaymentFailureReason } from '../types'
import {
  containerStyle,
  bodyStyle,
  statusBarStyle,
  contentStyle,
  colors,
} from './styles'
import { createHeader } from './elements/header'
import { createFooter } from './elements/footer'
import { createLoadingScene } from './scenes/loading'
import { createPaymentScene } from './scenes/payment'
import { createSuccessScene } from './scenes/success'
import { createFailureScene } from './scenes/failure'
import { formatSeconds } from '../utils'

type DOMEvents = { close: () => void }
type DOMScene = 'loading' | 'payment' | 'success' | 'failure'

export const createDOM = () => {
  let scene: DOMScene = 'loading'

  const eventEmitter = new EventEmitter<DOMEvents>()
  const handleCloseButtonClick = () => eventEmitter.emit('close')

  const container = el('div', { id: 'accept-nano', style: containerStyle })
  const main = el('div', { id: 'accept-nano-body', style: bodyStyle })
  const header = createHeader({ onClose: handleCloseButtonClick })
  const statusBar = el('div', { style: statusBarStyle }, 'Starting...')
  const content = el('div', { style: contentStyle })
  const footer = createFooter()
  setChildren(main, [header, statusBar, content, footer])

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
    on: eventEmitter.once.bind(eventEmitter),

    mount: () => mount(document.body, container),
    unmount: () => {
      clearCountdownInterval() // @TODO: centralise, preferably within the state machine
      unmount(document.body, container)
    },

    renderLoading: () => {
      scene = 'loading'
      setChildren(container, [createLoadingScene()])
    },

    renderPayment: (payment: AcceptNanoPayment) => {
      // @TODO: maybe create a new state machine for this?
      if (scene === 'payment') return
      scene = 'payment'
      // -------- //

      createPaymentScene(payment).then(paymentScene => {
        startCoundownInterval(payment.remainingSeconds) // @TODO: move to state machine
        setChildren(content, [paymentScene])
        setChildren(container, [main])
      })
    },

    renderSuccess: () => {
      // @TODO: maybe create a new state machine for this?
      if (scene === 'success') return
      scene = 'success'

      clearCountdownInterval() // @TODO: centralise, preferably within the state machine
      // -------- //

      // configure statusBar
      statusBar.textContent = 'Success'
      setStyle(statusBar, { background: colors.green })

      // configure content
      setChildren(content, [
        createSuccessScene({
          onClose: handleCloseButtonClick,
        }),
      ])

      // configure container
      setChildren(container, [main])
    },

    renderFailure: (reason: AcceptNanoPaymentFailureReason) => {
      // @TODO: maybe create a new state machine for this?
      if (scene === 'failure') return
      scene = 'failure'

      clearCountdownInterval() // @TODO: centralise, preferably within the state machine
      // -------- //

      // configure statusBar
      statusBar.textContent = 'Error!'
      setStyle(statusBar, { background: colors.red })

      // configure content
      setChildren(content, [
        createFailureScene({
          reason,
          onClose: handleCloseButtonClick,
        }),
      ])

      // configure container
      setChildren(container, [main])
    },
  }
}

export type DOM = ReturnType<typeof createDOM>
