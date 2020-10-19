import { el } from 'redom'
import { colors } from '../style'

const statusBarStyle = `
  color: white!important;
  background: ${colors.navy}!important;
  font-size: 12px!important;
  padding: 8px!important;
`

export const createStatusBar = () =>
  el('div', { style: statusBarStyle }, 'Starting...')
