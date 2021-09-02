
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");

var Config = async function(accounts) {
    const airlineCodes = [
        "DEL",
        "QAT",
        "ANA",
        "KLM",
        "BA",
        "TA",
        "ETI",
        "SA",
        "LUF",
        "UA",
    ]
    const flightCodes = [
        "DEL-123",
        "QAT-234",
        "ANA-345",
        "KLM-456",
        "BA-567",
        "TA-678",
        "ETI-789",
        "SA-890",
        "LUF-901",
        "UA-012",
    ]
    
    let owner = accounts[0];

    let flightSuretyData = await FlightSuretyData.new();
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address, airlineCodes[0]);
    
    return {
        owner: owner,
        airlineCodes,
        flightCodes,
        flightSuretyData,
        flightSuretyApp
    }
}

module.exports = {
    Config: Config
};