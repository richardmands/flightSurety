# Flight Surety Dapp
My Version of Udacity Flight Surety App
This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (React) and server app scaffolding (Express).

## App deployed on Netlify
https://flightsurety.netlify.app/
## Repo for server deployed to heroku
https://flightsuretyserver.herokuapp.com/

https://github.com/richardmands/flightSuretyServer
## See contract on Rinkeby
https://rinkeby.etherscan.io/address/0x1b4D8b9bb36C5EDF0580ADF50E73FF255e3dd8d3
## Contract deployment transaction
https://rinkeby.etherscan.io/tx/0x0e9a4b293e9aebebce03d765c7d823a2d84971a4d5464f025fa9125f48f352ba

## App Summary
You can :
- Assign yourself roles.
- Carry out actions on crops depending on your role and whether you own the crop in question.
- See details of a crop.
- See the full transaction history of the contract.
- Transfer stars to another address.
- Put stars up for sale.
- Buy stars that are available for sale.
- Options change depending on whether you are the owner of the star that is listed.

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
