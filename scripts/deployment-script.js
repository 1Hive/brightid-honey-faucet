const env = require("@nomiclabs/buidler")
const bn = require("bn.js")

const ONE_PERCENT = 1e16
const toBnPercent = (value) => new bn((value * ONE_PERCENT).toString())

const periodLength = 60 * 60 * 24 * 30 // 30 Days
const percentPerPeriod = toBnPercent(20)

async function main() {
  await env.run("compile") // Compile contracts

  const Token = env.artifacts.require("Token");
  const token = await Token.new("Honey", "HNY")

  const BrightIdFaucet = env.artifacts.require("BrightIdFaucet");
  const brightIdFaucet = await BrightIdFaucet.new(token.address, periodLength, percentPerPeriod);

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
