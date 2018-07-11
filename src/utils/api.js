import axios from 'axios'

class ApiClient {
  constructor(url) {
    this.baseURL = url
  }

  pay({ amount, currency, state }) {
    const form = new FormData()

    form.append('amount', amount)
    form.append('currency', currency)
    form.append('state', state)

    return axios.post(`${this.baseURL}/pay`, form)
  }

  verify(token) {
    return axios.get(`${this.baseURL}/verify?token=${token}`)
  }
}

export default ApiClient

