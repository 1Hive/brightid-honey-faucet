import React from 'react'
import ReactDOM from 'react-dom'
import { Main } from '@1hive/1hive-ui'
import { HashRouter } from 'react-router-dom'
import App from './App'
import MainView from './components/MainView'
import SubgraphClient from './SubgraphClient'
import { WalletProvider } from './providers/Wallet'
import { AppStateProvider } from './providers/AppState'

ReactDOM.render(
  <SubgraphClient>
    <WalletProvider>
      <AppStateProvider>
        <Main assetsUrl="/aragon-ui/" layout={false}>
          <HashRouter>
            <MainView>
              <App />
            </MainView>
          </HashRouter>
        </Main>
      </AppStateProvider>
    </WalletProvider>
  </SubgraphClient>,
  document.getElementById('root')
)
