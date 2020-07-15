import React from 'react'
import { Split, SyncIndicator } from '@1hive/1hive-ui'
import MainScreen from './screens/MainScreen'
import WalletAndTimer from './components/WalletAndTimer'
import useAppLogic from './app-logic'

const App = React.memo(function App() {
  const { isLoading } = useAppLogic()

  const MainScreenComponent = <MainScreen isLoading={isLoading} />

  return (
    <div>
      <SyncIndicator visible={isLoading} />
      <Split
        primary={MainScreenComponent}
        secondary={<WalletAndTimer />}
        invert="horizontal"
      />
    </div>
  )
})

export default App
