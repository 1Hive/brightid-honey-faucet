import React from 'react'
import { Box, GU, Link, textStyle, theme } from '@1hive/1hive-ui'

const MainScreen = React.memo(({ isLoading }) => {
  if (isLoading) {
    return null
  }
  return (
    <div
      css={`
        display: flex;
        flex-direction: row;
      `}
    >
      <Box
        css={`
          height: fit-content;
        `}
      >
        <div>
          <h5
            css={`
              ${textStyle('title3')};
              color: ${theme.surfaceContent};
            `}
          >
            Connect with BrightID
          </h5>
          <div
            css={`
              margin-top: ${4 * GU}px;
              display: flex;
              flex-direction: column;
              line-height: 16px;
            `}
          >
            <span
              css={`
                margin-top: ${2 * GU}px;
              `}
            >
              This Faucet is to claim HNY tokens by using BrightID.
            </span>
            <span
              css={`
                margin-top: ${2 * GU}px;
              `}
            >
              If you know how, use the QR code to validate your account.
            </span>
            <span
              css={`
                margin-top: ${2 * GU}px;
              `}
            >
              If you don’t know how to do it, why you don’t say Hi! 👋 on our
              Discord chat and find out more?{' '}
            </span>
            <Link
              css={`
                margin-top: ${2 * GU}px;
                text-align: left;
              `}
              href="https://discord.gg/NkQTHF"
            >
              Link to Discord chat
            </Link>
          </div>
        </div>
      </Box>
      <div
        css={`
          margin-left: ${2 * GU}px;
        `}
      >
        <Box
          css={`
            width: ${33 * GU}px;
            height: ${18 * GU}px;
          `}
        >
          BOX 1
        </Box>
        <Box
          css={`
            width: ${33 * GU}px;
            height: ${18 * GU}px;
          `}
        >
          BOX 2
        </Box>
        <Box
          css={`
            width: ${33 * GU}px;
            height: ${18 * GU}px;
          `}
        >
          BOX 3
        </Box>
        <Box
          css={`
            width: ${33 * GU}px;
            height: ${18 * GU}px;
          `}
        >
          BOX 4
        </Box>
      </div>
    </div>
  )
})

export default MainScreen
