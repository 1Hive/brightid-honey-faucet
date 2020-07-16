const tweetNacl = require('tweetnacl')
const tweetNaclUtils = require('tweetnacl-util')
const sha256 = require('js-sha256')

const CONTEXT_ID = '1hive'

const sponsorKeyAndSig = (address) => {
  const privateKey = "OMITTED FOR GIT"
  const privateKeyUint8Array = tweetNaclUtils.decodeBase64(privateKey)

  const message = `Sponsor,${CONTEXT_ID},${address}`
  const messageUint8Array = Buffer.from(message)
  const messageSha256 = sha256.sha256.digest(message)
  const messageBase64 = tweetNaclUtils.encodeBase64(messageSha256)
  const messageRemoveNonUrlChars = messageBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

  const signedMessageUint8Array = tweetNacl.sign.detached(messageUint8Array, privateKeyUint8Array)
  const encodedSignedMessage = tweetNaclUtils.encodeBase64(signedMessageUint8Array)

  console.log(`_key (sha256 base64 replaceChars of "${message}"): ${messageRemoveNonUrlChars}`)
  console.log("sig:", encodedSignedMessage)
}

sponsorKeyAndSig('0x92CA5fECE2eD59285aC63336221b15d2a47732cA')

/**

 Documentation: https://explorer.brightid.org/doc/#/paths/~1operations~1{hash}/put Select "Sponsor" from set of operations.

 Example body for PUT http://node.brightid.org/brightid/v4/operations/EKg64d_gmfQMWEZLXBqr3lMYd1q5_RibN_t72qeBBk0 :

 {
    "name": "Sponsor",
    "_key": "EKg64d_gmfQMWEZLXBqr3lMYd1q5_RibN_t72qeBBk0",
    "contextId": "0x92CA5fECE2eD59285aC63336221b15d2a47732cA",
    "context": "1hive",
    "sig": "vqurNLlG9iXNDVTgcKsSyR3s4FIBI0/HTp45dkpn7ETQtKmE7O1e30wqIcaBXb/pLxB8UkEG3K9eSrhHWV5DCA==",
    "v": 4
 }

 Returns 204 (no content) on success

 */