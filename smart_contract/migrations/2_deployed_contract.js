const fs = require('fs');
const path = require('path');

const SupplyChain = artifacts.require("SupplyChain");

module.exports = function (deployer) {
  deployer
    .deploy(SupplyChain, "BatterySupplyChain")
    .then(() => {
      const SupplyChainAddress = JSON.stringify({ address: SupplyChain.address });
      fs.writeFile(path.resolve(__dirname, '..', 'build', 'SupplyChainAddress.json'), SupplyChainAddress, err => {
        if (err) {
          console.error(err)
          return
        }
      });
    });
};
