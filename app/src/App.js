import React from 'react'
import { Split, SyncIndicator } from '@1hive/1hive-ui'
import MainScreen from './screens/MainScreen'
import useAppLogic from './app-logic'
import { useWallet } from './providers/Wallet'

const App = React.memo(function App() {
  const { isLoading } = useAppLogic()

  const { account } = useWallet()

  const MainScreenComponent = <MainScreen isLoading={isLoading} />

  return (
    <div>
      <SyncIndicator visible={isLoading} />
      {!account ? (
        MainScreenComponent
      ) : (
        <Split
          primary={MainScreenComponent}
          secondary={<div />}
          invert="horizontal"
        />
      )}
    </div>
  )
})

export default App
