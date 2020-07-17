import { useEffect, useState } from 'react'
import { BRIGHTID_CONTEXT } from '../constants'
import { BRIGHTID_VERIFICATION_ENDPOINT } from '../endpoints'
import { ERROR_CODE, NOT_FOUND_CODE } from '../services/responseCodes'

const VERIFICATION_RETRY_EVERY = 1000
const REQUEST_TIMEOUT = 60000

const VERIFICATION_INFO_DEFAULT = {
  addressExist: false,
  userAddresses: [],
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
      return
    }

    const fetchVerificationInfo = async () => {
      const endpoint = `${BRIGHTID_VERIFICATION_ENDPOINT}/${BRIGHTID_CONTEXT}/${account}` // 0xe8fb09228d1373f931007ca7894a08344b80901c
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
          if (response.code === NOT_FOUND_CODE) {
            setVerificationInfo({ addressExist: false, fetching: false })
            return
          }
          if (response.code === ERROR_CODE) {
            setVerificationInfo({
              error: response.errorMessage,
              fetching: false,
            })
            return
          }

          setVerificationInfo({
            addressExist: true,
            userAddresses: response.data.contextIds,
            fetching: false,
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
