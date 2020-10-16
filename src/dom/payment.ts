import { el } from 'redom'
import Big from 'big.js'
import QRCode from 'qrcode'
import { AcceptNanoPayment } from '../types'
import { sharedStyles } from './styles'

const multNANO = Big('1000000000000000000000000000000')

const createAccountElements = (account: AcceptNanoPayment['account']) => {
  const accountHeader = el(
    'h5',
    { style: sharedStyles.infoHeader },
    'Account Address',
  )
  const accountText = el('p', { style: sharedStyles.infoText }, account)
  return [accountHeader, accountText]
}

const createAmountElements = (amount: AcceptNanoPayment['amount']) => {
  const amountHeader = el('h5', { style: sharedStyles.infoHeader }, 'Amount')
  const amountText = el('p', { style: sharedStyles.infoText }, `${amount} NANO`)
  return [amountHeader, amountText]
}

const createPaymentInfo = (payment: AcceptNanoPayment) => {
  const [accountHeader, accountText] = createAccountElements(payment.account)
  const [amountHeader, amountText] = createAmountElements(payment.amount)
  return el('div', [accountHeader, accountText, amountHeader, amountText])
}

const createQRCodeElements = (payment: AcceptNanoPayment) => {
  const amount_raw = Big(payment.amount)
    .times(multNANO)
    .toFixed()
    .toString()

  const qrText = `nano:${payment.account}?amount=${amount_raw}`

  const qrCanvas = el('canvas', {
    style: `
      background: white!important;
      padding: 24px!important;
      border: 1px solid #e9e9e9!important;
      border-radius: 5px!important;
    `,
  })

  return [qrText, qrCanvas] as const
}

export const createPayment = (payment: AcceptNanoPayment) =>
  new Promise<HTMLDivElement>(resolve => {
    const paymentInfo = createPaymentInfo(payment)
    const [qrText, qrCanvas] = createQRCodeElements(payment)

    QRCode.toCanvas(qrCanvas, qrText, (error: unknown) => {
      if (error) {
        return resolve(paymentInfo)
      }

      resolve(el('div', [qrCanvas, paymentInfo]))
    })
  })
