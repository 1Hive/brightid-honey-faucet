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
import BrightIdConnect from './BrightIdConnect'
import ClaimAndRegister from './ClaimAndRegister'

import { useWallet } from '../../providers/Wallet'
import { useBrightIdVerification } from '../../hooks/useBrightIdVerification'
import LoadingRing from '../LoadingRing'

function Wallet({ onClaimAndOrRegister }) {
  const { account } = useWallet()

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
        <AccountConnected
          account={account}
          onClaimAndOrRegister={onClaimAndOrRegister}
        />
      )}
    </Box>
  )
}

function AccountConnected({ account, onClaimAndOrRegister }) {
  const theme = useTheme()
  // TODO - error handling on this api call
  const {
    addressExist,
    signature,
    userAddresses,
    userSponsored,
    userVerified,
    fetching,
  } = useBrightIdVerification(account)

  return (
    <div>
      <div
        css={`
          display: flex;
          align-items: center;
          justify-content: center;
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
      <div>
        {fetching ? (
          <div
            css={`
              padding: ${3 * GU}px;
              display: flex;
              flex-direction: column;
              align-items: center;
            `}
          >
            <LoadingRing />
          </div>
        ) : (
          <div>
            {(() => {
              if (!userSponsored) {
                return (
                  <BrightIdConnect
                    account={account}
                    addressExist={addressExist}
                  />
                )
              }

              if (!userVerified) {
                return <span>User not verified</span> // TODO: Ask for some desgins?
              }

              return (
                <ClaimAndRegister
                  addrs={userAddresses}
                  onClaimAndOrRegister={onClaimAndOrRegister}
                  signature={signature}
                />
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wallet
