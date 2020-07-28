const BrightIdFaucet = artifacts.require("BrightIdFaucetMock")
const Token = artifacts.require("Token")
const UniswapExchange = artifacts.require("uniswap_exchange")
const UniswapFactory = artifacts.require("uniswap_factory")
const ethers = require("ethers")

const toBn = (value) => new web3.utils.toBN(value)
const toBnWithDecimals = (x, y = 18) => toBn((toBn(x).mul(toBn(10).pow(toBn(y)))).toString())
const toBnPercent = (value) => toBnWithDecimals(value, 16)

// Use the private key of whatever the first account is in the local chain
// In this case it is 0xc783df8a850f42e7F7e57013759C285caa701eB6 which is the first address in the buidlerevm node
const VERIFICATIONS_PRIVATE_KEY = '0xc5e8f61d1ab959b397eecc0a37a6517b8e67a0e7cf1f4bce5591f3ed80199122'
const PERIOD_LENGTH = 10 * 60 // 10 minutes
const PERCENT_PER_PERIOD = toBnPercent(20) // 20%
const BRIGHT_ID_CONTEXT = "0x3168697665000000000000000000000000000000000000000000000000000000" // stringToBytes32("1hive")
const MIN_ETH_BALANCE = toBnWithDecimals(5, 17) // 0.5 ETH

const TOKEN_LIQUIDITY = toBnWithDecimals(10)
const ETH_LIQUIDITY = toBnWithDecimals(100)
const FAUCET_INITIAL_BALANCE = toBnWithDecimals(100)

contract("BrightIdFaucet", ([faucetOwner, unusedAccount]) => {

  let token

  beforeEach(async () => {
    token = await Token.new("Test Token", "TTN")
  })

  const createUniswapExchangeForToken = async (token, tokenLiquidity, ethLiquidity) => {
    const uniswapFactory = await UniswapFactory.new()
    const uniswapExchange = await UniswapExchange.new()
    await uniswapFactory.initializeFactory(uniswapExchange.address)

    await uniswapFactory.createExchange(token.address)
    const tokenExchangeAddress = await uniswapFactory.getExchange(token.address)
    const tokenExchange = await UniswapExchange.at(tokenExchangeAddress)

    const blockTimestamp = (await web3.eth.getBlock('latest')).timestamp
    const futureTimestamp = blockTimestamp + 9999
    await token.approve(tokenExchangeAddress, tokenLiquidity)
    await tokenExchange.addLiquidity(0, tokenLiquidity, futureTimestamp, {value: ethLiquidity})

    return tokenExchange
  }

  const createBrightIdFaucet = async (exchangeTokenLiquidiy, exchangeEthLiquidity) => {
    const tokenExchange = await createUniswapExchangeForToken(token, toBnWithDecimals(exchangeTokenLiquidiy), toBnWithDecimals(exchangeEthLiquidity))
    const brightIdFaucet = await BrightIdFaucet.new(token.address, PERIOD_LENGTH, PERCENT_PER_PERIOD, BRIGHT_ID_CONTEXT, faucetOwner, MIN_ETH_BALANCE, tokenExchange.address)
    await token.transfer(brightIdFaucet.address, FAUCET_INITIAL_BALANCE)
    return brightIdFaucet
  }

  const getVerificationsSignature = (contextIds, timestamp) => {
    const hashedMessage = web3.utils.soliditySha3(
      BRIGHT_ID_CONTEXT,
      { type: 'address[]', value: contextIds },
      timestamp
    )

    const signingKey = new ethers.utils.SigningKey(VERIFICATIONS_PRIVATE_KEY)
    return signingKey.signDigest(hashedMessage)
  }

  it("Should allow claiming when account has less than minimumEthBalance", async () => {
    const addresses = [faucetOwner]
    const timestamp = (await web3.eth.getBlock('latest')).timestamp
    // Note the exchange liquidity determines the cost of exchanging the token for ETH, in this case
    const brightIdFaucet = await createBrightIdFaucet(1, 100) // 1 ETH costs 0.01 tokens
    const sig = getVerificationsSignature(addresses, timestamp)
    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s)
    await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)

    const balance = toBn(await web3.eth.getBalance(faucetOwner))
    const balanceToRemove = balance.sub(toBnWithDecimals(3, 17)) // All - 0.3 ETH
    await web3.eth.sendTransaction({ from: faucetOwner, to: unusedAccount, value: balanceToRemove})
    const balanceBefore = toBn(await web3.eth.getBalance(faucetOwner))
    assert.isTrue(MIN_ETH_BALANCE.gt(balanceBefore), "Eth balance too high")

    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s)

    const balanceAfter = toBn(await web3.eth.getBalance(faucetOwner))
    assert.isTrue(MIN_ETH_BALANCE.lt(balanceAfter), "Eth balance not topped up")
    await web3.eth.sendTransaction({ from: unusedAccount, to: faucetOwner, value: balanceToRemove})
  })

  it("Should allow claiming when account has less than minimumEthBalance and exchange will cost more than faucet payment", async () => {
    const addresses = [faucetOwner]
    const timestamp = (await web3.eth.getBlock('latest')).timestamp
    // Note the exchange liquidity determines the cost of exchanging the token for ETH, in this case
    const brightIdFaucet = await createBrightIdFaucet(100, 1) // 0.01 ETH costs 1 token
    const sig = getVerificationsSignature(addresses, timestamp)
    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s)
    await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)

    const balance = toBn(await web3.eth.getBalance(faucetOwner))
    const balanceToRemove = balance.sub(toBnWithDecimals(3, 17)) // All - 0.3 ETH
    await web3.eth.sendTransaction({ from: faucetOwner, to: unusedAccount, value: balanceToRemove})
    const balanceBefore = toBn(await web3.eth.getBalance(faucetOwner))
    assert.isTrue(MIN_ETH_BALANCE.gt(balanceBefore), "Eth balance too high")

    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s)

    const balanceAfter = toBn(await web3.eth.getBalance(faucetOwner))
    assert.isTrue(balanceAfter.gt(balanceBefore), "Eth balance not topped up")
    await web3.eth.sendTransaction({ from: unusedAccount, to: faucetOwner, value: balanceToRemove})
  })

})



