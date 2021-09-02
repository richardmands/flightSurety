import React, { useEffect, useState } from "react"
import Loader from "react-loader-spinner"
import { ToastContainer, toast } from "react-toastify"

import "bootstrap/dist/css/bootstrap.min.css"
import "react-toastify/dist/ReactToastify.css"
import "./App.scss"

import useWeb3 from "./hooks/useWeb3"
import useContract from "./hooks/useContract"
import FlightSuretyApp from "./contracts/FlightSuretyApp.json"

import logo from "./plane.png"

import * as API from "./api"
import Flights from "./components/Flights"
import Airlines from "./components/Airlines"
import ContractControl from "./components/ContractControl"
import {
  getStatus,
  fundAirline,
  registerFlight,
  buyInsurance,
  checkFlightStatus,
  getRefund,
  registerAirline,
  approveAirline,
  changeStatus,
  registerOracle,
} from "./contractHelpers"
import BuyInsuranceModal from "./components/modals/BuyInsuranceModal"
import RegisterAirlineModal from "./components/modals/RegisterAirlineModal"

const makeToast = (text, happy) => {
  const options = {
    position: "top-right",
    autoClose: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  }

  return happy ? toast.success(text, options) : toast.error(text, options)
}

function App() {
  const [loading, setLoading] = useState(false)
  const [web3, accounts, gasPrice, gasLimit] = useWeb3(
    { amount: "5", unit: "shannon" },
    { amount: "5", unit: "lovelace" }
  )

  const account = (accounts && accounts[0]) || ""

  const [shouldUpdate, setShouldUpdate] = useState(false)
  const [instance, contractURI] = useContract({
    web3,
    smartContract: FlightSuretyApp,
    gasPrice,
    gasLimit,
    onSuccess: () => {
      setShouldUpdate(true)
      makeToast(`...${account.substr(-4)} connected to Smart Contract`, ":)")
    },
    onFailure: () => makeToast("Failed to connect to Smart Contract :("),
  })

  const [contractStatus, setContractStatus] = useState(false)
  const [contractBalance, setContractBalance] = useState("0")
  const [APIStatus, setAPIStatus] = useState("off")
  const [registerdOraclesCount, setRegisteredOracleCount] = useState(0)
  const [airlines, setAirlines] = useState(null)
  const [flights, setFlights] = useState(null)

  useEffect(() => {
    async function updateAPI() {
      setLoading(true)
      try {
        const { connectedToAPI, oracleCount } = await API.checkIsConnectedToAPI(
          {
            onSuccess: () => {},
            onFailure: () => {},
          }
        )

        if (connectedToAPI) {
          setAPIStatus("on")
        } else {
          setAPIStatus("off")
        }

        setRegisteredOracleCount(oracleCount)

        if (connectedToAPI) {
          await API.updateServer()
          setAirlines(await API.getAirlines())
          setFlights(await API.getFlights())
        }

        setShouldUpdate(false)
        setLoading(false)
      } catch (error) {
        console.log("🚀 ~ error", error)
        setLoading(false)
        setShouldUpdate(false)
      }
    }

    if (account && shouldUpdate) {
      getStatus({
        instance,
        onSuccess: (status) => {
          setContractStatus(status.status)
          setContractBalance(status.balance)
        },
      })
      updateAPI()
    }
  }, [shouldUpdate])

  const [votesRequired, setVotesRequired] = useState(0)
  const [statusChangeError, setStatusChangeError] = useState("")
  function handleChangeStatus() {
    setLoading(true)
    changeStatus({
      status: !contractStatus,
      instance,
      id: account,
      gasPrice,
      gasLimit,
      onSuccess: (votes) => {
        if (votes <= 0) {
          setShouldUpdate(true)
          setVotesRequired(0)
        } else {
          setVotesRequired(votes)
        }
        setLoading(false)
        setStatusChangeError("")
      },
      onError: () => {
        setStatusChangeError("You can't change the app status. Sorry!")
        setLoading(false)
      },
    })
  }

  function handleFundAirline(airline) {
    setLoading(true)
    fundAirline({
      instance,
      airline,
      id: account,
      toWei: web3.utils.toWei,
      gasLimit,
      gasPrice,
      onCompletion: () => {
        setLoading(false)
        setShouldUpdate(true)
      },
    })
  }

  function handleRegisterOracle() {
    setLoading(true)
    registerOracle({
      instance,
      id: account,
      toWei: web3.utils.toWei,
      gasLimit,
      gasPrice,
      onCompletion: () => {
        setLoading(false)
        setShouldUpdate(true)
      },
    })
  }

  function handleRegisterFlight(flight) {
    setLoading(true)
    registerFlight({
      instance,
      id: account,
      flight,
      onCompletion: () => {
        setLoading(false)
        setShouldUpdate(true)
      },
    })
  }

  function handleCheckFlightStatus(flight) {
    setLoading(true)
    checkFlightStatus({
      instance,
      id: account,
      flight,
      onCompletion: () => {
        setLoading(false)
        setShouldUpdate(true)
      },
    })
  }

  function handleGetRefund() {
    setLoading(true)
    getRefund({
      instance,
      id: account,
      onCompletion: () => {
        setLoading(false)
        setShouldUpdate(true)
      },
    })
  }

  const [buyInsuranceModalOpen, setBuyInsuranceModalOpen] = useState(false)
  const [flightToInsure, setFlightToInsure] = useState("")
  function handleBuyInsurance(flight) {
    setBuyInsuranceModalOpen(true)
    setFlightToInsure(flight)
  }

  const [registerAirlineModalOpen, setRegisterAirlineModalOpen] =
    useState(false)
  const [airlineToRegister, setAirlineToRegister] = useState("")
  function handleRegisterAirline(airline) {
    setRegisterAirlineModalOpen(true)
    setAirlineToRegister(airline)
  }

  function handleApproveAirline(airline) {
    setLoading(true)
    approveAirline({
      instance,
      id: account,
      airline,
      onCompletion: () => {
        setLoading(false)
        setShouldUpdate(true)
      },
    })
  }

  return (
    <div className="App">
      <ToastContainer />
      <BuyInsuranceModal
        isOpen={buyInsuranceModalOpen}
        toggleModal={() => setBuyInsuranceModalOpen(!buyInsuranceModalOpen)}
        flight={flightToInsure}
        onAction={(amount, flight) => {
          setLoading(true)
          setBuyInsuranceModalOpen(false)
          setFlightToInsure("")
          buyInsurance({
            instance,
            id: account,
            flight,
            amount,
            toWei: web3.utils.toWei,
            gasLimit,
            gasPrice,
            onCompletion: () => {
              setLoading(false)
              setShouldUpdate(true)
            },
          })
        }}
      />
      <RegisterAirlineModal
        isOpen={registerAirlineModalOpen}
        toggleModal={() =>
          setRegisterAirlineModalOpen(!registerAirlineModalOpen)
        }
        airline={airlineToRegister}
        onAction={(airline, owner) => {
          setLoading(true)
          setRegisterAirlineModalOpen(false)
          setAirlineToRegister("")
          registerAirline({
            instance,
            id: account,
            airline,
            owner,
            gasLimit,
            gasPrice,
            onCompletion: () => {
              setLoading(false)
              setShouldUpdate(true)
            },
          })
        }}
      />

      <header className="App-header">
        <div className="App-logoContainer">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <p>
          Flight Surety <br /> Richard Mands <br />
          Udacity Blockchain Nanodegree
        </p>
        <p className="explanation">
          See the code on{" "}
          <a
            href="https://github.com/richardmands/flightSurety"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </p>
        {contractURI ? (
          <p className="explanation">
            Deployed on Rinkeby Test Network <br />
            <a
              href={`https://rinkeby.etherscan.io/address/${contractURI}`}
              target="_blank"
              rel="noreferrer"
            >
              {contractURI}
            </a>
          </p>
        ) : (
          <p className="explanation">
            Not connected to smart contract. Make sure you have MetaMask
            installed and you're on the Rinkeby Test Network.
          </p>
        )}

        {APIStatus === "on" ? (
          <p className="explanation">
            Connected to API
            <br />
            The API hosts the Oracles and provides hard-coded flight information
            as well as a health-check endpoint.
          </p>
        ) : (
          <p className="explanation">
            Not connected to the API. Cannot access flight data. Please refresh
            and try again. Thanks!
          </p>
        )}
        <p className="explanation">
          This project has 2 kinds of users : Airlines and Passengers.
          <br />
          Airlines can be registered by existing Airlines, upto the 4th airline,
          then after that there must be consensus from 50% of existing Airlines.
          <br />
          Airlines must submit 10 Ethers to be able to participate.
          <br />
          Airlines have the ability to shut down the contract with 50%
          consensus.
          <br />
          Users can buy insurance for flights. <br />
          If, upon checking their flight status, a flight is listed as delayed,
          then the user is credited 1.5X their purchase which they can then
          withdraw. Flight status is checked against Oracles registed from the
          Back-End Server.
        </p>
      </header>

      {loading ? (
        <div className="LoaderFullScreen">
          <Loader
            type="Grid"
            color="#00BFFF"
            height={100}
            width={100}
            style={{ paddingTop: "20px", margin: "auto" }}
          />
        </div>
      ) : null}

      <div className="statuses">
        <div
          className={`contractStatus ${
            contractStatus ? "operational" : "notOperational"
          }`}
        >
          Contract: {`${contractStatus ? "Operational" : "Not Operational"}`}
          {contractStatus
            ? ` (${web3.utils.fromWei(contractBalance, "ether")} Ether)`
            : ""}
        </div>
        <div
          className={`apiStatus ${
            APIStatus === "on" ? "operational" : "notOperational"
          }`}
        >
          API: {`${APIStatus === "on" ? "Operational" : "Not Operational"}`}
          {APIStatus === "on"
            ? ` (${registerdOraclesCount} Oracles)`
            : " (Server might be waking up. Please reload)"}
        </div>
      </div>

      {web3 && accounts?.length ? (
        <>
          <div className="section">
            <ContractControl
              contractStatus={contractStatus}
              votesRequired={votesRequired}
              statusChangeError={statusChangeError}
              handleChangeStatus={handleChangeStatus}
            />
          </div>

          <div
            className={`section ${!contractStatus ? "disabledSection" : ""}`}
          >
            <Airlines
              airlines={airlines}
              account={account}
              fundAirline={handleFundAirline}
              registerAirline={handleRegisterAirline}
              approveAirline={handleApproveAirline}
              instance={instance}
            />
          </div>

          <div
            className={`section ${!contractStatus ? "disabledSection" : ""}`}
          >
            <Flights
              flights={flights}
              airlines={airlines}
              registerFlight={handleRegisterFlight}
              buyInsurance={handleBuyInsurance}
              checkStatus={handleCheckFlightStatus}
              getRefund={handleGetRefund}
              registerOracle={handleRegisterOracle}
              account={account}
              fromWei={web3.utils.fromWei}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

export default App
