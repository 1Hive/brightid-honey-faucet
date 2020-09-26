import React from 'react'
import { GU, Link, textStyle, useTheme } from '@1hive/1hive-ui'

function NoSponsorshipsAvailable({ error }) {
  const theme = useTheme()
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
      {error ? (
        <span
          css={`
            color: ${theme.negative};
            ${textStyle('body2')};
          `}
        >
          Error fetching available sponsorships
        </span>
      ) : (
        <>
          <h5
            css={`
              ${textStyle('body1')};
              color: ${theme.surfaceContent};
              margin-bottom: ${3 * GU}px;
            `}
          >
            Connect with BrightID
          </h5>
          <span
            css={`
              margin-top: ${2 * GU}px;
              color: ${theme.contentSecondary};
              ${textStyle('body2')};
            `}
          >
            Unfortunately we don’t have more sponsorships available, please
            contact us on the{' '}
            <Link href="https://discord.gg/sBzpmxK">1Hive Discord</Link>
          </span>
        </>
      )}
    </div>
  )
}

export default NoSponsorshipsAvailable
