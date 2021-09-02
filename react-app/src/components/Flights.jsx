import React from "react"
import "./Flights.scss"

const Flights = ({
  flights,
  registerFlight,
  buyInsurance,
  checkStatus,
  getRefund,
  account,
  fromWei,
  // registerOracle,
}) => {
  const sortedFlights = flights?.sort((a, b) =>
    a?.time?.toLowerCase().localeCompare(b?.time?.toLowerCase())
  )
  const activeFlights = sortedFlights?.filter((flight) => flight.active)
  const registeredFlights = sortedFlights?.filter(
    (flight) => flight.registeredAirline && !flight.active
  )
  const unregisteredFlights = sortedFlights?.filter(
    (flight) => !flight.registeredAirline && !flight.active
  )

  return (
    <div className="FlightsContainer">
      <h2>Buy Flight Insurance</h2>
      {/* <h3>Register Oracle</h3>
      <button
        type="button"
        className="button registerOracle"
        onClick={registerOracle}
        onKeyPress={registerOracle}
        tabIndex={0}
      >
        <span>Register</span>
      </button> */}

      <h3>Available Flights</h3>
      <h5>Register a flight to make it available for purchase.</h5>
      <h5>
        After you've purchased, check in with our registered oracles to find out
        the flight status.
      </h5>
      <h5>
        If the flight status comes up as LATE AIRLINE, you'll be able to collect
        a refund at 1.5 times what you paid.
      </h5>

      {activeFlights?.length > 0 ? (
        <div className="Flights">
          <table className="flightsTable">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Time</th>
                <th>Register</th>
                <th>Status</th>
                <th>Check</th>
              </tr>
            </thead>
            <tbody>
              {activeFlights.map((flight) => (
                <tr key={flight.flight}>
                  <td>{flight.flight}</td>
                  <td>{flight.time}</td>
                  {(() => {
                    const insured = flight.insurees.find(
                      (insuree) =>
                        insuree[0].toLowerCase() === account.toLowerCase()
                    )
                    if (insured) {
                      return (
                        <td className="text">
                          <span>
                            Purchased for {fromWei(insured[1], "ether")} Ether
                          </span>
                        </td>
                      )
                    }

                    if (flight.active && !flight.registered) {
                      return (
                        <td
                          className={`button register ${
                            flight.active ? "" : "disabled"
                          }`}
                        >
                          <span
                            onClick={() => registerFlight(flight.flight)}
                            onKeyPress={() => registerFlight(flight.flight)}
                            tabIndex={0}
                            role="button"
                          >
                            Register this Flight?
                          </span>
                        </td>
                      )
                    }

                    if (flight.active && flight.registered) {
                      return (
                        <td
                          className={`button buy ${
                            flight.active ? "" : "disabled"
                          }`}
                        >
                          <span
                            onClick={() => buyInsurance(flight.flight)}
                            onKeyPress={() => buyInsurance(flight.flight)}
                            role="button"
                            tabIndex={0}
                          >
                            Buy Insurance?
                          </span>
                        </td>
                      )
                    }

                    return (
                      <td>
                        <span> </span>
                      </td>
                    )
                  })()}
                  {(() => {
                    const statusCodeMap = {
                      0: "UNKNOWN",
                      10: "ON TIME",
                      20: "LATE AIRLINE",
                      30: "LATE WEATHER",
                      40: "LATE TECHNICAL",
                      50: "LATE OTHER",
                    }

                    return (
                      <td className="text">
                        <span>{statusCodeMap[flight.statusCode]}</span>
                      </td>
                    )
                  })()}
                  {(() => {
                    const insured = flight.insurees.find(
                      (insuree) =>
                        insuree[0].toLowerCase() === account.toLowerCase()
                    )
                    if (insured && !flight.statusChecked) {
                      return (
                        <td
                          className={`button register ${
                            flight.active ? "" : "disabled"
                          }`}
                        >
                          <span
                            onClick={() => checkStatus(flight.flight)}
                            onKeyPress={() => checkStatus(flight.flight)}
                            tabIndex={0}
                            role="button"
                          >
                            Check status?
                          </span>
                        </td>
                      )
                    }

                    if (insured && flight.statusCode === "20") {
                      return (
                        <td
                          className={`button register ${
                            flight.active ? "" : "disabled"
                          }`}
                        >
                          <span
                            onClick={() => getRefund()}
                            onKeyPress={() => getRefund()}
                            tabIndex={0}
                            role="button"
                          >
                            Collect Refund
                          </span>
                        </td>
                      )
                    }

                    if (insured) {
                      return (
                        <td
                          className={`button register ${
                            flight.active ? "" : "disabled"
                          }`}
                        >
                          <span
                            onClick={() => checkStatus(flight.flight)}
                            onKeyPress={() => checkStatus(flight.flight)}
                            tabIndex={0}
                            role="button"
                          >
                            {flight.statusChecked
                              ? "Check again?"
                              : "Check status"}
                          </span>
                        </td>
                      )
                    }

                    return (
                      <td>
                        <span> </span>
                      </td>
                    )
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="Flights">No Flights...</div>
      )}

      <h3>Flights awaiting Registered Airline activation</h3>
      {registeredFlights?.length > 0 ? (
        <div className="Flights">
          <table className="flightsTable">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Departure Time</th>
              </tr>
            </thead>
            <tbody>
              {registeredFlights.map((flight) => (
                <tr key={flight.flight}>
                  <td>{flight.flight}</td>
                  <td>{flight.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="Flights">No Flights...</div>
      )}

      <h3>Unregistered Flights</h3>
      {unregisteredFlights?.length > 0 ? (
        <div className="Flights">
          <table className="flightsTable">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Departure Time</th>
              </tr>
            </thead>
            <tbody>
              {unregisteredFlights.map((flight) => (
                <tr key={flight.flight}>
                  <td>{flight.flight}</td>
                  <td>{flight.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="Flights">No Flights...</div>
      )}
    </div>
  )
}

export default Flights
