import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import useNow from '../hooks/useNow'
import { useAppState } from './AppState'

const ClockContext = React.createContext()

function ClockProvider({ children }) {
  const now = useNow()
  const { config } = useAppState()

  const   

  return <ClockContext.Provider value={{}}>{children}</ClockContext.Provider>
}

ClockProvider.propTypes = {
  children: PropTypes.node,
}

function useClock() {
  return useContext(ClockContext)
}

export { ClockProvider, useClock }
