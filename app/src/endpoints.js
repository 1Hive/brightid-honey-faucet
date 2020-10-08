import { isLocalOrUnknownNetwork, getNetworkType } from './lib/web3-utils'
import { CONTEXT_ID } from './constants'

// BrightId endpoints
export const NODE_URL = 'http:%2f%2fnode.brightid.org'

export const BRIGHT_ID_ENDPOINT_V5 = 'https://app.brightid.org/node/v5'
export const BRIGHTID_VERIFICATION_ENDPOINT = `${BRIGHT_ID_ENDPOINT_V5}/verifications`
export const BRIGHTID_1HIVE_INFO_ENDPOINT = `${BRIGHT_ID_ENDPOINT_V5}/apps/1hive`
export const BRIGHTID_SUBSCRIPTION_ENDPOINT = `${BRIGHT_ID_ENDPOINT_V5}/operations`

export const BRIGHT_ID_APP_DEEPLINK = `brightid://link-verification/${NODE_URL}/${CONTEXT_ID}`

export const UTC_API_ENDPOINT = `http://worldclockapi.com/api/json/utc/now`

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
