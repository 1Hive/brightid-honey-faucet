import React from 'react'
import {
  Box,
  EthIdenticon,
  GU,
  IconConnect,
  shortenAddress,
  textStyle,
  useTheme,
} from '@1hive/1hive-ui'
import QRCode from 'qrcode.react'
import { useWallet } from '../providers/Wallet'
import { useBrightIdVerification } from '../hooks/useBrightIdVerification'
import { BRIGHT_ID_APP_DEEPLINK } from '../constants'

function Wallet({ isLoading }) {
  const theme = useTheme()
  const { account } = useWallet()

  // TODO - error handling on this api call
  const { addressExist } = useBrightIdVerification(account)

  const deepLink = `${BRIGHT_ID_APP_DEEPLINK}/${account}`

  return (
    <Box padding={0}>
      {!account ? (
        <div
          css={`
            display: flex;
            padding: ${3 * GU}px;
            flex-direction: column;
            text-align: center;
            align-items: center;
          `}
        >
          <div
            css={`
              border-radius: 50%;
              border: 2.3px solid #c2c2c2;
              width: ${7 * GU}px;
              height: ${7 * GU}px;
            `}
          >
            <IconConnect
              css={`
                color: #c2c2c2;
              `}
              size="large"
            />
          </div>
          <span
            css={`
              ${textStyle('body1')};
              margin-top: ${2 * GU}px;
            `}
          >
            To start please connect your account
          </span>
        </div>
      ) : (
        <>
          <div
            css={`
              display: flex;
              align-items: center;
              padding: ${3 * GU}px;
              border-bottom: 1px solid ${theme.border};
            `}
          >
            <EthIdenticon
              address={account}
              radius={100}
              scale={1.7}
              css={`
                margin-right: ${1.5 * GU}px;
              `}
            />
            <span
              css={`
                ${textStyle('title4')}
              `}
            >
              {shortenAddress(account, 4)}
            </span>
          </div>

          {!addressExist && (
            <div
              css={`
                padding: ${3 * GU}px;
                text-align: center;
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
              <QRCode
                value={deepLink}
                style={{ width: `${17 * GU}px`, height: `${17 * GU}px` }}
              />
            </div>
          )}
        </>
      )}
    </Box>
  )
}

export default Wallet
