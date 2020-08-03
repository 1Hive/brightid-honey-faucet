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
const ONE_HUNDRED_PERCENT = toBnPercent(100)
const BRIGHT_ID_CONTEXT = '0x3168697665000000000000000000000000000000000000000000000000000000' // stringToBytes32("1hive")
const MIN_ETH_BALANCE = toBnWithDecimals(5, 17) // 0.5 ETH

const TOKEN_LIQUIDITY = toBnWithDecimals(10)
const ETH_LIQUIDITY = toBnWithDecimals(100)
const FAUCET_INITIAL_BALANCE = toBnWithDecimals(100)

contract('BrightIdFaucet', ([faucetOwner, notFaucetOwner, brightIdVerifier, faucetUser, faucetUserSecondAddress, faucetUserThirdAddress, secondFaucetUser]) => {

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

  describe('constructor(_token, _periodLength, _percentPerPeriod, _brightIdContext, _brightIdVerifier, _minimumEthBalance, _uniswapExchange)', () => {

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
        'INVALID_PERIOD_LENGTH')
    })

    it('reverts when percent per period length is more than 100%', async () => {
      const tokenExchange = await createUniswapExchangeForToken(token, 100, 10)
      await assertRevert(BrightIdFaucet.new(token.address, PERIOD_LENGTH, toBnPercent(101), BRIGHT_ID_CONTEXT, faucetOwner, MIN_ETH_BALANCE, tokenExchange.address),
        'INVALID_PERIOD_PERCENTAGE')
    })

    describe('setPercentPerPeriod(_percentPerPeriod)', () => {
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

    describe('setBrightIdSettings(_brightIdContext, _brightIdVerifier)', async () => {
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

    describe('setMinimumEthBalance(_minimumEthBalance)', () => {
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

    describe('setUniswapExchange(_uniswapExchange)', () => {
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

    describe('withdrawDeposit(_to)', () => {
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

    describe('claimAndOrRegister(_brightIdContext, _addrs, _timestamp, _v, _r, _s)', () => {

      let addresses, timestamp, sig

      beforeEach(async () => {
        addresses = [faucetUser]
        timestamp = (await web3.eth.getBlock('latest')).timestamp
        sig = getVerificationsSignature(addresses, timestamp)
      })

      it('registers user', async () => {
        await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser })

        const currentPeriod = await brightIdFaucet.getCurrentPeriod()
        const { registeredForPeriod, latestClaimPeriod, addressVoid } = await brightIdFaucet.claimers(faucetUser)
        const { totalRegisteredUsers } = await brightIdFaucet.periods(currentPeriod.add(toBn(1)))
        assertBnEqual(registeredForPeriod, currentPeriod.add(toBn(1)), 'Incorrect registered for period')
        assertBnEqual(latestClaimPeriod, toBn(0), 'Incorrect latest claim period')
        assert.isFalse(addressVoid, 'Incorrect address void')
        assertBnEqual(totalRegisteredUsers, toBn(1))
      })

      it('voids all previously registered accounts', async () => {
        addresses = [faucetUserSecondAddress, faucetUser]
        sig = getVerificationsSignature(addresses, timestamp)
        await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUserSecondAddress })

        const { addressVoid: originalAddressVoid } = await brightIdFaucet.claimers(faucetUser)
        const { addressVoid: newAddressVoid } = await brightIdFaucet.claimers(faucetUserSecondAddress)
        assert.isTrue(originalAddressVoid, 'Incorrect original address void')
        assert.isFalse(newAddressVoid, 'Incorrect new address void')
      })

      it('voids all previously registered accounts when already voided accounts', async () => {
        addresses = [faucetUserSecondAddress, faucetUser]
        sig = getVerificationsSignature(addresses, timestamp)
        await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUserSecondAddress })
        addresses = [faucetUserThirdAddress, faucetUserSecondAddress, faucetUser]
        sig = getVerificationsSignature(addresses, timestamp)
        await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)

        await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUserThirdAddress })

        const { addressVoid: originalAddressVoid } = await brightIdFaucet.claimers(faucetUser)
        const { addressVoid: secondAddressVoid } = await brightIdFaucet.claimers(faucetUserSecondAddress)
        const { addressVoid: thirdAddressVoid } = await brightIdFaucet.claimers(faucetUserThirdAddress)
        assert.isTrue(originalAddressVoid, 'Incorrect original address void')
        assert.isTrue(secondAddressVoid, 'Incorrect second address void')
        assert.isFalse(thirdAddressVoid, 'Incorrect third address void')
      })

      it('claims faucet reward', async () => {
        await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser })
        await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
        const balanceBeforeClaim = await token.balanceOf(faucetUser)

        await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser })

        const claimAmount = FAUCET_INITIAL_BALANCE.mul(PERCENT_PER_PERIOD).div(ONE_HUNDRED_PERCENT)
        const balanceAfterClaim = await token.balanceOf(faucetUser)
        assertBnEqual(balanceAfterClaim, balanceBeforeClaim.add(claimAmount), 'Incorrect balance after registration')
      })

      it('reverts when registering twice in the same period', async () => {
        await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser })
        await assertRevert(brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser }), 'ALREADY_REGISTERED')
      })

      it('reverts when incorrect verification signature used', async () => {
        await assertRevert(brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v - 1, sig.r, sig.s, { from: faucetUser }), 'INCORRECT_VERIFICATION')
      })

      it('reverts when verification timestamp too far in the past', async () => {
        const verificationTimestampVariance = await brightIdFaucet.VERIFICATION_TIMESTAMP_VARIANCE()
        await brightIdFaucet.mockIncreaseTime(verificationTimestampVariance)
        await assertRevert(brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser }), 'INCORRECT_VERIFICATION')
      })

      it('reverts when sender not first address in verification contextIds', async () => {
        await assertRevert(brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetOwner }), 'SENDER_NOT_IN_VERIFICATION')
      })

      it('reverts when voided address is used', async () => {
        const newAddresses = [faucetUserSecondAddress, faucetUser]
        const newSig = getVerificationsSignature(newAddresses, timestamp)
        await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, newAddresses, timestamp, newSig.v, newSig.r, newSig.s, { from: faucetUserSecondAddress })

        await assertRevert(brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser }),
          'ADDRESS_VOIDED')
      })

      const itClaimsRewardAsExpected = (faucetUserClaimFunction, secondUserClaimFunction) => {

        const percentOfValue = (percent, value) => {
          return value.mul(percent).div(ONE_HUNDRED_PERCENT)
        }

        beforeEach(async () => {
          await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser })
        })

        it('claims faucet reward', async () => {
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
          const balanceBeforeClaim = await token.balanceOf(faucetUser)

          await faucetUserClaimFunction()

          const claimAmount = percentOfValue(PERCENT_PER_PERIOD, FAUCET_INITIAL_BALANCE)
          const balanceAfterClaim = await token.balanceOf(faucetUser)
          assertBnEqual(balanceAfterClaim, balanceBeforeClaim.add(claimAmount), 'Incorrect balance after registration')
        })

        it('claims expected amount when multiple accounts registered', async () => {
          const secondUserAddresses = [secondFaucetUser]
          const secondUserSig = getVerificationsSignature(secondUserAddresses, timestamp)
          await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, secondUserAddresses, timestamp, secondUserSig.v, secondUserSig.r, secondUserSig.s,
            { from: secondFaucetUser })
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
          const balance1BeforeClaim = await token.balanceOf(faucetUser)
          const balance2BeforeClaim = await token.balanceOf(secondFaucetUser)

          await faucetUserClaimFunction()
          await secondUserClaimFunction()

          const claimAmount = percentOfValue(PERCENT_PER_PERIOD, FAUCET_INITIAL_BALANCE).div(toBn(2))
          const balance1AfterClaim = await token.balanceOf(faucetUser)
          const balance2AfterClaim = await token.balanceOf(secondFaucetUser)
          assertBnEqual(balance1AfterClaim, balance1BeforeClaim.add(claimAmount), 'Incorrect balance of faucet user')
          assertBnEqual(balance2AfterClaim, balance2BeforeClaim.add(claimAmount), 'Incorrect balance of second faucet user')
        })

        it('sets period max payout if not already set', async () => {
          const expectedMaxPayout = percentOfValue(PERCENT_PER_PERIOD, FAUCET_INITIAL_BALANCE)

          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
          await faucetUserClaimFunction()

          const currentPeriod = await brightIdFaucet.getCurrentPeriod()
          const { maxPayout } = await brightIdFaucet.periods(currentPeriod)
          assertBnEqual(maxPayout, expectedMaxPayout, 'Incorrect max payout')
        })

        it('converts faucet token to eth when sender account has less than minimum eth balance', async () => {
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
          const ethBalance = toBn(await web3.eth.getBalance(faucetUser))
          const ethBalanceToRemove = ethBalance.sub(MIN_ETH_BALANCE.sub(toBnWithDecimals(2, 17))) // All - 0.3 ETH
          await web3.eth.sendTransaction({ from: faucetUser, to: faucetUserSecondAddress, value: ethBalanceToRemove })
          const ethBalanceBefore = toBn(await web3.eth.getBalance(faucetUser))
          const tokenBalanceBefore = await token.balanceOf(faucetUser)
          assert.isTrue(ethBalanceBefore.lt(MIN_ETH_BALANCE), 'Incorrect original eth balance, too high')

          await faucetUserClaimFunction()

          const ethBalanceAfter = toBn(await web3.eth.getBalance(faucetUser))
          const tokenBalanceAfter = await token.balanceOf(faucetUser)
          assert.isTrue(ethBalanceAfter.gt(MIN_ETH_BALANCE), 'Incorrect final eth balance, too low')
          assert.isTrue(tokenBalanceAfter.gt(tokenBalanceBefore), 'Incorrect token balance, too low')
          await web3.eth.sendTransaction({ from: faucetUserSecondAddress, to: faucetUser, value: ethBalanceToRemove })
        })

        it('converts faucet token to eth when used by multiple users with less than minimum eth balance', async () => {
          const secondUserAddresses = [secondFaucetUser]
          const secondUserSig = getVerificationsSignature(secondUserAddresses, timestamp)
          await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, secondUserAddresses, timestamp, secondUserSig.v, secondUserSig.r, secondUserSig.s,
            { from: secondFaucetUser })
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
          const eth1Balance = toBn(await web3.eth.getBalance(faucetUser))
          const eth1BalanceToRemove = eth1Balance.sub(MIN_ETH_BALANCE.sub(toBnWithDecimals(2, 17))) // All - 0.3 ETH
          await web3.eth.sendTransaction({ from: faucetUser, to: faucetUserSecondAddress, value: eth1BalanceToRemove })

          const eth2Balance = toBn(await web3.eth.getBalance(secondFaucetUser))
          const eth2BalanceToRemove = eth2Balance.sub(MIN_ETH_BALANCE.sub(toBnWithDecimals(2, 17))) // All - 0.3 ETH
          await web3.eth.sendTransaction({
            from: secondFaucetUser,
            to: faucetUserSecondAddress,
            value: eth2BalanceToRemove
          })
          const eth2BalanceBefore = toBn(await web3.eth.getBalance(secondFaucetUser))
          const token2BalanceBefore = await token.balanceOf(secondFaucetUser)
          assert.isTrue(eth2BalanceBefore.lt(MIN_ETH_BALANCE), 'Incorrect original eth balance, too high')

          await faucetUserClaimFunction()
          await secondUserClaimFunction()

          const eth2BalanceAfter = toBn(await web3.eth.getBalance(secondFaucetUser))
          const token2BalanceAfter = await token.balanceOf(secondFaucetUser)
          assert.isTrue(eth2BalanceAfter.gt(MIN_ETH_BALANCE), 'Incorrect final eth balance, too low')
          assert.isTrue(token2BalanceAfter.gt(token2BalanceBefore), 'Incorrect token balance, too low')
          await web3.eth.sendTransaction({ from: faucetUserSecondAddress, to: faucetUser, value: eth1BalanceToRemove })
          await web3.eth.sendTransaction({
            from: faucetUserSecondAddress,
            to: secondFaucetUser,
            value: eth2BalanceToRemove
          })
        })

        it('converts faucet token to eth when exchange will cost more than faucet payment', async () => {
          // Note the exchange liquidity determines the cost of exchanging the token for ETH, in this case
          brightIdFaucet = await createBrightIdFaucet(100, 1) // 0.01 ETH costs 1 token
          await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser })
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
          const ethBalance = toBn(await web3.eth.getBalance(faucetUser))
          const ethBalanceToRemove = ethBalance.sub(MIN_ETH_BALANCE.sub(toBnWithDecimals(2, 17))) // All - 0.3 ETH
          await web3.eth.sendTransaction({ from: faucetUser, to: faucetUserSecondAddress, value: ethBalanceToRemove })
          const balanceBefore = toBn(await web3.eth.getBalance(faucetUser))
          assert.isTrue(balanceBefore.lt(MIN_ETH_BALANCE), 'Incorrect initial eth balance, too high')

          await faucetUserClaimFunction()

          const balanceAfter = toBn(await web3.eth.getBalance(faucetUser))
          assert.isTrue(balanceAfter.gt(balanceBefore), 'Incorrect final eth balance, too low')
          await web3.eth.sendTransaction({ from: faucetUserSecondAddress, to: faucetUser, value: ethBalanceToRemove })
        })
      }

      describe('claimAndOrRegister(_brightIdContext, _addrs, _timestamp, _v, _r, _s)', () => {

        let secondUserAddresses, secondUserSig

        beforeEach(async () => {
          secondUserAddresses = [secondFaucetUser]
          secondUserSig = getVerificationsSignature(secondUserAddresses, timestamp)
        })

        itClaimsRewardAsExpected(
          () => brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser }),
          () => brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, secondUserAddresses, timestamp, secondUserSig.v, secondUserSig.r, secondUserSig.s, { from: secondFaucetUser })
        )

        it('does not claim when address not registered for current period', async () => {
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH * 2)
          const expectedTokenBalance = await token.balanceOf(faucetUser)
          await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser })
          assertBnEqual(await token.balanceOf(faucetUser), expectedTokenBalance, 'Incorrect token balance')
        })

        it('does not claim when address already claimed this period', async () => {
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
          await brightIdFaucet.claim({ from: faucetUser })
          const expectedTokenBalance = await token.balanceOf(faucetUser)

          await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser })
          assertBnEqual(await token.balanceOf(faucetUser), expectedTokenBalance, 'Incorrect token balance')
        })

        it('does not claim when current period is 0', async () => {
          const expectedTokenBalance = await token.balanceOf(secondFaucetUser)
          await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, secondUserAddresses, timestamp, secondUserSig.v, secondUserSig.r, secondUserSig.s, { from: secondFaucetUser })
          assertBnEqual(await token.balanceOf(secondFaucetUser), expectedTokenBalance, 'Incorrect token balance')
        })

        it('reverts when faucet balance is 0', async () => {
          await brightIdFaucet.withdrawDeposit(faucetOwner)
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)

          await assertRevert(brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUser }),
            'FAUCET_BALANCE_IS_ZERO')
        })
      })

      describe('claim()', () => {

        itClaimsRewardAsExpected(
          () => brightIdFaucet.claim({ from: faucetUser }),
          () => brightIdFaucet.claim({ from: secondFaucetUser })
        )

        it('reverts when address void', async () => {
          addresses = [faucetUserSecondAddress, faucetUser]
          sig = getVerificationsSignature(addresses, timestamp)
          await brightIdFaucet.claimAndOrRegister(BRIGHT_ID_CONTEXT, addresses, timestamp, sig.v, sig.r, sig.s, { from: faucetUserSecondAddress })

          await assertRevert(brightIdFaucet.claim({ from: faucetUser }), 'ADDRESS_VOIDED')
        })

        it('reverts when address not registered for current period', async () => {
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH * 2)
          await assertRevert(brightIdFaucet.claim({ from: faucetUser }), 'CANNOT_CLAIM')
        })

        it('reverts when address already claimed this period', async () => {
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)
          await brightIdFaucet.claim({ from: faucetUser })

          await assertRevert(brightIdFaucet.claim({ from: faucetUser }), 'CANNOT_CLAIM')
        })

        it('reverts when current period is 0', async () => {
          await assertRevert(brightIdFaucet.claim({ from: faucetUser }), 'CANNOT_CLAIM')
        })

        it('reverts when faucet balance is 0', async () => {
          await brightIdFaucet.withdrawDeposit(faucetOwner)
          await brightIdFaucet.mockIncreaseTime(PERIOD_LENGTH)

          await assertRevert(brightIdFaucet.claim({ from: faucetUser }), 'FAUCET_BALANCE_IS_ZERO')
        })
      })
    })
  })
})



