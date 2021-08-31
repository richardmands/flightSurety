
var Test = require('../config/testConfig.js');

contract('Flight Surety Tests', async (accounts) => {

  let config
  before('setup contract', async () => {
    config = await Test.Config(accounts);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`App Contract Behaves Correctly`, async function () {
    let isError = false;
    
    let status
    status = await config.flightSuretyApp.isOperational();
    console.log("🚀 ~ status", status)
    assert.equal(status, true);
    
    let airlines
    airlines = await config.flightSuretyApp.getAirlinesList();
    console.log("🚀 ~ airlines", airlines)
    assert.equal(airlines.length, 1);
    
    let airline1
    airline1 = await config.flightSuretyApp.getAirlineDetails(airlines[0])
    console.log("🚀 ~ airline1", airline1)
    assert.equal(airline1.name, 'DEL');
    assert.equal(airline1.registered, true);
    assert.equal(airline1.funded, false);

    // unfunded airline can't disable the contract
    isError = false;
    try {
        await config.flightSuretyApp.setIsOperational(false)
    } catch (error) {
        console.log("🚀 ~ error", error.reason)
        isError = true;
    }
    assert.equal(isError, true);
    
    // unfunded airline can't register another airline
    isError = false;
    try {
        await config.flightSuretyApp.registerAirline(config.airlineCodes[1], accounts[1])
    } catch (error) {
        console.log("🚀 ~ error", error.reason)
        isError = true;
    }
    assert.equal(isError, true);

    await config.flightSuretyApp.fundAirline(airlines[0], { from: accounts[0], value: web3.utils.toWei("1", "ether")})
    airline1 = await config.flightSuretyApp.getAirlineDetails(airlines[0])
    console.log("🚀 ~ airline1", airline1)
    assert.equal(airline1.funded, true);
    
    // funded airline can disable and enable contract
    await config.flightSuretyApp.setIsOperational(false)
    status = await config.flightSuretyApp.isOperational();
    console.log("🚀 ~ status", status)
    assert.equal(status, false);
    
    await config.flightSuretyApp.setIsOperational(true)
    status = await config.flightSuretyApp.isOperational();
    console.log("🚀 ~ status", status)
    assert.equal(status, true);
    
    // funded airline can register another airline
    await config.flightSuretyApp.registerAirline(config.airlineCodes[1], accounts[1])
    airlines = await config.flightSuretyApp.getAirlinesList();
    console.log("🚀 ~ airlines", airlines)
    assert.equal(airlines.length, 2);
    
    let airline2
    airline2 = await config.flightSuretyApp.getAirlineDetails(airlines[1])
    console.log("🚀 ~ airline2", airline2)
    assert.equal(airline2.name, 'QAT');
    assert.equal(airline2.registered, true);
    assert.equal(airline2.funded, false);
    
    // Register and fund so there are 4 fully funded airlines
    await config.flightSuretyApp.registerAirline(config.airlineCodes[2], accounts[2])
    await config.flightSuretyApp.registerAirline(config.airlineCodes[3], accounts[3])
    airlines = await config.flightSuretyApp.getAirlinesList();
    console.log("🚀 ~ airlines", airlines)
    await config.flightSuretyApp.fundAirline(airlines[1], { from: accounts[1], value: web3.utils.toWei("1", "ether")})
    await config.flightSuretyApp.fundAirline(airlines[2], { from: accounts[2], value: web3.utils.toWei("1", "ether")})
    await config.flightSuretyApp.fundAirline(airlines[3], { from: accounts[3], value: web3.utils.toWei("1", "ether")})
    
    airline2 = await config.flightSuretyApp.getAirlineDetails(airlines[1])
    console.log("🚀 ~ airline2", airline2)
    assert.equal(airline2.name, 'QAT');
    assert.equal(airline2.registered, true);
    assert.equal(airline2.funded, true);
    
    let airline3
    airline3 = await config.flightSuretyApp.getAirlineDetails(airlines[2])
    console.log("🚀 ~ airline3", airline3)
    assert.equal(airline3.name, 'ANA');
    assert.equal(airline3.registered, true);
    assert.equal(airline3.funded, true);
    
    let airline4
    airline4 = await config.flightSuretyApp.getAirlineDetails(airlines[3])
    console.log("🚀 ~ airline4", airline4)
    assert.equal(airline4.name, 'KLM');
    assert.equal(airline4.registered, true);
    assert.equal(airline4.funded, true);
    
    // Multi-party kicks in...
    await config.flightSuretyApp.registerAirline(config.airlineCodes[4], accounts[4])
    airlines = await config.flightSuretyApp.getAirlinesList();
    console.log("🚀 ~ airlines", airlines)
    assert.equal(airlines.length, 5);
    let airline5
    airline5 = await config.flightSuretyApp.getAirlineDetails(airlines[4])
    console.log("🚀 ~ airline5", airline5)
    assert.equal(airline5.name, 'BA');
    assert.equal(airline5.registered, false);
    assert.equal(airline5.funded, false);
    
    // Can't vote for same airline twice
    isError = false
    try {
        await config.flightSuretyApp.approveAirline(config.airlineCodes[4])
    } catch (error) {
        console.log("🚀 ~ error", error.reason)
        isError = true
    }
    assert.equal(isError, true);

    // Another account can vote to approve
    await config.flightSuretyApp.approveAirline(config.airlineCodes[4], { from: accounts[1]})
    airline5 = await config.flightSuretyApp.getAirlineDetails(airlines[4])
    console.log("🚀 ~ airline5", airline5)
    assert.equal(airline5.name, 'BA');
    assert.equal(airline5.registered, true);
    assert.equal(airline5.funded, false);

    // Multiple votes needed to enable and disable
    await config.flightSuretyApp.setIsOperational(false)
    status = await config.flightSuretyApp.isOperational();
    console.log("🚀 ~ status", status)
    assert.equal(status, true);
    
    isError = false;
    try {
        await config.flightSuretyApp.setIsOperational(false, { from : accounts[8]})
    } catch (error) {
        console.log("🚀 ~ error", error.reason)
        isError = true;
    }
    assert.equal(isError, true);
    
    await config.flightSuretyApp.setIsOperational(false, { from : accounts[1]})
    status = await config.flightSuretyApp.isOperational();
    console.log("🚀 ~ status", status)
    assert.equal(status, false);
    
    await config.flightSuretyApp.setIsOperational(true, { from : accounts[2]})
    await config.flightSuretyApp.setIsOperational(true, { from : accounts[3]})
    status = await config.flightSuretyApp.isOperational();
    console.log("🚀 ~ status", status)
    assert.equal(status, true);

    let oracleRequestEvents = []

    // Register Oracles
    const MAX_ORACLES = 10;
    let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();
    
    let oracles = []
    await Promise.all(
        accounts.map(async (account, i) => {
            if(i < MAX_ORACLES){
                await config.flightSuretyApp.registerOracle({
                    from: account,
                    value: fee,
                })
                
                const newOracle = await config.flightSuretyApp.getOracle({ from: account })
                oracles = [...oracles, { ...newOracle, account }]

            }
      })
      )
      
      console.log("🚀 ~ oracles", oracles.length)
      assert.equal(oracles.length, 10)

    // Register to receive Oracle events and always return status code of '20'
    config.flightSuretyApp.contract.events.OracleRequest(
        {
        fromBlock: 'latest',
        },
        async (error, event) => {
            if (error) console.log(error)
        
            if (event && oracles.length) {
                oracleRequestEvents.push(event)
                const { index, flight } = event.returnValues
                const hasIndexOracles = oracles.filter((oracle) =>
                    oracle.indexes.includes(index)
                )
                const statusCode = 20

                if (hasIndexOracles.length && index && flight) {
                    await Promise.all(
                        hasIndexOracles.map((oracle) => {

                            async function updateViaOracle(){
                                try {
                                    await config.flightSuretyApp
                                        .submitOracleResponse(index, flight, statusCode, { from: oracle.account, value: 0 })
                                } catch (error) {
                                    console.log("🚀 ~ error", error.reason)
                                }
                            }

                            return updateViaOracle()
                            
                        })
                    )
                }
               
            }
        }
    )
    
    // Register Flight
    let flight1
    await config.flightSuretyApp.registerFlight(config.flightCodes[0])
    flight1 = await config.flightSuretyApp.getRegisteredFlight(config.flightCodes[0])
    console.log("🚀 ~ flight1", flight1)
    assert.equal(flight1.flight, 'DEL-123');
    assert.equal(flight1.registered, true);
    assert.equal(flight1.insured, false);
    assert.equal(flight1.statusCode, '10');
    
    // Buy Insurance
    isError = false;
    try {
        await config.flightSuretyApp.buyInsurance(config.flightCodes[0], { value:  web3.utils.toWei("1", "ether")})
    } catch (error) {
        console.log("🚀 ~ error", error.reason)
        isError = true
    }
    assert.equal(isError, true);
    await config.flightSuretyApp.buyInsurance(config.flightCodes[0], { value:  web3.utils.toWei("100", "finney")})
    flight1 = await config.flightSuretyApp.getRegisteredFlight(config.flightCodes[0])
    console.log("🚀 ~ flight1", flight1)
    assert.equal(flight1.flight, 'DEL-123');
    assert.equal(flight1.registered, true);
    assert.equal(flight1.insured, true);
    assert.equal(flight1.insurees.length, 1);
    assert.equal(flight1.statusCode, '10');
    
    // Check flight Status - repeat call to make sure enough responses to trigger state update(min 3)
    await config.flightSuretyApp.fetchFlightStatus(config.flightCodes[0])
    await config.flightSuretyApp.fetchFlightStatus(config.flightCodes[0])
    await config.flightSuretyApp.fetchFlightStatus(config.flightCodes[0])
    await config.flightSuretyApp.fetchFlightStatus(config.flightCodes[0])
    await config.flightSuretyApp.fetchFlightStatus(config.flightCodes[0])
    
    await setTimeout(() => {}, 1000);
    
    flight1 = await config.flightSuretyApp.getRegisteredFlight(config.flightCodes[0])
    console.log("🚀 ~ flight1", flight1)
    assert.equal(flight1.statusCode, '20');
    
    // Claim refund
    const balanceBefore = await web3.eth.getBalance(accounts[0])
    console.log("🚀 ~ balanceBefore", balanceBefore)
    await config.flightSuretyApp.getRefund()
    const balanceAfter = await web3.eth.getBalance(accounts[0])
    console.log("🚀 ~ balanceAfter", balanceAfter)
    const greaterThan = balanceAfter > balanceBefore
    assert.equal(greaterThan, true);
  });
});

