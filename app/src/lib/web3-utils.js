import { getAddress } from 'ethers/utils'
import env from '../environment'
import { getDefaultChain } from '../local-settings'
import { parseUnits } from './math-utils'

const DEFAULT_LOCAL_CHAIN = ''
const DEFAULT_GAS_LIMIT = '700000'
const DEFAULT_GAS_PRICE = '2'

export function getUseWalletProviders() {
  const providers = [{ id: 'injected' }]

  if (env('FORTMATIC_API_KEY')) {
    providers.push({
      id: 'fortmatic',
      useWalletConf: { apiKey: env('FORTMATIC_API_KEY') },
    })
  }

  if (env('PORTIS_DAPP_ID')) {
    providers.push({
      id: 'portis',
      useWalletConf: { dAppId: env('PORTIS_DAPP_ID') },
    })
  }

  return providers
}

export function isLocalOrUnknownNetwork(chainId = getDefaultChain()) {
  return getNetworkType(chainId) === DEFAULT_LOCAL_CHAIN
}

export function getUseWalletConnectors() {
  return getUseWalletProviders().reduce((connectors, provider) => {
    if (provider.useWalletConf) {
      connectors[provider.id] = provider.useWalletConf
    }
    return connectors
  }, {})
}

export function getNetworkType(chainId = getDefaultChain()) {
  chainId = String(chainId)

  if (chainId === '1') return 'mainnet'
  if (chainId === '3') return 'ropsten'
  if (chainId === '4') return 'rinkeby'
  if (chainId === '100') return 'xdai'

  return DEFAULT_LOCAL_CHAIN
}

export function getNetworkName(chainId = getDefaultChain()) {
  chainId = String(chainId)

  if (chainId === '1') return 'Mainnet'
  if (chainId === '3') return 'Ropsten'
  if (chainId === '4') return 'Rinkeby'
  if (chainId === '100') return 'xDai'

  return 'unknown'
}

// Check address equality with checksums
export function addressesEqual(first, second) {
  first = first && getAddress(first)
  second = second && getAddress(second)
  return first === second
}

export const addressPattern = '(0x)?[0-9a-fA-F]{40}'
const ETH_ADDRESS_SPLIT_REGEX = /(0x[a-fA-F0-9]{40}(?:\b|\.|,|\?|!|;))/g
const ETH_ADDRESS_TEST_REGEX = /(0x[a-fA-F0-9]{40}(?:\b|\.|,|\?|!|;))/g

export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

// Detect Ethereum addresses in a string and transform each part.
//
// `callback` is called on every part with two params:
//   - The string of the current part.
//   - A boolean indicating if it is an address.
//
export function transformAddresses(str, callback) {
  return str
    .split(ETH_ADDRESS_SPLIT_REGEX)
    .map((part, index) =>
      callback(part, ETH_ADDRESS_TEST_REGEX.test(part), index)
    )
}

export function addressesEqualNoSum(first, second) {
  first = first && first.toLowerCase()
  second = second && second.toLowerCase()
  return first === second
}

export function sanitizeSignature(signature) {
  return {
    ...signature,
    r: `0x${signature.r}`,
    s: `0x${signature.s}`,
  }
}

export function getGasPrice() {
  const gasPrice = env('GAS_PRICE') || DEFAULT_GAS_PRICE
  return parseUnits(gasPrice, 'gwei')
}

export function getGasLimit() {
  const gasLimit = env('GAS_LIMIT') || DEFAULT_GAS_LIMIT
  return parseInt(gasLimit)
}

// Re-export some ethers/utils functions
export {
  getAddress,
  toUtf8String,
  id as keccak256,
  formatBytes32String,
} from 'ethers/utils'
