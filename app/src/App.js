import React from 'react'
import { Split, SyncIndicator } from '@1hive/1hive-ui'
import MainScreen from './screens/MainScreen'
import useAppLogic from './app-logic'
import { useBrightIdVerification } from './hooks/useBirightIdVerification'
import { useWallet } from './providers/Wallet'
import Wallet from './components/Wallet'

const App = React.memo(function App() {
  const { isLoading } = useAppLogic()

  const { account } = useWallet()

  const verificationInfo = useBrightIdVerification(account)

  console.log('verificationInfo ', verificationInfo)

  const MainScreenComponent = <MainScreen isLoading={isLoading} />

  return (
    <div>
      <SyncIndicator visible={isLoading} />
      {!account ? (
        MainScreenComponent
      ) : (
        <Split
          primary={MainScreenComponent}
          secondary={<Wallet />}
          invert="horizontal"
        />
      )}
    </div>
  )
})

export default App
