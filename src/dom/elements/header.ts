import { el, setChildren } from 'redom'
import { sharedStyles, colors } from '../style'

export const createHeader = ({ onClose }: { onClose: () => void }) => {
  const header = el('div', {
    style: `
      background: ${colors.blue}!important;
      padding: 20px!important;
      height: 18px!important;
      border-top-left-radius: ${sharedStyles.mainBorderRadius}!important;
      border-top-right-radius: ${sharedStyles.mainBorderRadius}!important;
    `,
  })

  const headerTitle = el('img', {
    src:
      'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjE2IDI5LjQiPjxzdHlsZT4uc3Qwe2ZpbGw6I2VhODgxZn0uc3Qxe2ZpbGw6I2ZmZn08L3N0eWxlPjx0aXRsZT5sb2dvPC90aXRsZT48Y2lyY2xlIGNsYXNzPSJzdDAiIGN4PSI0LjgiIGN5PSIyNC40IiByPSI0LjgiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNNjIgLjZjLTIuNiAwLTQuOCAyLjEtNC44IDQuOCAwIDMuOC0uNiA0LjgtNC44IDQuOEg1MmMtMi40LjItNC4zIDIuMi00LjMgNC43di4xYzAgMy43LS43IDQuNi00LjggNC42LS4yIDAtLjQgMC0uNS4xLTIuNC4zLTQuMyAyLjMtNC4zIDQuNyAwIDIuNiAyLjEgNC44IDQuOCA0LjggMi41IDAgNC42LTIgNC43LTQuNHYtLjRjMC0zLjQgMS4xLTQuNyA0LjctNC44aC4xYzIuNSAwIDQuNi0yIDQuNy00LjV2LS4zYzAtMy41IDEuMS00LjggNC44LTQuOCAyLjYgMCA0LjgtMi4xIDQuOC00LjggMC0yLjUtMi4xLTQuNi00LjctNC42ek0zMy44IDEwLjJoLS40Yy00LjIgMC00LjgtMS00LjgtNC44IDAtMi42LTIuMS00LjgtNC44LTQuOEMyMS4yLjYgMTkgMi43IDE5IDUuNGMwIDMuOC0uNiA0LjctNC44IDQuN2gtLjRjLTIuNC4yLTQuMyAyLjItNC4zIDQuNyAwIDIuNiAyLjEgNC44IDQuOCA0LjggMi41IDAgNC42LTIgNC43LTQuNHYtLjNjMC0zLjUgMS4xLTQuOCA0LjgtNC44IDMuNyAwIDQuOCAxLjMgNC44IDQuNyAwIDIuNiAyLjEgNC44IDQuOCA0LjhzNC44LTIuMSA0LjgtNC44Yy0uMS0yLjQtMi00LjQtNC40LTQuNnoiLz48Zz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNMTM0LjcgMS42Yy0uMS0uMy0uMy0uNS0uNS0uNi0uMy0uMi0uNS0uMi0uOC0uMi0uNiAwLTEuMS4zLTEuMy45bC0xMS43IDI2LjJjLS4xLjEtLjEuMy0uMS40IDAgLjMuMS42LjMuOC4yLjIuNS4zLjguMy41IDAgLjktLjMgMS4xLS44bDMuMS03aDE1LjVsMyA3Yy4xLjIuMy40LjUuNi4yLjEuNC4yLjYuMi4zIDAgLjYtLjEuOC0uMy4yLS4yLjQtLjQuNC0uNyAwLS4yIDAtLjMtLjEtLjVMMTM0LjcgMS42em0tOC4yIDE3LjlMMTMzLjMgNGw2LjggMTUuNWgtMTMuNnpNMTA5LjMuOGMtLjMgMC0uNi4xLS44LjQtLjIuMi0uMy41LS4zLjlWMjVMOTAuNyAxLjRjLS4zLS40LS42LS42LTEtLjZzLS43LjEtLjkuNGMtLjIuMi0uMy41LS4zLjl2MjZjMCAuNC4xLjcuMy45LjIuMi41LjMuOS4zLjMgMCAuNi0uMS44LS40LjItLjIuMy0uNS4zLS45VjUuMmwxNy41IDIzLjZjLjMuNC43LjYgMS4xLjYuNCAwIC43LS4xLjktLjQuMi0uMi4zLS41LjMtLjl2LTI2YzAtLjQtLjEtLjctLjMtLjktLjMtLjMtLjYtLjQtMS0uNHptNjcuNyAwYy0uMyAwLS42LjEtLjguNC0uMi4yLS4zLjUtLjMuOVYyNUwxNTguNCAxLjRjLS4zLS40LS42LS42LTEtLjZzLS43LjEtLjkuNGMtLjIuMi0uMy41LS4zLjl2MjZjMCAuNC4xLjcuMy45LjIuMi41LjMuOS4zLjMgMCAuNi0uMS44LS40LjItLjIuMy0uNS4zLS45VjUuMkwxNzYgMjguOGMuMy40LjcuNiAxLjEuNi40IDAgLjctLjEuOS0uNC4yLS4yLjMtLjUuMy0uOXYtMjZjMC0uNC0uMS0uNy0uMy0uOS0uMy0uMy0uNi0uNC0xLS40em0yNC4zLS44Yy04LjEgMC0xNC43IDYuNi0xNC43IDE0LjdzNi42IDE0LjcgMTQuNyAxNC43UzIxNiAyMi44IDIxNiAxNC43IDIwOS40IDAgMjAxLjMgMHptMCAyN2MtNi44IDAtMTIuMy01LjUtMTIuMy0xMi4zczUuNS0xMi4zIDEyLjMtMTIuMyAxMi4zIDUuNSAxMi4zIDEyLjNTMjA4LjEgMjcgMjAxLjMgMjd6Ii8+PC9nPjwvc3ZnPg==',
    style: `
      width: 120px!important;
      height: 16px!important;
      float: left!important;
    `,
  })

  const headerCloseButton = el(
    'button',
    {
      style: `
        font-size: 16px!important;
        color: ${colors.lightGray}!important;
        background: transparent!important;
        padding: 0!important;
        margin: 0!important;
        border: none!important;
        outline: none!important;
        cursor: pointer!important;
        float: right!important;
      `,
      onclick: onClose,
    },
    'X',
  )

  setChildren(header, [headerTitle, headerCloseButton])

  return header
}
