import { HNY_TOKEN_ADDRESS, getTokenIconBySymbol } from '../lib/token-utils'

export async function useAddTokenToMetamask(ethereum) {
  const tokenDecimals = 18
  const tokenSymbol = 'HNY'

  try {
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: HNY_TOKEN_ADDRESS,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: getTokenIconBySymbol(tokenSymbol),
        },
      },
    })

    if (wasAdded) {
      console.log('Thanks for your interest!')
    } else {
      console.log('Your loss!')
    }
  } catch (error) {
    console.log(error)
  }
}
