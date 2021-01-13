export async function addTokenToMetamask(ethereum, token) {
  const { symbol, id, decimals } = token
  const IMAGE_URL = `https://raw.githubusercontent.com/1Hive/brightid-honey-faucet/master/app/src/assets/honey.svg`

  try {
    await ethereum.request({
      method: `wallet_watchAsset`,
      params: {
        type: `ERC20`,
        options: {
          address: id,
          symbol: symbol,
          decimals: decimals,
          image: IMAGE_URL,
        },
      },
    })
  } catch (error) {
    console.log(error)
  }
}
