// import axios from 'axios'

class ApiClient {
  constructor(url) {
    this.baseURL = url
  }

  pay({ amount, currency, state }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('dummy pay response is on the wayyyy')
        resolve({
          "account": "xrb_1i4s8km376q1ixd8nzq7fr8sceeq866dyptqgi4swyde9kymgt967gdxnquc",
          "amount": "0.000001",
          "amountInCurrency": "0.000001",
          "balance": "0",
          "currency": "NANO",
          "fulfilled": false,
          "state": "asdf",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbmRleCI6IjEzNDQ0MTA5NjEzMjY2Nzg2Mzg1In0.xy81AH6JTdCth6D1rmiB5-nOChi1pH4kzM_X7OVjxlM"
        })
      }, 2000)
    })
  }

  verify(token) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('dummy verify response is on the wayyyy')
        resolve({
          "account": "xrb_1i4s8km376q1ixd8nzq7fr8sceeq866dyptqgi4swyde9kymgt967gdxnquc",
          "amount": "0.000001",
          "amountInCurrency": "0.000001",
          "balance": "0",
          "currency": "NANO",
          "fulfilled": Math.random() >= 0.5,
          "state": "asdf",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbmRleCI6IjEzNDQ0MTA5NjEzMjY2Nzg2Mzg1In0.xy81AH6JTdCth6D1rmiB5-nOChi1pH4kzM_X7OVjxlM"
        })
      }, 2000)
    })
  }
}

export default ApiClient

