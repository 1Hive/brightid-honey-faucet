const env = require("@nomiclabs/buidler")
const bn = require("bn.js")

const toBn = (x, y = 18) => new bn((x * 10 ** y).toString())
const toBnPercent = (value) => toBn(value, 16)

const brightIdContext = "0x3168697665000000000000000000000000000000000000000000000000000000" // stringToBytes32("1hive")
const brightIdVerifier = "0xb1d71F62bEe34E9Fc349234C201090c33BCdF6DB"
const networks = new Map([
  [
    "rinkeby", 
    {
      token: "0x4a7683282053ff1e2381cc1663fb04fbbcd18350",
      uniswapExchange: "0x20f2fDE9F6f9F72625c3b4cC36c451630e87eEAe", 
      minimumEthBalance: toBn(5, 17) ,
      periodLength: 60 * 5, //5 minutes
      percentPerPeriod: toBnPercent(20) // 20%
    },
  ],
  [
    "xdai",
    {
      token: "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9", 
      uniswapExchange: "0x7B7DA887E0c18e631e175532C06221761Db30A24", 
      minimumEthBalance: toBn(5, 17),
      periodLength: 60 * 60 * 24 * 2, // 2 days
      percentPerPeriod: toBnPercent(5) // 5%
    }
  ]
])


async function main() {
  await env.run("compile")

  let { token: tokenAddress, uniswapExchange, minimumEthBalance, periodLength, percentPerPeriod } = networks.get(env.network.name)

  if (tokenAddress === "") {
    const Token = env.artifacts.require("Token")
    console.log("Deploying Token...")
    const token = await Token.new("Test Token", "TTN")
    tokenAddress = token.address
  }
  console.log("Token address:", tokenAddress)

  console.log("Deploying BrightIdFaucet...")
  const BrightIdFaucet = env.artifacts.require("BrightIdFaucet")
  const brightIdFaucet = await BrightIdFaucet.new(tokenAddress, periodLength, percentPerPeriod, brightIdContext, brightIdVerifier, minimumEthBalance, uniswapExchange)
  console.log("BrightIdFaucet address:", brightIdFaucet.address, "block:", await web3.eth.getBlockNumber())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
