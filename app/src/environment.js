// rinkeby
const DEFAULT_CHAIN_ID = 100

const ENV_VARS = {
  CHAIN_ID() {
    const chainId = parseInt(process.env.REACT_APP_CHAIN_ID)
    return isNaN(chainId) ? DEFAULT_CHAIN_ID : chainId
  },

  FORTMATIC_API_KEY() {
    return process.env.REACT_APP_FORTMATIC_API_KEY || ''
  },
  PORTIS_DAPP_ID() {
    return process.env.REACT_APP_PORTIS_DAPP_ID || ''
  },
  NODE_PK() {
    return process.env.REACT_APP_NODE_PK || ''
  },
  GAS_LIMIT() {
    return process.env.REACT_APP_GAS_LIMIT || ''
  },
  GAS_PRICE() {
    return process.env.REACT_APP_GAS_PRICE || ''
  },
}

export default function env(name) {
  const envVar = ENV_VARS[name]
  return typeof envVar === 'function' ? envVar() : null
}
