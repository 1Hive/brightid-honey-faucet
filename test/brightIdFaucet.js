const BrightIdFaucet = artifacts.require("BrightIdFaucet")
const Token = artifacts.require("Token")

const toBn = (x, y = 18) => new web3.utils.toBN((x * 10 ** y).toString())
const toBnPercent = (value) => toBn(value, 16)

const PERIOD_LENGTH = 10 * 60 // 10 minutes
const PERCENT_PER_PERIOD = toBnPercent(20) // 20%
const BRIGHT_ID_CONTEXT = "0x3168697665000000000000000000000000000000000000000000000000000000" // stringToBytes32("1hive")
const BRIGHT_ID_VERIFIER = "0xb1d71F62bEe34E9Fc349234C201090c33BCdF6DB"
const MIN_ETH_BALANCE = toBn(5, 17) // 0.5 ETH

contract("BrightIdFaucet", ([faucetOwner, uniswapExchange]) => {

  it("Should allow registration after registering multiple addresses", async function() {
    const token = await Token.new("Test Token", "TTN")
    const brightIdFaucet = await BrightIdFaucet.new(token.address, PERIOD_LENGTH, PERCENT_PER_PERIOD, BRIGHT_ID_CONTEXT, BRIGHT_ID_VERIFIER, MIN_ETH_BALANCE, uniswapExchange)

    const addresses = ["0x93889f441c03e6e8a662c9c60c750a9bfecb00bd", "0x92ca5fece2ed59285ac63336221b15d2a47732ca"]
    const sigR = '0xf20764471401d07d4172cd991f03cc67282070e98ed7afe41907098df37a54e3'
    const sigS = '0x0446b5d241d716e8fd0c38b4831c2ea4303d666a5455723670fa4a403b288d8f'
    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, 27, sigR, sigS)

    console.log(await brightIdFaucet.claimers(faucetOwner))
  })

})



