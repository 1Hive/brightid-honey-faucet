import React from 'react'
import ReactDOM from 'react-dom'
import { Main } from '@1hive/1hive-ui'
import { HashRouter } from 'react-router-dom'
import App from './App'
import AppLoader from './components/AppLoader'
import MainView from './components/MainView'
import MetaTags from './components/seo'
import SubgraphClient from './SubgraphClient'
import { WalletProvider } from './providers/Wallet'
import { AppStateProvider } from './providers/AppState'
import { ClockProvider } from './providers/Clock'

ReactDOM.render(
  <SubgraphClient>
    <WalletProvider>
      <AppStateProvider>
        <ClockProvider>
          <MetaTags
            title="Honey Faucet"
            description="1Hive is a DAO that issues and distributes a digital currency called Honey."
          />
          <Main assetsUrl="/aragon-ui/" layout={false}>
            <HashRouter>
              <MainView>
                <AppLoader>
                  <App />
                </AppLoader>
              </MainView>
            </HashRouter>
          </Main>
        </ClockProvider>
      </AppStateProvider>
    </WalletProvider>
  </SubgraphClient>,
  document.getElementById('root')
)
