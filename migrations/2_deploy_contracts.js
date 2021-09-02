const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer) {

    // let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    deployer.deploy(FlightSuretyData)
    .then(() => {
        return deployer.deploy(FlightSuretyApp, FlightSuretyData.address, "DEL")
                .then(() => {
                    let config = {
                        localhost: {
                            url: process.env.GANACHE_URL,
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address
                        }
                    }
                    console.log("🚀 ~ config", config)
                    fs.writeFileSync(__dirname + '/../react-app/src/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
    });
}