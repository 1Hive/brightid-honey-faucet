import tweetNacl from 'tweetnacl'
import stringify from 'fast-json-stable-stringify'

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

    const timestamp = Date.now()
    const op = {
      v: 5,
      name: 'Sponsor',
      app: CONTEXT_ID,
      timestamp,
      contextId: account,
    }
    const message = getMessage(op)
    console.log('message ', message)
    console.log('typof message!!! ', typeof message)
    const messageUint8Array = Buffer.from(message)
    console.log(messageUint8Array, messageUint8Array)
    op.sig = uInt8ArrayToB64(
      Object.values(tweetNacl.sign.detached(messageUint8Array, privateKey))
    )

    const endpoint = `${BRIGHTID_SUBSCRIPTION_ENDPOINT}`
    const rawResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: op,
    })

    console.log('raw response ', rawResponse)

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

function uInt8ArrayToB64(array) {
  const b = Buffer.from(array)
  return b.toString('base64')
}

function getMessage(op) {
  const signedOp = {}
  for (const k in op) {
    if (['sig', 'sig1', 'sig2', 'hash'].includes(k)) {
      continue
    }
    signedOp[k] = op[k]
  }
  return stringify(signedOp)
}


TypeError: unexpected type, use Uint8Array
    at fe (nacl-fast.js:2165)
    at Object.e.sign (nacl-fast.js:2269)
    at Function.e.sign.detached (nacl-fast.js:2290)
    at sponsorUser.js:28
    at c (runtime.js:63)
    at Generator._invoke (runtime.js:293)
    at Generator.next (runtime.js:118)
    at n (asyncToGenerator.js:3)
    at s (asyncToGenerator.js:25)
    at asyncToGenerator.js:32