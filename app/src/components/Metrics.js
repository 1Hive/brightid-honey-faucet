import React from 'react'
import { Box, GU, useLayout } from '@1hive/1hive-ui'
import FaucetInfo from './FaucetInfo'

import { useAppState } from '../providers/AppState'
import { useClock } from '../providers/Clock'
import { usePeriod } from '../hooks/polling-hooks'
import { getNetwork } from '../networks'
import { useTokenBalance } from '../hooks/useTokenBalance'

import { bigNum } from '../lib/math-utils'
import distributionIcon from '../assets/distributionIcon.svg'
import tokensAvailableIcon from '../assets/tokensAvailableIcon.svg'
import tokenIcon from '../assets/tokenIcon.svg'
import userIcon from '../assets/userIcon.svg'

function Metrics() {
  const { config } = useAppState()
  const { name: layout } = useLayout()
  const { currentPeriod } = useClock()
  const { period, fetching: fetchingPeriodData } = usePeriod(currentPeriod)
  const { totalRegisteredUsers = bigNum(0), individualPayout = bigNum(0) } =
    period || {}

  const faucetAddress = getNetwork().faucet
  const faucetHoneyBalance = useTokenBalance(faucetAddress, config?.token)

  const smallLayout = layout === 'small'
  const Container = smallLayout ? Box : 'div'

  return (
    <Container
      padding={0}
      style={{
        display: 'grid',
        gridTemplateColumns: layout === 'medium' ? '1fr 1fr' : '1fr',
        gridGap: `${2 * GU}px`,
        alignContent: 'start',
      }}
    >
      <FaucetInfo
        amount={bigNum(totalRegisteredUsers)}
        decimals={0}
        text="Registered users this period"
        icon={userIcon}
        loading={fetchingPeriodData}
        compact={smallLayout}
      />
      <div>
        <FaucetInfo
          amount={config.totalDistributed}
          decimals={config.token.decimals}
          text="Total distributed"
          icon={distributionIcon}
          loading={!config.totalDistributed}
          compact={smallLayout}
        />
      </div>
      <FaucetInfo
        amount={faucetHoneyBalance}
        decimals={config.token.decimals}
        text="Currently available"
        icon={tokensAvailableIcon}
        loading={faucetHoneyBalance.eq(-1)}
        compact={smallLayout}
      />
      <div>
        <FaucetInfo
          amount={individualPayout}
          decimals={config.token.decimals}
          digits={4}
          text="Amount paid per user this period"
          icon={tokenIcon}
          loading={fetchingPeriodData}
          compact={smallLayout}
        />
      </div>
    </Container>
  )
}

export default Metrics
