import { el } from 'redom'
import { AcceptNanoPaymentFailureReason } from '../../types'
import { sharedStyles, colors } from '../styles'

export const createFailureScene = ({
  reason,
  onClose,
}: {
  reason: AcceptNanoPaymentFailureReason
  onClose: () => void
}) => {
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
      onclick: onClose,
    },
    'Close',
  )

  return el('div', [title, message, button])
}
