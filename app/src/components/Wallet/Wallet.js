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
import AddressReplaced from './AddressReplaced'
import BrightIdConnect from './BrightIdConnect'
import ClaimAndRegister from './ClaimAndRegister'
import LoadingRing from '../LoadingRing'
import NoSponsorshipsAvailable from './NoSponsorshipsAvailable'
import NotVerified from './NotVerified'
import TokenBalance from './TokenBalance'

import { useWallet } from '../../providers/Wallet'
import { useBrightIdVerification } from '../../hooks/useBrightIdVerification'

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
              background: #f9f9f9;
              width: ${7 * GU}px;
              height: ${7 * GU}px;
            `}
          >
            <IconConnect
              css={`
                color: #d7d7d7;
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
  const { sponsorshipInfo, verificationInfo } = useBrightIdVerification(account)

  const {
    addressExist,
    addressUnique,
    signature,
    timestamp,
    userAddresses,
    userSponsored,
    userVerified,
    fetching,
  } = verificationInfo

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
      <TokenBalance />
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
              if (
                !sponsorshipInfo.availableSponsorships ||
                sponsorshipInfo.error
              ) {
                return <NoSponsorshipsAvailable error={sponsorshipInfo.error} />
              }
              if (!userSponsored) {
                return (
                  <BrightIdConnect
                    account={account}
                    addressExist={addressExist}
                  />
                )
              }

              if (!userVerified) {
                return <NotVerified />
              }

              if (!addressUnique) {
                return <AddressReplaced addrs={userAddresses} />
              }

              return (
                <ClaimAndRegister
                  addrs={userAddresses}
                  onClaimAndOrRegister={onClaimAndOrRegister}
                  signature={signature}
                  timestamp={timestamp}
                />
              )
            })()}
            <div
              css={`
                display: flex;
                align-items: center;
                flex-direction: column;
                padding: 0 ${3 * GU}px ${3 * GU}px ${3 * GU}px;
              `}
            >
              <span
                css={`
                  color: ${theme.contentSecondary};
                  ${textStyle('body2')};
                `}
              >
                Remaining sponsorships:
              </span>
              <span
                css={`
                  ${textStyle('body2')};
                  font-weight: 500;
                  margin-top: ${1 * GU}px;
                `}
              >
                {sponsorshipInfo.availableSponsorships}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wallet
