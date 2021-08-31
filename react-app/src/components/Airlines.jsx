import React, { useEffect, useState } from "react"
import "./Airlines.scss"

const Airlines = ({
  airlines,
  account,
  fundAirline,
  registerAirline,
  approveAirline,
  instance,
}) => {
  const ownedAirlines =
    airlines?.airlines?.filter(
      (airline) => airline[0].toLowerCase() === account.toLowerCase()
    ) || []

  const hasFunded = !!ownedAirlines.find((airline) => airline[3])

  const activeAirlines =
    airlines?.airlineCodes?.filter((airline) =>
      airlines.activeAirlineCodes.includes(airline)
    ) || []

  const awaitingFundingAirlines =
    airlines?.airlineCodes?.filter((airline) => {
      const exists = airlines?.airlines?.find((arln) => airline === arln[2])
      return exists && exists[1] && !exists[3]
    }) || []

  const awaitingRegistrationApprovalAirlines =
    airlines?.airlineCodes?.filter((airline) => {
      const exists = airlines?.airlines?.find((arln) => airline === arln[2])
      return exists && !exists[1]
    }) || []

  const [alreadyVotedAirlines, setAlreadyVotedAirlines] = useState([])
  useEffect(() => {
    async function getVotingStatus() {
      const votingList = await Promise.all(
        awaitingRegistrationApprovalAirlines.map((airline) =>
          instance.methods.checkHasVoted(airline).call({ from: account })
        )
      )

      setAlreadyVotedAirlines(
        awaitingRegistrationApprovalAirlines.filter(
          (airline, i) => votingList[i]
        )
      )
    }

    if (awaitingRegistrationApprovalAirlines.length) {
      setAlreadyVotedAirlines([])
      getVotingStatus()
    }
  }, [account, airlines])

  const unownedAirlines =
    airlines?.airlineCodes.filter((airline) => {
      const exists = airlines?.airlines?.find((arln) => airline === arln[2])
      return !exists
    }) || []

  return (
    <div className="AirlinesContainer">
      <h2>Airlines</h2>

      <h3>Your Airlines</h3>
      {ownedAirlines.length > 0 ? (
        <div className="Airlines">
          {ownedAirlines.map((airline) => (
            <div className="yourAirlines" key={airline[2]}>
              <div className="airlineCard airlineStatus">
                Name: {airline[2]}
                <br />
                Active: {`${airline[3] ? "Yes" : "No"}`}
              </div>

              {airline[1] && !airline[3] ? (
                <div
                  className="airlineCard available"
                  onClick={() => fundAirline(airline[2])}
                  onKeyPress={() => fundAirline(airline[2])}
                  tabIndex={0}
                  role="button"
                >
                  <span>Fund your Airline?</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="Airlines">
          You haven't been registered an Airline yet. Ask an owner of an active
          airline to nominate you as owner of an airline.
        </div>
      )}

      <h3>Active Airlines</h3>
      <h5>Airlines which are registered and funded.</h5>
      {activeAirlines.length > 0 ? (
        <div className="Airlines">
          {activeAirlines
            .sort((a, b) => a.localeCompare(b))
            .map((airline) => (
              <div className="airlineCard" key={airline}>
                <span>{airline}</span>
              </div>
            ))}
        </div>
      ) : (
        <div className="Airlines">No Airlines...</div>
      )}

      <h3>Airlines Awaiting Funding</h3>
      <h5>Airlines which are registered but not yet funded.</h5>
      {awaitingFundingAirlines.length > 0 ? (
        <div className="Airlines">
          {awaitingFundingAirlines
            .sort((a, b) => a.localeCompare(b))
            .map((airline) => (
              <div className="airlineCard" key={airline}>
                <span>{airline}</span>
              </div>
            ))}
        </div>
      ) : (
        <div className="Airlines">No Airlines...</div>
      )}

      <h3>Airlines Awaiting Registration Approval</h3>
      <h5>
        Airlines that have a nominated registered owner but are awaiting
        multi-party sign-off.
      </h5>
      {awaitingRegistrationApprovalAirlines.length > 0 ? (
        <div className="Airlines">
          {awaitingRegistrationApprovalAirlines
            .sort((a, b) => a.localeCompare(b))
            .map((airline) => {
              const alreadyVoted = alreadyVotedAirlines.includes(airline)
              const details = airlines.airlines.find(
                (arln) => arln[2] === airline
              )
              const votesRequired = details[5] - details[4]

              return (
                <div className="yourAirlines" key={airline}>
                  <div className="airlineCard" key={airline}>
                    <span>{`${airline} (${votesRequired})`}</span>
                  </div>
                  {hasFunded && !alreadyVoted ? (
                    <div
                      className="airlineCard available"
                      onClick={() => approveAirline(airline)}
                      onKeyPress={() => approveAirline(airline)}
                      tabIndex={0}
                      role="button"
                    >
                      <span>Approve this Airline?</span>
                    </div>
                  ) : null}
                </div>
              )
            })}
        </div>
      ) : (
        <div className="Airlines">No Airlines...</div>
      )}

      <h3>Inactive Airlines</h3>
      <h5>Airlines with no nominated owner.</h5>
      {unownedAirlines.length > 0 ? (
        <div className="Airlines">
          {unownedAirlines
            .sort((a, b) => a.localeCompare(b))
            .map((airline) => {
              const registered =
                airlines?.registeredAirlineCodes?.includes(airline)
              return (
                <div
                  className={`airlineCard ${
                    !hasFunded || registered ? "" : "available"
                  } `}
                  key={airline}
                  onClick={() => registerAirline(airline)}
                  onKeyPress={() => registerAirline(airline)}
                  tabIndex={0}
                  role="button"
                >
                  <span>{airline}</span>
                </div>
              )
            })}
        </div>
      ) : (
        <div className="Airlines">No Airlines...</div>
      )}
    </div>
  )
}

export default Airlines
