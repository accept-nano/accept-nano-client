import { el, setChildren } from 'redom'
import { Spinner } from 'spin.js'

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
  color: '#ffffff',
  top: '20%',
  fadeColor: 'transparent',
  animation: 'spinner-line-fade-quick',
}

export const createLoading = () => {
  const loading = el('div', {
    style: {
      width: '100%',
      height: '100%',
    },
  })

  const styles = `
     @keyframes spinner-line-fade-quick {
      0%, 39%, 100% {
        opacity: 0.25;
      }
      40% {
        opacity: 1;
      }
    }
  `

  const styleNode = document.createElement('style')
  styleNode.innerHTML = styles

  const spinner = new Spinner(spinnerConfig).spin()

  if (spinner.el) {
    setChildren(loading, [spinner.el, styleNode])
  }

  return loading
}
