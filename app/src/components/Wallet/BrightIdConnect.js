import React, { useEffect, useState } from 'react'
import { GU, Info, textStyle, useTheme } from '@1hive/1hive-ui'
import QRCode from 'qrcode.react'
import LoadingRing from '../LoadingRing'
import { sponsorUser } from '../../services/sponsorUser'
import { BRIGHT_ID_APP_DEEPLINK } from '../../endpoints'

// Component will render if user does not exist or is not sponsored
function BrightIdConnect({ account, addressExist }) {
  const theme = useTheme()
  const [error, setError] = useState(null)
  const deepLink = `${BRIGHT_ID_APP_DEEPLINK}/${account}`

  useEffect(() => {
    if (!addressExist) {
      return
    }

    let cancelled = false

    const sponsor = async () => {
      try {
        // If the user exists, means it's not sponsored yet
        const { error } = await sponsorUser(account)

        if (error && !cancelled) {
          setError(`Error sponsoring account: ${error}`)
        }
      } catch (err) {
        console.error('Error when sponsoring account: ', err)
      }
    }

    sponsor()

    return () => {
      cancelled = true
    }
  }, [account, addressExist])

  return (
    <div
      css={`
        padding: ${3 * GU}px;
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <h5
        css={`
          ${textStyle('body1')};
          color: ${theme.surfaceContent};
          margin-bottom: ${3 * GU}px;
        `}
      >
        Connect with BrightID
      </h5>
      {addressExist ? (
        <div
          css={`
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          `}
        >
          {error ? (
            <Info mode="error">{error}</Info>
          ) : (
            <>
              <div
                css={`
                  margin-bottom: ${2 * GU}px;
                `}
              >
                <LoadingRing />
              </div>
              <span
                css={`
                  color: ${theme.contentSecondary};
                `}
              >
                We are in the process of Sponsoring you
              </span>
            </>
          )}
        </div>
      ) : (
        <>
          <QRCode
            value={deepLink}
            style={{ width: `${17 * GU}px`, height: `${17 * GU}px` }}
          />
          <Info
            mode="warning"
            css={`
              margin-top: ${3 * GU}px;
            `}
          >
            Scanning this code will prevent any previously connected addresses
            from registering, claiming or connecting to BrightID
          </Info>
        </>
      )}
    </div>
  )
}

export default BrightIdConnect
