import { el } from 'redom'
import { sharedStyles, colors } from '../style'

export const createSuccessScene = ({ onClose }: { onClose: () => void }) => {
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
      onclick: onClose,
    },
    'Done',
  )

  return el('div', [title, message, button])
}
