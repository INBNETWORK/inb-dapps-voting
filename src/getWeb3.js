import Web3 from 'web3'
import { messages } from './messages'
import { constants } from './constants'
import inbWeb3 from './connectWeb3'

let getWeb3 = () => {
  return new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async () => {
      let web3

      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (window.ethereum) {
        web3 = new Web3(window.ethereum)
        console.log('Injected web3 detected.')
        try {
          await window.ethereum.enable()
        } catch (e) {
          console.error('User denied account access')
          reject({ message: messages.USER_DENIED_ACCOUNT_ACCESS })
          return
        }
      } else if (typeof window.web3 !== 'undefined') {
        web3 = new Web3(window.web3.currentProvider)
        console.log('Injected web3 detected.')
      } else if (typeof inbWeb3.web3 !== 'undefined') {
        web3 = inbWeb3.web3
        console.log('Injected inbWeb3.web3 detected.')
      } else {
        console.error('Metamask not found')
        reject({ message: messages.NO_METAMASK_MSG })
        return
      }

      const netId = await web3.eth.net.getId()
      console.log('netId', netId)

      let netIdName
      let errorMsg = null

      if (netId in constants.NETWORKS) {
        netIdName = constants.NETWORKS[netId].NAME
        console.log(`This is ${netIdName}`)
      } else {
        netIdName = 'ERROR'
        errorMsg = messages.WRONG_NETWORK_MSG
        console.log('This is an unknown network.')
      }

      document.title = `${netIdName} - Network Governance DApp`

      if (errorMsg !== null) {
        reject({ message: errorMsg })
        return
      }

      const accounts = await web3.eth.getAccounts()

      var defaultAccount = accounts[0] || null
      if (defaultAccount === null) {
        reject({ message: messages.NO_METAMASK_MSG })
        return
      }

      resolve({
        web3Instance: web3,
        netIdName,
        netId,
        defaultAccount
      })
    })
  })
}

export default getWeb3
