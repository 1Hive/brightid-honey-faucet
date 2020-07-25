import tweetNacl from 'tweetnacl'
import tweetNaclUtils from 'tweetnacl-util'
import sha256 from 'js-sha256'

import { CONTEXT_ID } from '../constants'
import { BRIGHTID_SUBSCRIPTION_ENDPOINT } from '../endpoints'
import { NO_CONTENT } from './responseCodes'
import env from '../environment'

export async function sponsorUser(account) {
  try {
    const privateKey = env('NODE_PK')

    if (!privateKey) {
      return { error: 'No private key found for the node' }
    }

    const { key, signedMessage } = sponsorKeyAndSig(account, privateKey)
    const endpoint = `${BRIGHTID_SUBSCRIPTION_ENDPOINT}/${key}`
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

    if (rawResponse.ok) {
      return {
        error: null,
      }
    }

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

function sponsorKeyAndSig(account, privateKey) {
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
