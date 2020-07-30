const BrightIdFaucet = artifacts.require('BrightIdFaucetMock')
const Token = artifacts.require('Token')
const UniswapExchange = artifacts.require('uniswap_exchange')
const UniswapFactory = artifacts.require('uniswap_factory')
const ethers = require('ethers')
const { assertRevert } = require('./helpers/assertThrow')

const toBn = (value) => new web3.utils.toBN(value)
const toBnWithDecimals = (x, y = 18) => toBn((toBn(x).mul(toBn(10).pow(toBn(y)))).toString())
const toBnPercent = (value) => toBnWithDecimals(value, 16)

// Use the private key of whatever the third account is in the local chain
// In this case it is 0xe5904695748fe4a84b40b3fc79de2277660bd1d3 which is the third address in the buidlerevm node
const VERIFICATIONS_PRIVATE_KEY = '0x23c601ae397441f3ef6f1075dcb0031ff17fb079837beadaf3c84d96c6f3e569'
const PERIOD_LENGTH = 10 * 60 // 10 minutes
const PERCENT_PER_PERIOD = toBnPercent(20) // 20%
const BRIGHT_ID_CONTEXT = '0x3168697665000000000000000000000000000000000000000000000000000000' // stringToBytes32("1hive")
const MIN_ETH_BALANCE = toBnWithDecimals(5, 17) // 0.5 ETH

const TOKEN_LIQUIDITY = toBnWithDecimals(10)
const ETH_LIQUIDITY = toBnWithDecimals(100)
const FAUCET_INITIAL_BALANCE = toBnWithDecimals(100)

contract('BrightIdFaucet', ([faucetOwner, notFaucetOwner, brightIdVerifier]) => {

  let token, tokenExchange

  beforeEach(async () => {
    token = await Token.new('Test Token', 'TTN')
  })

  const createUniswapExchangeForToken = async (token, tokenLiquidity, ethLiquidity) => {
    const tokenLiquidityBn = toBnWithDecimals(tokenLiquidity)
    const ethLiquidityBn = toBnWithDecimals(ethLiquidity)
    const uniswapFactory = await UniswapFactory.new()
    const uniswapExchange = await UniswapExchange.new()
    await uniswapFactory.initializeFactory(uniswapExchange.address)

    await uniswapFactory.createExchange(token.address)
    const tokenExchangeAddress = await uniswapFactory.getExchange(token.address)
    tokenExchange = await UniswapExchange.at(tokenExchangeAddress)

    const blockTimestamp = (await web3.eth.getBlock('latest')).timestamp
    const futureTimestamp = blockTimestamp + 9999
    await token.approve(tokenExchangeAddress, tokenLiquidityBn)
    await tokenExchange.addLiquidity(0, tokenLiquidityBn, futureTimestamp, { value: ethLiquidityBn })

    return tokenExchange
  }

  const createBrightIdFaucet = async (exchangeTokenLiquidiy, exchangeEthLiquidity) => {
    const tokenExchange = await createUniswapExchangeForToken(token, exchangeTokenLiquidiy, exchangeEthLiquidity)
    const brightIdFaucet = await BrightIdFaucet.new(token.address, PERIOD_LENGTH, PERCENT_PER_PERIOD, BRIGHT_ID_CONTEXT, brightIdVerifier, MIN_ETH_BALANCE, tokenExchange.address)
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

  describe('constructor(ERC20 _token, uint256 _periodLength, uint256 _percentPerPeriod, bytes32 _brightIdContext,' +
    ' address _brightIdVerifier, uint256 _minimumEthBalance, UniswapExchange _uniswapExchange)', () => {

    let brightIdFaucet

    beforeEach(async () => {
      brightIdFaucet = await createBrightIdFaucet(100, 10)
    })

    const assertBnEqual = (actualBn, expectedBn, errorMessage = '') => {
      assert.equal(actualBn.toString(), expectedBn.toString(), errorMessage)
    }

    it('sets vars correctly', async () => {
      const timestamp = (await web3.eth.getBlock('latest')).timestamp
      assert.equal(await brightIdFaucet.token(), token.address)
      assert.equal(await brightIdFaucet.periodLength(), PERIOD_LENGTH)
      assertBnEqual(await brightIdFaucet.percentPerPeriod(), PERCENT_PER_PERIOD)
      assert.equal(await brightIdFaucet.brightIdContext(), BRIGHT_ID_CONTEXT)
      assert.equal(await brightIdFaucet.brightIdVerifier(), brightIdVerifier)
      assertBnEqual(await brightIdFaucet.minimumEthBalance(), MIN_ETH_BALANCE)
      assert.equal(await brightIdFaucet.uniswapExchange(), tokenExchange.address)
      assert.closeTo((await brightIdFaucet.firstPeriodStart()).toNumber(), timestamp, 3)
    })

    it('reverts when period length is 0', async () => {
      const tokenExchange = await createUniswapExchangeForToken(token, 100, 10)
      await assertRevert(BrightIdFaucet.new(token.address, 0, PERCENT_PER_PERIOD, BRIGHT_ID_CONTEXT, faucetOwner, MIN_ETH_BALANCE, tokenExchange.address),
        "INVALID_PERIOD_LENGTH")
    })

    it('reverts when percent per period length is more than 100%', async () => {
      const tokenExchange = await createUniswapExchangeForToken(token, 100, 10)
      await assertRevert(BrightIdFaucet.new(token.address, PERIOD_LENGTH, toBnPercent(101), BRIGHT_ID_CONTEXT, faucetOwner, MIN_ETH_BALANCE, tokenExchange.address),
        "INVALID_PERIOD_PERCENTAGE")
    })

    describe('setPercentPerPeriod(uint256 _percentPerPeriod)', () => {
      it('sets percent per period', async () => {
        const newPercentPerPeriod = toBnPercent(10)
        await brightIdFaucet.setPercentPerPeriod(newPercentPerPeriod)
        assertBnEqual(await brightIdFaucet.percentPerPeriod(), newPercentPerPeriod, 'Incorrect percent per period')
      })

      it('reverts when sender is not the owner', async () => {
        const newPercentPerPeriod = toBnPercent(10)
        await assertRevert(brightIdFaucet.setPercentPerPeriod(newPercentPerPeriod, { from: notFaucetOwner }), 'Ownable: caller is not the owner')
      })

      it('reverts when percent per period is more than 100%', async () => {
        const newPercentPerPeriod = toBnPercent(101)
        await assertRevert(brightIdFaucet.setPercentPerPeriod(newPercentPerPeriod), 'INVALID_PERIOD_PERCENTAGE')
      })
    })

    describe('setBrightIdSettings(bytes32 _brightIdContext, address _brightIdVerifier)', async () => {
      it('sets brightId settings', async () => {
        const newContext = '0x3168697665000000000000000000000000000000000000000000000000000001'
        await brightIdFaucet.setBrightIdSettings(newContext, notFaucetOwner)
        assert.equal(await brightIdFaucet.brightIdContext(), newContext, 'Incorrect BrightId Context')
        assert.equal(await brightIdFaucet.brightIdVerifier(), notFaucetOwner, 'Incorrect BrightId Verifier')
      })

      it('reverts when sender is not the owner', async () => {
        const newContext = '0x3168697665000000000000000000000000000000000000000000000000000001'
        await assertRevert(brightIdFaucet.setBrightIdSettings(newContext, notFaucetOwner, { from: notFaucetOwner }), 'Ownable: caller is not the owner')
      })
    })

    describe('setMinimumEthBalance(uint256 _minimumEthBalance)', () => {
      it('sets the minimum eth balance', async () => {
        const newMinEthBalance = toBnWithDecimals(3, 17) // 0.3 ETH
        await brightIdFaucet.setMinimumEthBalance(newMinEthBalance)
        assertBnEqual(await brightIdFaucet.minimumEthBalance(), newMinEthBalance, 'Incorrect minimum eth balance')
      })

      it('reverts when sender is not the owner', async () => {
        const newMinEthBalance = toBnWithDecimals(3, 17) // 0.3 ETH
        await assertRevert(brightIdFaucet.setMinimumEthBalance(newMinEthBalance, { from: notFaucetOwner }), 'Ownable: caller is not the owner')
      })
    })

    describe('setUniswapExchange(UniswapExchange _uniswapExchange)', () => {
      it('sets the uniswap exchange', async () => {
        const newUniswapExchange = await createUniswapExchangeForToken(token, 100, 10)
        await brightIdFaucet.setUniswapExchange(newUniswapExchange.address)
        assert.equal(await brightIdFaucet.uniswapExchange(), newUniswapExchange.address, 'Incorrect uniswap exchange')
      })

      it('reverts when sender is not the owner', async () => {
        const newUniswapExchange = await createUniswapExchangeForToken(token, 100, 10)
        await assertRevert(brightIdFaucet.setUniswapExchange(newUniswapExchange.address, { from: notFaucetOwner }), 'Ownable: caller is not the owner')
      })
    })

    describe('withdrawDeposit(address _to)', () => {
      it('withdraws all of the faucets funds to the specified account', async () => {
        const faucetBalanceBefore = await token.balanceOf(brightIdFaucet.address)
        const beneficiaryBalanceBefore = await token.balanceOf(faucetOwner)

        await brightIdFaucet.withdrawDeposit(faucetOwner)

        const expectedBeneficiaryBalance = beneficiaryBalanceBefore.add(faucetBalanceBefore)
        assertBnEqual(await token.balanceOf(brightIdFaucet.address), toBn(0), 'Incorrect faucet balance')
        assertBnEqual(await token.balanceOf(faucetOwner), expectedBeneficiaryBalance, 'Incorrect beneficiary balance')
      })

      it('reverts when sender is not the owner', async () => {
        await assertRevert(brightIdFaucet.withdrawDeposit(faucetOwner, { from: notFaucetOwner }), 'Ownable: caller is not the owner')
      })
    })

    describe('getCurrentPeriod()', () => {
      it('returns 0 when no time has passed', async () => {
        assertBnEqual(await brightIdFaucet.getCurrentPeriod(), toBn(0), 'Incorrect period number')
      })

      it('returns 1 when period length has passed', async () => {
        await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
        assertBnEqual(await brightIdFaucet.getCurrentPeriod(), toBn(1), 'Incorrect period number')
      })

      it('returns 4 when 4 period lengths have passed', async () => {
        await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH * 4)
        assertBnEqual(await brightIdFaucet.getCurrentPeriod(), toBn(4), 'Incorrect period number')
      })
    })

    // describe('getPeriodIndividualPayout(uint256 _periodNumber)', () => {
    //   it('returns 0 in first period', async () => {
    //     assertBnEqual(await brightIdFaucet.getPeriodIndividualPayout(0), toBn(0), 'Incorrect individual payout')
    //   })
    //
    //
    // })
  })

  it('Should allow claiming when account has less than minimumEthBalance', async () => {
    const addresses = [faucetOwner]
    const timestamp = (await web3.eth.getBlock('latest')).timestamp
    // Note the exchange liquidity determines the cost of exchanging the token for ETH, in this case
    const brightIdFaucet = await createBrightIdFaucet(1, 100) // 1 ETH costs 0.01 tokens
    const sig = getVerificationsSignature(addresses, timestamp)
    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s)
    await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)

    const balance = toBn(await web3.eth.getBalance(faucetOwner))
    const balanceToRemove = balance.sub(toBnWithDecimals(3, 17)) // All - 0.3 ETH
    await web3.eth.sendTransaction({ from: faucetOwner, to: notFaucetOwner, value: balanceToRemove })
    const balanceBefore = toBn(await web3.eth.getBalance(faucetOwner))
    assert.isTrue(MIN_ETH_BALANCE.gt(balanceBefore), 'Eth balance too high')

    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s)

    const balanceAfter = toBn(await web3.eth.getBalance(faucetOwner))
    assert.isTrue(MIN_ETH_BALANCE.lt(balanceAfter), 'Eth balance not topped up')
    await web3.eth.sendTransaction({ from: notFaucetOwner, to: faucetOwner, value: balanceToRemove })
  })

  it('Should allow claiming when account has less than minimumEthBalance and exchange will cost more than faucet payment', async () => {
    const addresses = [faucetOwner]
    const timestamp = (await web3.eth.getBlock('latest')).timestamp
    // Note the exchange liquidity determines the cost of exchanging the token for ETH, in this case
    const brightIdFaucet = await createBrightIdFaucet(100, 1) // 0.01 ETH costs 1 token
    const sig = getVerificationsSignature(addresses, timestamp)
    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s)
    await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)

    const balance = toBn(await web3.eth.getBalance(faucetOwner))
    const balanceToRemove = balance.sub(toBnWithDecimals(3, 17)) // All - 0.3 ETH
    await web3.eth.sendTransaction({ from: faucetOwner, to: notFaucetOwner, value: balanceToRemove })
    const balanceBefore = toBn(await web3.eth.getBalance(faucetOwner))
    assert.isTrue(MIN_ETH_BALANCE.gt(balanceBefore), 'Eth balance too high')

    await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s)

    const balanceAfter = toBn(await web3.eth.getBalance(faucetOwner))
    assert.isTrue(balanceAfter.gt(balanceBefore), 'Eth balance not topped up')
    await web3.eth.sendTransaction({ from: notFaucetOwner, to: faucetOwner, value: balanceToRemove })
  })

})



