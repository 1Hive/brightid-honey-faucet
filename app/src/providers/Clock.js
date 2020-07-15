import React, { useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import useNow from '../hooks/useNow'
import { useAppState } from './AppState'
import { getCurrentPeriod } from '../utils/period-utils'

const ClockContext = React.createContext()

function ClockProvider({ children }) {
  const now = useNow()
  const { config } = useAppState()

  const { periodNumber = 0, startTime = 0, endTime = 0 } = config
    ? getCurrentPeriod(now, config.firstPeriodStart, config.periodLength)
    : {}

  const clock = useMemo(
    () => ({
      currentPeriod: periodNumber,
      currentPeriodStartDate: new Date(startTime),
      currentPeriodEndDate: new Date(endTime),
    }),
    [periodNumber, startTime, endTime]
  )

  return <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>
}

ClockProvider.propTypes = {
  children: PropTypes.node,
}

function useClock() {
  return useContext(ClockContext)
}

export { ClockProvider, useClock }
