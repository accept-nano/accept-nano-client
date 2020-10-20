import { el } from 'redom'
import { PaymentError } from '../../types'
import { sharedStyles, colors } from '../style'

export const createFailureScene = ({
  error,
  onClose,
}: {
  error: PaymentError
  onClose: () => void
}) => {
  const title = el('h2', { style: sharedStyles.titleHeader }, 'Oops!')

  const message = el(
    'p',
    { style: sharedStyles.messageBody },
    `An error occurred: ${error.reason}`,
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
