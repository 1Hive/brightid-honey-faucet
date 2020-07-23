import React from 'react'
import { Split, SyncIndicator, useLayout } from '@1hive/1hive-ui'
import MainScreen from './screens/MainScreen'
import WalletAndTimer from './components/Wallet/WalletAndTimer'
import useAppLogic from './app-logic'

const App = React.memo(function App() {
  const { actions, isLoading } = useAppLogic()
  const { name: layout } = useLayout()
  const oneColumn = layout === 'small' || layout === 'medium'

  return (
    <div>
      <SyncIndicator visible={isLoading} />
      <Split
        primary={<MainScreen isLoading={isLoading} />}
        secondary={
          <WalletAndTimer onClaimAndOrRegister={actions.claimAndOrRegister} />
        }
        invert={oneColumn ? 'vertical' : 'horizontal'}
      />
    </div>
  )
})

export default App
