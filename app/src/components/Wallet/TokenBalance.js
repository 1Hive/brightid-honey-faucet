import React, { useCallback } from 'react'
import {
  Button,
  formatTokenAmount,
  GU,
  textStyle,
  useTheme,
} from '@1hive/1hive-ui'
import { addTokenToMetamask } from '../../utils/addTokenToMetamask'
import { useTokenBalance } from '../../hooks/useTokenBalance'
import { useAppState } from '../../providers/AppState'
import { useWallet } from '../../providers/Wallet'

import honeySvg from '../../assets/honey.svg'

function TokenBalance() {
  const theme = useTheme()
  const { config } = useAppState()
  const { account, ethereum } = useWallet()
  const balance = useTokenBalance(account, config.token)
  const handleOnAddTokenToMetaMask = useCallback(
    () => addTokenToMetamask(ethereum, config.token),
    []
  )

  return (
    <div
      css={`
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        padding: ${3 * GU}px;
        border-bottom: 0.5px solid ${theme.border};
      `}
    >
      <div
        css={`
          display: flex;
          flex-direction: row;
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
            {formatTokenAmount(balance, config.token.decimals, { digits: 4 })}
          </span>
        </div>
      </div>
      <Button
        mode="strong"
        wide
        label="Add HNY to MetaMask"
        type="submit"
        onClick={handleOnAddTokenToMetaMask}
        css={`
          margin-top: ${2 * GU}px;
        `}
      />
    </div>
  )
}
export default TokenBalance
