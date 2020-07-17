const env = require("@nomiclabs/buidler")
const bn = require("bn.js")

const toBn = (x, y = 18) => new bn((x * 10 ** y).toString())
const toBnPercent = (value) => toBn(value, 16)

const periodLength = 60 * 60 * 24 * 30 // 30 Days
const percentPerPeriod = toBnPercent(20)
const brightIdContext = "0xbef57f662870bc4f372075f07bd453a9cfc5c22a370b5bf41fdb74c839229f3e" // Keccak256("1hive")
const brightIdVerifier = "0xb1d71F62bEe34E9Fc349234C201090c33BCdF6DB"
const networks = new Map([
  [
    "rinkeby", 
    { 
      token: "0x4a7683282053ff1e2381cc1663fb04fbbcd18350", 
      uniswapExchange: "0x20f2fDE9F6f9F72625c3b4cC36c451630e87eEAe", 
      minimumEthBalance: toBn(5, 17) 
    }
  ]
])


async function main() {
  await env.run("compile") // Compile contracts

  const { token, uniswapExchange, minimumEthBalance } = networks.get(env.network.name)

  const BrightIdFaucet = env.artifacts.require("BrightIdFaucet");
  const brightIdFaucet = await BrightIdFaucet.new(token, periodLength, percentPerPeriod, brightIdContext, brightIdVerifier, minimumEthBalance, uniswapExchange);

  console.log("Token address:", token.address);
  console.log("BrightIdFaucet address:", brightIdFaucet.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
