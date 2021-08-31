import Web3 from "web3"
import express from "express"

import cors from "cors"
import Config from "./config.json"
import FlightSuretyApp from "../react-app/src/contracts/FlightSuretyApp.json"
import FlightSuretyData from "../react-app/src/contracts/FlightSuretyData.json"

let web3
let flightSuretyApp
let flightSuretyData
const gasPrice = web3 && Number(web3.utils.toWei("5", "shannon"))
const gasLimit = web3 && Number(web3.utils.toWei("5", "lovelace"))
let oracles = []
let flights
let airlines
let registeredAirlineCodes = []
let activeAirlineCodes = []
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

async function getRegisteredAirlines() {
  try {
    const airlinesList = await flightSuretyApp.methods.getAirlinesList().call()
    airlines = await Promise.all(
      airlinesList.map((airline) =>
        flightSuretyApp.methods.getAirlineDetails(airline).call()
      )
    )
    registeredAirlineCodes = airlines.map((airline) => airline[2])
    activeAirlineCodes = airlines
      .filter((airline) => airline[3])
      .map((airline) => airline[2])
  } catch (error) {
    console.log("🚀 ~ error", error)
  }
}

function generateFlights(prependedCodes = airlineCodes) {
  const arr = []
  const flightNumbers = []
  Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
  }

  const generateFlightNumber = () =>
    Math.floor(Math.random() * 999 + 100).toString()
  for (let index = 0; index < 40; index++) {
    const prependCode = prependedCodes.random()

    let flightNumber = generateFlightNumber()
    while (flightNumbers.includes(flightNumber)) {
      flightNumber = generateFlightNumber()
    }
    flightNumbers.push(flightNumber)

    const hours = Math.floor(((Math.random() * 23) | 0) + 1).toString()
    const mins = Math.floor(((Math.random() * 59) | 0) + 1).toString()

    arr.push({
      flight: `${prependCode}-${flightNumber}`,
      time: `${hours.length === 1 ? `0${hours}` : hours}:${
        mins.length === 1 ? `0${mins}` : mins
      }`,
    })
  }

  flights = arr
}

async function updateFlights() {
  try {
    const statuses = await Promise.all(
      flights.map((flight) =>
        flightSuretyApp.methods.getRegisteredFlight(flight.flight).call()
      )
    )
    const updatedFlights = flights.map((flight, i) => {
      const airline = flight.flight.split("-")[0]
      const registeredAirline = registeredAirlineCodes.includes(airline)
      const active = activeAirlineCodes.includes(airline)

      const { registered, insured, insurees, statusCode, statusChecked } =
        statuses[i]

      const updatedFlight = {
        ...flight,
        active,
        registeredAirline,
        registered,
        insured,
        insurees,
        statusCode,
        statusChecked,
      }
      return updatedFlight
    })

    flights = updatedFlights
  } catch (error) {
    console.log("🚀 ~ error", error)
  }
}

async function registerEvents() {
  flightSuretyData.events.Voted(
    {
      fromBlock: 0,
    },
    (error, event) => {
      if (error) console.log(error)
      console.log(event)
    }
  )

  flightSuretyData.events.Received(
    {
      fromBlock: 0,
    },
    (error, event) => {
      if (error) console.log(error)
      console.log(event)
    }
  )

  flightSuretyApp.events.FlightStatusInfo(
    {
      fromBlock: 0,
    },
    (error, event) => {
      if (error) console.log(error)
      console.log(event)
    }
  )

  flightSuretyData.events.CreditPaid(
    {
      fromBlock: 0,
    },
    (error, event) => {
      if (error) console.log(error)
      console.log(event)
    }
  )

  flightSuretyApp.events.OracleReport(
    {
      fromBlock: 0,
    },
    (error, event) => {
      if (error) console.log(error)
      console.log(event)
    }
  )

  flightSuretyApp.events.OracleRequest(
    {
      fromBlock: 0,
    },
    async (error, event) => {
      if (error) console.log(error)

      if (event && oracles.length) {
        try {
          const { index, flight } = event.returnValues
          const hasIndexOracles = oracles.filter((oracle) =>
            oracle.indexes.includes(index)
          )
          const statusCodes = [0, 10, 20, 30, 40, 50]
          const statusCode =
            statusCodes[Math.floor(Math.random() * statusCodes.length)]

          if (hasIndexOracles.length) {
            await Promise.all(
              hasIndexOracles.map((oracle) =>
                flightSuretyApp.methods
                  .submitOracleResponse(index, flight, statusCode)
                  .send({ from: oracle.account, value: 0, gasPrice, gasLimit })
              )
            )
          }
        } catch (err) {
          console.log("🚀 ~ err", err)
        }
      }
    }
  )
}

async function update(res) {
  await getRegisteredAirlines()
  await updateFlights()
  res.send()
}

async function registerOracles(oracleAccounts, res) {
  try {
    const fee = await flightSuretyApp.methods.REGISTRATION_FEE().call()
    console.log("🚀 ~ fee", fee, web3.utils.fromWei(fee, "ether"))

    await Promise.all(
      oracleAccounts.map(async (account) => {
        try {
          const existingOracle = await flightSuretyApp.methods
            .getOracle()
            .call({ from: account })
          console.log("🚀 ~ existingOracle", existingOracle)
          if (
            existingOracle.isRegistered &&
            !oracles.find((oracle) => oracle.account === account)
          ) {
            oracles = [...oracles, { ...existingOracle, account }]
          } else {
            await flightSuretyApp.methods.registerOracle().send({
              from: account,
              value: fee,
              gasPrice,
              gasLimit,
            })
            const newOracle = await flightSuretyApp.methods
              .getOracle()
              .call({ from: account })
            console.log("🚀 ~ newOracle", newOracle)
            oracles = [...oracles, { ...newOracle, account }]
          }
        } catch (error) {
          console.log("🚀 ~ error: Couldn't register Oracle: ", account, error)
        }
      })
    )
  } catch (error) {
    console.log("🚀 ~ Couldn't register Oracles", error)
  }

  console.log("🚀 ~ oracles", oracles)
  res.send()
}

async function setup() {
  console.log("🚀 ~ process.env.GANACHE_URL", process.env.GANACHE_URL)
  generateFlights()
  try {
    const config = Config.localhost

    web3 = new Web3(process.env.GANACHE_URL.toLowerCase().replace("http", "ws"))
    const userAccounts = await web3.eth.getAccounts()
    web3.eth.defaultAccount = userAccounts[0]

    flightSuretyData = new web3.eth.Contract(
      FlightSuretyData.abi,
      config.dataAddress,
      {
        gasPrice: Number(web3.utils.toWei("5", "shannon")),
        gasLimit: Number(web3.utils.toWei("5", "lovelace")),
      }
    )

    flightSuretyApp = new web3.eth.Contract(
      FlightSuretyApp.abi,
      config.appAddress,
      {
        gasPrice: Number(web3.utils.toWei("5", "shannon")),
        gasLimit: Number(web3.utils.toWei("5", "lovelace")),
      }
    )

    const fee = await flightSuretyApp.methods.REGISTRATION_FEE().call()
    console.log(
      "🚀 ~ Oracle Registration Fee",
      fee,
      web3.utils.fromWei(fee, "ether")
    )

    await registerEvents()
    await getRegisteredAirlines()
    await updateFlights()
  } catch (error) {
    console.error("Something went wrong setting up the server!", error)
  }
}

setup()

const app = express()
app.use(express.json())
app.use(cors())

app.get("/api/status", (req, res) => {
  console.log("🚀 ~ /api/status")
  res.send({ running: true, oracleCount: oracles.length })
})
app.get("/api/airlines", (req, res) => {
  console.log("🚀 ~ /api/airlines")
  res.send({
    airlineCodes,
    airlines,
    registeredAirlineCodes,
    activeAirlineCodes,
  })
})
app.get("/api/flights", (req, res) => {
  console.log("🚀 ~ /api/flights")
  res.send(flights)
})
app.post("/api/update", (req, res) => {
  console.log("🚀 ~ /api/update")
  update(res)
})
app.post("/api/oracles/register", (req, res) => {
  console.log("🚀 ~ /api/oracles/register")
  registerOracles(JSON.parse(req.body.oracleAccounts), res)
})

export default app
