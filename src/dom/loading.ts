import { el, setChildren } from 'redom'
import { Spinner } from 'spin.js'
import { colors } from './styles'

const spinnerConfig = {
  lines: 11,
  length: 5,
  width: 1.5,
  radius: 6,
  scale: 2,
  corners: 1,
  rotate: 0,
  direction: 1,
  speed: 1.5,
  trail: 60,
  fps: 20,
  zIndex: 2e9,
  shadow: false,
  hwaccel: false,
  color: colors.white,
  top: '20%',
  fadeColor: 'transparent',
  animation: 'spinner-line-fade-quick',
}

const containerStyle = {
  width: '100%',
  height: '100%',
}

const spinnerStyle = `
  @keyframes spinner-line-fade-quick {
    0%, 39%, 100% {
      opacity: 0.25;
    }
    40% {
      opacity: 1;
    }
  }
`

export const createLoading = () => {
  const container = el('div', { style: containerStyle })

  const styleNode = document.createElement('style')
  styleNode.innerHTML = spinnerStyle

  const spinner = new Spinner(spinnerConfig).spin()
  if (spinner.el) {
    setChildren(container, [spinner.el, styleNode])
  }

  return container
}
