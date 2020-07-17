import React from 'react'
import { Box, Timer } from '@1hive/1hive-ui'
import Wallet from './Wallet'
import { useClock } from '../providers/Clock'

function WalletAndTimer() {
  const { currentPeriodEndDate } = useClock()

  return (
    <>
      <Wallet />
      <Box heading="Time until next claim period">
        <Timer end={currentPeriodEndDate} maxUnits={4} />
      </Box>
    </>
  )
}

export default WalletAndTimer
