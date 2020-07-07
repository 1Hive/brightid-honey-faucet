usePlugin("@nomiclabs/buidler-truffle5");

// This is a sample Buidler task. To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await web3.eth.getAccounts();

  for (const account of accounts) {
    console.log(account);
  }
});

module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
      accounts: {
        mnemonic: "explain tackle mirror kit van hammer degree position ginger unfair soup bonus"
      }
    },
  },
  solc: {
    version: '0.6.11',
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  },
};
