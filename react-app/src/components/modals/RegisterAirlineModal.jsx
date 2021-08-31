import React, { useState } from "react"
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { FormItem } from "../FormItem"
import "./RegisterAirlineModal.scss"

const RegisterAirlineModal = ({ isOpen, toggleModal, onAction, airline }) => {
  const [address, setAddress] = useState("")

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggleModal}
      className="RegisterAirlineModal"
    >
      <ModalHeader>Buy Insurance</ModalHeader>
      <ModalHeader>{`Airline: ${airline}`}</ModalHeader>
      <ModalBody>
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault()
            onAction(airline, address)
            setAddress("")
          }}
        >
          <FormItem
            name="airlineAddress"
            label="Address to Register"
            value={address}
            onChange={(value) => {
              setAddress(value)
            }}
            pattern="0x[a-fA-F0-9]{40}$"
            title="Must be a valid address. E.g. '0x..."
            type="text"
            isRequired
          />

          <div className="buttons">
            <button className="button buy" type="submit">
              <span>Register Airline</span>
            </button>
            <button
              className="button close"
              onClick={toggleModal}
              type="button"
            >
              <span>Close</span>
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default RegisterAirlineModal
