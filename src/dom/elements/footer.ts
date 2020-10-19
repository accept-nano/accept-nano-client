import { el, setChildren } from 'redom'

export const createFooter = () => {
  const footer = el('div', {
    style: `
      position: absolute!important;
      bottom: -30px!important;
      right: 0!important;
      width: 100%!important;
      text-align: center!important;
      font-size: 12px!important;
      font-style: italic!important;
      color: #ccc!important;
    `,
  })

  const footerSpan = el('span', 'Powered by')

  const footerLink = el(
    'a',
    {
      href: 'https://accept-nano.com',
      target: '_blank',
      style: `
      padding-left: 5px!important;
      color: #ccc!important;
    `,
    },
    'accept-nano.com',
  )

  setChildren(footer, [footerSpan, footerLink])

  return footer
}
