import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import { Main } from '@1hive/1hive-ui'
import App from './App'
import MainView from './components/MainView'
import { WalletProvider } from './providers/Wallet'

ReactDOM.render(
  <WalletProvider>
    <Main assetsUrl="/aragon-ui/" layout={false}>
      <HashRouter>
        <MainView>
          <App />
        </MainView>
      </HashRouter>
    </Main>
  </WalletProvider>,
  document.getElementById('root')
)
