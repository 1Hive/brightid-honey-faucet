import React from 'react'
import {
  Box,
  formatTokenAmount,
  GU,
  useTheme,
  textStyle,
} from '@1hive/1hive-ui'
import LoadingRing from './LoadingRing'

function FaucetInfo({
  amount,
  decimals,
  digits = 2,
  text,
  icon,
  loading,
  compact,
}) {
  const theme = useTheme()

  const Container = compact ? 'div' : Box

  return (
    <Container
      padding={0}
      style={{
        boxShadow: compact ? '' : '0px 1px 3px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        css={`
          display: flex;
          align-items: center;
          height: ${18 * GU}px;
          padding: ${3 * GU}px;
        `}
      >
        {loading ? (
          <div
            css={`
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <LoadingRing />
          </div>
        ) : (
          <>
            <div
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
                {formatTokenAmount(amount, decimals, { digits })}
              </h5>
              <span
                css={`
                  color: ${theme.contentSecondary};
                `}
              >
                {text}
              </span>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export default FaucetInfo
