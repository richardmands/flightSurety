import React, { useState } from "react"
import { Modal, ModalHeader, ModalBody } from "reactstrap"
import { FormItem } from "../FormItem"
import "./BuyInsuranceModal.scss"

const BuyInsuranceModal = ({ isOpen, toggleModal, onAction, flight }) => {
  const [amount, setAmount] = useState(0.001)
  return (
    <Modal isOpen={isOpen} toggle={toggleModal} className="BuyInsuranceModal">
      <ModalHeader>Buy Insurance</ModalHeader>
      <ModalHeader>{`Flight: ${flight}`}</ModalHeader>
      <ModalBody>
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault()
            onAction(amount, flight)
            setAmount(0.001)
          }}
        >
          <FormItem
            name="productPrice"
            label="Amount (max 0.1 Ether)"
            value={amount}
            onChange={setAmount}
            placeholder="0.1"
            type="number"
            isRequired
            min="0.001"
            max="0.1"
            step="0.0001"
            precision={2}
          />

          <div className="buttons">
            <button className="button buy" type="submit">
              <span>Buy Insurance</span>
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

export default BuyInsuranceModal
