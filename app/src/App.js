import React from 'react'
import { Split, SyncIndicator } from '@1hive/1hive-ui'
import MainScreen from './screens/MainScreen'
import WalletAndTimer from './components/Wallet/WalletAndTimer'
import useAppLogic from './app-logic'

const App = React.memo(function App() {
  const { actions, isLoading } = useAppLogic()

  return (
    <div>
      <SyncIndicator visible={isLoading} />
      <Split
        primary={<MainScreen isLoading={isLoading} />}
        secondary={
          <WalletAndTimer onClaimAndOrRegister={actions.claimAndOrRegister} />
        }
        invert="horizontal"
      />
    </div>
  )
})

export default App
