import React from 'react'
import { GU, textStyle, useTheme } from '@1hive/1hive-ui'
import userIconGray from '../../assets/userIconGray.svg'

function NotVerified() {
  const theme = useTheme
  return (
    <div
      css={`
        padding: ${3 * GU}px;
        display: flex;
        text-align: center;
        flex-direction: column;
        align-items: center;
      `}
    >
      <img src={userIconGray} width={5 * GU} height={5 * GU} />
      <span
        css={`
          margin-top: ${2 * GU}px;
          color: ${theme.surfaceContentSecondary};
          ${textStyle('body2')};
        `}
      >
        You are yet to be identified as a unique individual by BrightID
      </span>
    </div>
  )
}

export default NotVerified
