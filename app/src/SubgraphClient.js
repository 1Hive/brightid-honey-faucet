import React from 'react'
import {
  createClient,
  Provider as UrqlProvider,
  cacheExchange,
  debugExchange,
  fetchExchange,
  subscriptionExchange,
} from 'urql'
import { devtoolsExchange } from '@urql/devtools'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { graphEndpoints } from './endpoints'

const [subgraphHttpEndpoint, subgraphWsEndpoint] = graphEndpoints()

const subscriptionClient = new SubscriptionClient(subgraphWsEndpoint, {
  reconnect: true,
  reconnectionAttempts: 10,
})

function SubgraphClient({ children }) {
  const client = createClient({
    url: subgraphHttpEndpoint,
    requestPolicy: 'network-only',
    exchanges: [
      debugExchange,
      devtoolsExchange,
      cacheExchange,
      fetchExchange,
      subscriptionExchange({
        forwardSubscription: operation => subscriptionClient.request(operation),
      }),
    ],
  })

  return <UrqlProvider value={client}>{children}</UrqlProvider>
}

export default SubgraphClient
