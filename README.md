# Flight Surety Dapp
My Version of Udacity Flight Surety App
This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (React) and server app scaffolding (Express).

## App deployed on Netlify
https://flightsurety.netlify.app/
## Server deployed to Heroku from separate repo
https://flightsuretyserver.herokuapp.com/

https://github.com/richardmands/flightSuretyServer
## See App Contract on Rinkeby
https://rinkeby.etherscan.io/address/0xe3b63cac781d93233046e0df7cda01d172823cba
## App Contract deployment transaction
https://rinkeby.etherscan.io/tx/0x132734dde18f81780713e62dcf5b69fe47e4cf64a23d389544a013d9df9cd4d0
## See Data Contract on Rinkeby
https://rinkeby.etherscan.io/address/0xE4b4C3FD06c3BB63D994027075cB4Ba7DF91CDEb
## Data Contract deployment transaction
https://rinkeby.etherscan.io/tx/0x6a7ae32fd29d57e66cb86fde7e09a0952f0eae1aa7f0030db1282176d5fb0402

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
