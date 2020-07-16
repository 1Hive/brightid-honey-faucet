import tweetNacl from 'tweetnacl'
import tweetNaclUtils from 'tweetnacl-util'
import sha256 from 'js-sha256'

import { BRIGHTID_SUBSCRIPTION_ENDPOINT, CONTEXT_ID } from '../constants'
import { NO_CONTENT } from './responseCodes'

export async function sponsorUser(account) {
  const { key, signedMessage } = sponsorKeyAndSig(account)
  const endpoint = `${BRIGHTID_SUBSCRIPTION_ENDPOINT}/${key}`

  try {
    const rawResponse = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Sponsor',
        _key: key,
        contextId: account,
        context: CONTEXT_ID,
        sig: signedMessage,
        v: 4,
      }),
    })

    const response = await rawResponse.json()

    if (response.code === NO_CONTENT) {
      return {
        error: null,
      }
    }

    return {
      error: response.errorMessage,
    }
  } catch (err) {
    console.error(err)
    return { error: err }
  }
}

function sponsorKeyAndSig(account) {
  const privateKey = 'OMITTED FOR GIT'
  const privateKeyUint8Array = tweetNaclUtils.decodeBase64(privateKey)

  const message = `Sponsor,${CONTEXT_ID},${account}`
  const messageUint8Array = Buffer.from(message)
  const messageSha256 = sha256.sha256.digest(message)
  const messageBase64 = tweetNaclUtils.encodeBase64(messageSha256)
  const messageRemoveNonUrlChars = messageBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const signedMessageUint8Array = tweetNacl.sign.detached(
    messageUint8Array,
    privateKeyUint8Array
  )
  const encodedSignedMessage = tweetNaclUtils.encodeBase64(
    signedMessageUint8Array
  )

  return { key: messageRemoveNonUrlChars, signedMessage: encodedSignedMessage }
}
