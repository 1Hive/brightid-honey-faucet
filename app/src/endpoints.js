import { isLocalOrUnknownNetwork, getNetworkType } from './lib/web3-utils'

// The graph endpoints
const GRAPH_API_BASE_HTTP_LOCAL = 'http://127.0.0.1:8000'
const GRAPH_API_BASE_WS_LOCAL = 'ws://127.0.0.1:8001'

const GRAPH_API_BASE_HTTP = 'https://api.thegraph.com'
const GRAPH_API_BASE_WS = 'wss://api.thegraph.com'

const GRAPH_API_PATH = '/subgraphs/name/1hive/brightid-honey-faucet'

function getAPIBase() {
  return isLocalOrUnknownNetwork()
    ? [GRAPH_API_BASE_HTTP_LOCAL, GRAPH_API_BASE_WS_LOCAL]
    : [GRAPH_API_BASE_HTTP, GRAPH_API_BASE_WS]
}

export function graphEndpoints() {
  const [API_BASE_HTTP, API_BASE_WS] = getAPIBase()
  const networkType = isLocalOrUnknownNetwork() ? 'rpc' : getNetworkType()

  const API_PATH =
    networkType === 'main' ? GRAPH_API_PATH : `${GRAPH_API_PATH}-${networkType}`

  return [`${API_BASE_HTTP}${API_PATH}`, `${API_BASE_WS}${API_PATH}`]
}
