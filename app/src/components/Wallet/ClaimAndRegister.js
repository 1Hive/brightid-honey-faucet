import React, { useCallback, useMemo } from 'react'
import { Button, GU, IconCheck, textStyle, useTheme } from '@1hive/1hive-ui'
import LoadingRing from '../LoadingRing'

import { useAppState } from '../../providers/AppState'
import { useClock } from '../../providers/Clock'
import { useIndividualPayout } from '../../hooks/useIndividualPayout'
import { usePeriod } from '../../hooks/polling-hooks'

import { formatTokenAmount } from '../../lib/math-utils'
import honeySvg from '../../assets/honey.svg'

function ClaimAndRegister({
  addrs,
  onClaimAndOrRegister,
  signature,
  timestamp,
}) {
  const theme = useTheme()
  const { claimer } = useAppState()
  const { currentPeriod } = useClock()

  const handleSubmit = useCallback(
    event => {
      event.preventDefault()
      onClaimAndOrRegister(addrs, timestamp, signature)
    },
    [addrs, onClaimAndOrRegister, signature, timestamp]
  )

  const [
    registeredCurrentPeriod,
    registeredNextPeriod,
    claimedCurrentPeriod,
  ] = useMemo(() => {
    if (!claimer) {
      return [false, false, false]
    }

    const { registeredForPeriod, latestClaimPeriod } = claimer

    return [
      registeredForPeriod === currentPeriod,
      registeredForPeriod === currentPeriod + 1,
      latestClaimPeriod > 0 && latestClaimPeriod === currentPeriod,
    ]
  }, [claimer, currentPeriod])

  const canClaim = registeredCurrentPeriod && !claimedCurrentPeriod

  if (!registeredNextPeriod && !canClaim) {
    return <Register onRegister={handleSubmit} />
  }

  return (
    <div>
      {canClaim && (
        <Claim currentPeriod={currentPeriod} onClaim={handleSubmit} />
      )}
      {registeredNextPeriod && (
        <div
          css={`
            padding: ${3 * GU}px;
            display: flex;
            align-items: flex-start;
            color: ${theme.positive};
          `}
        >
          <IconCheck />
          <span>Registered for next period</span>
        </div>
      )}
    </div>
  )
}

function Register({ onRegister }) {
  const theme = useTheme()
  return (
    <form onSubmit={onRegister}>
      <div
        css={`
          text-align: center;
          padding: ${3 * GU}px;
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
    </form>
  )
}

function Claim({ currentPeriod, onClaim }) {
  const theme = useTheme()
  const { config } = useAppState()
  const { period, fetching } = usePeriod(currentPeriod)

  const individualPayout = useIndividualPayout(period?.id)

  return (
    <div
      css={`
        padding: ${3 * GU}px;
      `}
    >
      {fetching ? (
        <LoadingRing />
      ) : (
        <form onSubmit={onClaim}>
          <div
            css={`
              display: flex;
              align-items: flex-start;
            `}
          >
            <div
              css={`
                margin-right: ${3 * GU}px;
              `}
            >
              <img src={honeySvg} height="50" alt="" />
            </div>
            <div>
              <h5
                css={`
                  color: ${theme.contentSecondary};
                `}
              >
                Amount to claim:
              </h5>
              <span
                css={`
                  ${textStyle('title4')};
                `}
              >
                {formatTokenAmount(
                  individualPayout || period.individualPayout,
                  config.token.decimals
                )}
              </span>
            </div>
          </div>
          <Button
            mode="strong"
            wide
            label="Claim"
            type="submit"
            css={`
              margin-top: ${2 * GU}px;
            `}
          />
        </form>
      )}
    </div>
  )
}

export default ClaimAndRegister
