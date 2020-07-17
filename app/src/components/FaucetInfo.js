import React from 'react'
import { Box, GU, useTheme, textStyle } from '@1hive/1hive-ui'
import { formatTokenAmount } from '../lib/math-utils'

function FaucetInfo({ amount, decimals, text, icon }) {
  const theme = useTheme()

  return (
    <Box id="hello" padding={0}>
      <div
        css={`
          display: flex;
          align-items: center;
          width: ${33 * GU}px;
          height: ${18 * GU}px;
          padding: ${3 * GU}px;
        `}
      >
        <div
          id="hello2"
          css={`
            margin-right: ${2 * GU}px;
          `}
        >
          <img src={icon} height="60" alt="" />
        </div>
        <div>
          <h5
            css={`
              ${textStyle('title2')};
              color: ${theme.content};
            `}
          >
            {formatTokenAmount(amount, decimals)}
          </h5>
          <span
            css={`
              color: ${theme.contentSecondary};
            `}
          >
            {text}
          </span>
        </div>
      </div>
    </Box>
  )
}

export default FaucetInfo
