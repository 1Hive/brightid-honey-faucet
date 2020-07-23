import { useEffect, useState } from 'react'
import { CONTEXT_ID } from '../constants'
import { BRIGHTID_VERIFICATION_ENDPOINT } from '../endpoints'
import {
  ERROR_CODE,
  NOT_FOUND_CODE,
  CAN_NOT_BE_VERIFIED,
  NOT_SPONSORED_CODE,
} from '../services/responseCodes'

const VERIFICATION_RETRY_EVERY = 1000
const REQUEST_TIMEOUT = 60000

const VERIFICATION_INFO_DEFAULT = {
  addressExist: false,
  addressUnique: false,
  signature: null,
  userAddresses: [],
  userSponsored: false,
  userVerified: false,
  error: null,
  fetching: true,
}

export function useBrightIdVerification(account) {
  const [verificationInfo, setVerificationInfo] = useState(
    VERIFICATION_INFO_DEFAULT
  )

  useEffect(() => {
    let cancelled = false
    let retryTimer

    if (!account) {
      return setVerificationInfo(info => ({ ...info, fetching: false }))
    }

    const fetchVerificationInfo = async () => {
      const endpoint = `${BRIGHTID_VERIFICATION_ENDPOINT}/${CONTEXT_ID}/${account}?signed=eth`
      try {
        const rawResponse = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: REQUEST_TIMEOUT,
        })

        const response = await rawResponse.json()

        if (!cancelled) {
          if (response.code === ERROR_CODE) {
            setVerificationInfo({
              error: response.errorMessage,
              fetching: false,
            })
            return
          }

          if (response.code === NOT_FOUND_CODE) {
            // If the users didn't link their address to the their BrightId account or cannot be verified for the context (meaning is unverified on the BrightId app)
            setVerificationInfo({
              addressExist: response.errorNum === CAN_NOT_BE_VERIFIED,
              addressUnique: false,
              userAddresses: [],
              userSponsored: response.errorNum === CAN_NOT_BE_VERIFIED,
              userVerified: false,
              fetching: false,
            })
            return
          }

          if (response.code === NOT_SPONSORED_CODE) {
            setVerificationInfo({
              addressExist: true,
              addressUnique: false,
              userAddresses: [],
              userSponsored: false,
              userVerified: false,
              fetching: false,
            })
            return
          }

          setVerificationInfo({
            addressExist: true,
            addressUnique: response.data?.unique,
            userAddresses: response.data?.contextIds,
            userSponsored: true,
            userVerified: true,
            fetching: false,
            signature: { ...response.data?.sig },
          })
          return
        }
      } catch (err) {
        console.error(`Could not fetch verification info `, err)
        if (!cancelled) {
          retryTimer = setTimeout(
            fetchVerificationInfo,
            VERIFICATION_RETRY_EVERY
          )
        }
      }
    }

    fetchVerificationInfo()

    return () => {
      cancelled = true
      clearTimeout(retryTimer)
    }
  }, [account])

  return verificationInfo
}
