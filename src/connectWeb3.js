import Web3 from 'web3'
import axios from 'axios'
import Promise from 'bluebird'

const web3 = new Web3()
const rpcHost = 'https://rpc.inb.network'

web3.setProvider(new web3.providers.HttpProvider(rpcHost))

// core
let waitResponse = {}

const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
const eventer = window[eventMethod]
const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'
eventer(
  messageEvent,
  e => {
    const key = e.message ? 'message' : 'data'
    if (!key || !e[key] || typeof key === 'string' || typeof e[key] === 'string') return
    const call = e[key].split('_#RESPONSE#_')
    const idReq = call[0] || ''
    console.log(call[1])
    const result = JSON.parse(call[1] || '{}')

    if (waitResponse[idReq] && typeof waitResponse[idReq] === 'function') {
      waitResponse[idReq](result)
      delete waitResponse[idReq]
    }
  },
  false
)

const callRootFn = (method, ...params) => {
  if (!params || !Array.isArray(params)) params = []
  const reqId = Date.now()
  console.log(method + ':' + reqId + ':' + params.join(','))
  window.parent.postMessage(method + ':' + reqId + ':' + params.join(','), '*')
  return new Promise(resolve => {
    waitResponse[reqId] = resolve
  })
    .timeout(5000)
    .catch(e => {
      delete waitResponse[reqId]
      return null
    })
}
const getAccounts = () => {
  return callRootFn('getAccounts').then(res => {
    if (!res || !res.address) {
      return Promise.resolve(['0x0000000000000000000000000000000000000000'])
    }

    return Promise.resolve([res.address])
  })
}
const getRpc = () => {
  return callRootFn('getRpcHost')
    .then(res => {
      if (res.host) {
        return [res.host]
      }
      return [null]
    })
    .catch(() => {
      return [null]
    })
}

const sendTx = raw => {
  return callRootFn('sendTx', raw).then(res => {
    console.log(res)
  })
}

const getNonce = address => {
  return axios
    .post(rpcHost, {
      method: 'parity_nextNonce',
      params: [address],
      id: 1,
      jsonrpc: '2.0'
    })
    .then(res => {
      if (!res || !res.data || !res.data.result)
        Promise.reject(new Error('config.js bmCoder: Error get nonce: parity_nextNonce'))
      return res.data.result
    })
}

// == core end

// web3 proxy (change method to use app)
web3.eth.getAccounts = getAccounts
// web3 proxy end.

// sendTx('0x123')
export default { web3, getAccounts, getNonce }
