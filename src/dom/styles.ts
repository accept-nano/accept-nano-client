export const colors = {
  blue: '#0b6cdc',
  navy: '#000134',
  green: '#06af76',
  red: '#B03738',
} as const

export const sharedStyles = {
  mainBorderRadius: '6px',
  actionButton: `
    border: none!important;
    outline: none!important;
    border-radius: 6px!important;
    font-size: 16px!important;
    padding: 12px 24px!important;
    font-weight: bold!important;
    color: white!important;
    margin: 20px!important;
    box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08)!important;
    cursor: pointer!important;
    text-transform: uppercase!important;
    letter-spacing: 0.5!important;
  `,
  titleHeader: `
    margin: 20px 0!important;
    font-size: 24px!important;
    color: black!important;
  `,
  messageBody: `
    color: black!important;
    margin: initial!important;
    padding: initial!important;
  `,
  infoHeader: `
    text-transform: uppercase!important;
    color: #000134!important;
    margin-top: 20px!important;
    margin-bottom: 5px!important;
    font-size: 13px!important;
  `,
  infoText: `
    word-wrap: break-word!important;
    margin-top: 0!important;
    font-size: 14px!important;
    color: #424754!important;
  `,
} as const

export const containerStyle = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
  background: rgba(32, 36, 47, 0.8)!important;
  position: fixed!important;
  top: 0!important;
  left: 0!important;
  width: 100%!important;
  height: 100%!important;
  z-index: 999999999999999!important;
  overflow: scroll!important;
`

export const bodyStyle = `
  position: absolute!important;
  margin: 5% 0!important;
  background: #F8F8F8!important;
  width: 360px!important;
  height: auto!important;
  text-align: center!important;
  border-radius: ${sharedStyles.mainBorderRadius}!important;
  box-shadow: 0 2px 32px 0 rgba(0, 0, 0, 0.85)!important;
  top: 20%!important;
  left: 50%!important;
  transform: translate(-50%, -20%)!important;
`

export const statusBarStyle = `
  color: white!important;
  background: ${colors.navy}!important;
  font-size: 12px!important;
  padding: 8px!important;
`

export const contentStyle = `
  padding: 20px 30px!important;
`
