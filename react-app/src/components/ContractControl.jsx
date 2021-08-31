import React from "react"
import "./ContractControl.scss"

const ContractControl = ({
  contractStatus,
  votesRequired,
  statusChangeError,
  handleChangeStatus,
}) => (
  <div className="ContractControlContainer">
    <h2>Contract Status</h2>
    <h5>
      {contractStatus ? "Contract is turned on." : "Contract is turned off."}{" "}
      Funded airline owners can turn the app off and on. If there are 4 or more
      owners, it requires 50% of the owners to carry out the app status change.
    </h5>
    {votesRequired ? <h5>{`${votesRequired} more votes required.`}</h5> : null}
    {statusChangeError ? <h5>{`${statusChangeError}`}</h5> : null}
    <button
      type="button"
      className={`button ${contractStatus ? "off" : "on"}`}
      onClick={handleChangeStatus}
      onKeyPress={handleChangeStatus}
      tabIndex={0}
    >
      <span>{contractStatus ? "Turn Off?" : "Turn On?"}</span>
    </button>
  </div>
)

export default ContractControl
