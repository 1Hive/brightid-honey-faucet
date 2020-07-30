import React from 'react'
import ReactDOM from 'react-dom'
import { Main } from '@1hive/1hive-ui'
import { HashRouter } from 'react-router-dom'
import App from './App'
import AppLoader from './components/AppLoader'
import MainView from './components/MainView'
import SubgraphClient from './SubgraphClient'
import { WalletProvider } from './providers/Wallet'
import { AppStateProvider } from './providers/AppState'
import { ClockProvider } from './providers/Clock'

ReactDOM.render(
  <SubgraphClient>
    <WalletProvider>
      <AppStateProvider>
        <ClockProvider>
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
