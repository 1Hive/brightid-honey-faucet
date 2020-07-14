import React from 'react'
import { Box, Timer } from '@1hive/1hive-ui'
import Wallet from './Wallet'

function WalletAndTimer() {
  // TODO - replace this by the real end date
  const DAY = 1000 * 60 * 60 * 24
  const nextPeriod = new Date(Date.now() + 5 * DAY)
  return (
    <>
      <Wallet />
      <Box heading="Time until next claim period">
        <Timer end={nextPeriod} maxUnits={4} />
      </Box>
    </>
  )
}

export default WalletAndTimer
