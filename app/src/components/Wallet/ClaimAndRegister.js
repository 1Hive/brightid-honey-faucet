import React, { useCallback } from 'react'
import { Button, GU, useTheme } from '@1hive/1hive-ui'
import { useAppState } from '../../providers/AppState'
import { useClock } from '../../providers/Clock'
import { usePeriod } from '../../hooks/subscription-hooks'
import LoadingRing from '../LoadingRing'
import { formatTokenAmount } from '../../lib/math-utils'

function ClaimAndRegister({ addrs, onClaimAndOrRegister, signature }) {
  // If claimer is null possibly means user has never registered
  const theme = useTheme()
  const { claimer } = useAppState()
  const { currentPeriod } = useClock()

  const handleSubmit = useCallback(
    event => {
      event.preventDefault()
      onClaimAndOrRegister(addrs, signature)
    },
    [addrs, onClaimAndOrRegister, signature]
  )

  // User already claimed current period
  if (claimer?.latestClaimPeriod === currentPeriod) {
    return (
      <span
        css={`
          color: ${theme.positive};
        `}
      >
        You have already claimed for current period
        {/* TODO:Update */}
      </span>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {claimer?.registeredForPeriod === currentPeriod ? (
        <Balances currentPeriod={currentPeriod} />
      ) : (
        <div
          css={`
            text-align: center;
          `}
        >
          <span
            css={`
              color: ${theme.contentSecondary};
              display: block;
            `}
          >
            Register your account, allowing you to claim in the next period
          </span>
          <Button
            mode="strong"
            label="Register"
            type="submit"
            wide
            css={`
              margin-top: ${3 * GU}px;
            `}
          />
        </div>
      )}
    </form>
  )
}

function Balances({ currentPeriod }) {
  const { config } = useAppState()
  const { period, fetching } = usePeriod(currentPeriod)

  if (fetching) {
    return <LoadingRing />
  }

  return (
    <div>
      Amount to claim:
      {formatTokenAmount(period.individualPayout, config.token.decimals)}{' '}
      {config.token.symbol}
    </div>
  )
}

export default ClaimAndRegister
