import React, { useContext } from 'react'
import { useClaimer, useConfig } from '../hooks/subscription-hooks'
import { useWallet } from '../providers/Wallet'
import { getNetwork } from '../networks'

const AppStateContext = React.createContext()

function AppStateProvider({ children }) {
  const facuetAddress = getNetwork().faucet
  const wallet = useWallet()
  const { config, fetching: fetchingConfig, error: errorConfig } = useConfig(
    facuetAddress
  )
  const {
    claimer,
    fetching: fetchingClaimer,
    errro: errorClaimer,
  } = useClaimer(wallet.account)

  return (
    <AppStateContext.Provider
      value={{
        claimer,
        config,
        error: errorConfig || errorClaimer,
        loading: fetchingClaimer || fetchingConfig,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

function useAppState() {
  return useContext(AppStateContext)
}

export { AppStateProvider, useAppState }
