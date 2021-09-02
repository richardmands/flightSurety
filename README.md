# Flight Surety Dapp
My Version of Udacity Flight Surety App
This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (React) and server app scaffolding (Express).

## App deployed on Netlify
https://flightsurety.netlify.app/
## Server deployed to Heroku from separate repo
https://flightsuretyserver.herokuapp.com/

https://github.com/richardmands/flightSuretyServer
## See App Contract on Rinkeby
https://rinkeby.etherscan.io/address/0xBa4248664584a4f6C16D82373c4f845Cf03aE554
## App Contract deployment transaction
https://rinkeby.etherscan.io/tx/0xa0423f71c372bac34a94aae03be1503db5bee61c8d5eda6a687922ffb7b040cb
## See Data Contract on Rinkeby
https://rinkeby.etherscan.io/address/0x1d72013A5998A8FDd3967b101A9F2ad176EA8eb1
## Data Contract deployment transaction
https://rinkeby.etherscan.io/tx/0xec8f7cfbb8899624bd06683a4837c000127591f6a2771e53bb8806420b065d5b

## App Summary
Registered and Paid airlines can:
- Nominate addresses as owners of airlines
- Request the contract be turned on or off

Registered airlines can:
- Fund their airline

All users can:
- Request a flight be registered as available for purchasing insurance
- Purchase insurance
- Check the status of their flight
- If the flight status is returned as 'LATE AIRLINE', can request a refund

## Running the app
- Run Ganache CLI or `truffle develop`
- Pull down the code from GitHub

### Contracts
- Run `truffle compile` and `truffle migrate` commands from the root directory

### The Front-End
- `cd react-app`
- `yarn start`

### The Back-End
- `cd server`
- `yarn start`

### Run Tests
- Run Ganache CLI or `truffle develop`
- Update `truffle-config.js` with correct host port
- Run `truffle test` from the root directory

## Tests
- Mocha for contract tests
- Errors visible in console logs are confirming failure when account with wrong permissions attempts an action.
- [See Tests Here](https://github.com/richardmands/supplyChain/blob/master/test/TestSupplychain.js)

## Required Libraries
- Truffle v5.3.6
- Solidity v0.8.0
- Web3 v1.3.0
- Express v4.6.0
- Node v14

- These libraries are required for this project. I used more recent versions than in the course outline as I want my learning to be as current as possible.

## Optional Libraries
- Create React App. Used to provide a great starting point for the UI. As a Senior Front-End Developer who works daily with React, this is a great tool for getting a modern Front-End up and running quickly.

- Ganache. Used for local development before deploying my contracts to the Rinkeby Test Network. Used with Ganache UI as it provides useful real-time updates on transactions.

## Notes for Reviewer
- I reduced the amount needed to fund an airline from 10 Ether to 1 Ether to save on Testnet funds.
- I did the same for registering as an Oracle
