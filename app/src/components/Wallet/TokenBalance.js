import React from 'react'
import { GU, textStyle, useTheme } from '@1hive/1hive-ui'
import { useTokenBalance } from '../../hooks/useTokenBalance'
import { useAppState } from '../../providers/AppState'
import { useWallet } from '../../providers/Wallet'

import { formatTokenAmount } from '../../lib/math-utils'
import honeySvg from '../../assets/honey.svg'

function TokenBalance() {
  const theme = useTheme()
  const { config } = useAppState()
  const { account } = useWallet()
  const balance = useTokenBalance(account, config.token)

  return (
    <div
      css={`
        display: flex;
        align-items: flex-start;
        padding: ${3 * GU}px;
        border-bottom: 0.5px solid ${theme.border};
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
          Balance
        </h5>
        <span
          css={`
            ${textStyle('title4')};
          `}
        >
          {formatTokenAmount(balance, config.token.decimals)}
        </span>
      </div>
    </div>
  )
}
export default TokenBalance
