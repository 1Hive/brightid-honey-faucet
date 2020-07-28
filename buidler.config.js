const homedir = require('homedir')
const path = require('path')
usePlugin("@nomiclabs/buidler-truffle5")

const settingsForNetwork = (network) => {
  try {
    const keyFilePath = path.join(homedir(), `.aragon/${network}_key.json`)
    return require(keyFilePath)
  } catch (e) {
    return { }
  }
}

const key = (network) => {
  let { keys } = settingsForNetwork(network)

  if (!keys) {
    return ''
  }

  return keys[0]
}

module.exports = {
  defaultNetwork: 'buidlerevm',
  networks: {
    buidlerevm: {
      gasPrice: 1000000000 // 1 Gwei
    },
    localhost: {
      url: 'http://localhost:8545',
      gasPrice: 1000000000 // 1 Gwei
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/8e0a671dca444df9ad47246e07aac303",
      accounts: ["0x" + key("rinkeby")]
    },
    xdai: {
      url: "https://xdai.poanetwork.dev",
      chainId: 100,
      accounts: ["0x" + key("xdai")],
      gasPrice: 1000000000 // 1 Gwei
    }
  },
  solc: {
    version: '0.6.11',
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  }
}
