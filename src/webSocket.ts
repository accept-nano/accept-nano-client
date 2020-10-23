import { EventEmitter } from '@byungi/event-emitter'
import {
  AcceptNanoPayment,
  isAcceptNanoPayment,
  isVerifiedAcceptNanoPayment,
} from './types'
import { logger } from './logger'

export const createWebSocketURL = ({
  baseURL,
  paymentToken,
}: {
  baseURL: string
  paymentToken: AcceptNanoPayment['token']
}) => `${baseURL}?token=${paymentToken}`

type AcceptNanoWebSocketEvents = {
  open: () => void
  close: () => void
  error: (error: unknown) => void
  payment_updated: (payment: AcceptNanoPayment) => void
  payment_verified: (payment: AcceptNanoPayment) => void
}

export const createWebSocket = (url: string) => {
  const eventEmitter = new EventEmitter<AcceptNanoWebSocketEvents>()
  const websocket = new WebSocket(url)

  websocket.onopen = () => {
    logger.log('websocket', 'open')
    eventEmitter.emit('open')
  }

  websocket.onclose = () => {
    logger.log('websocket', 'close')
    eventEmitter.emit('close')
  }

  websocket.onerror = error => {
    logger.log('websocket', 'error', error)
    eventEmitter.emit('error', error)
  }

  websocket.onmessage = event => {
    try {
      const payload = JSON.parse(event.data)

      if (isAcceptNanoPayment(payload)) {
        return isVerifiedAcceptNanoPayment(payload)
          ? eventEmitter.emit('payment_verified', payload)
          : eventEmitter.emit('payment_updated', payload)
      }

      logger.log('websocket', 'could not cast payload to payment object', {
        event,
        payload,
      })
    } catch (error) {
      eventEmitter.emit('error', error)

      logger.log('websocket', 'could not deserialize message payload', {
        event,
        error,
      })
    }
  }

  return {
    on: eventEmitter.on.bind(eventEmitter),
    close: () => websocket.close(),
  }
}

export type AcceptNanoWebSocket = ReturnType<typeof createWebSocket>
