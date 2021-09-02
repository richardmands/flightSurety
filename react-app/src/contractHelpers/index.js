export async function getStatus({ instance, onSuccess }) {
  try {
    const status = await instance.methods.isOperational().call()
    const balance = await instance.methods.getBalance().call()
    onSuccess({ status, balance })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }
}

export async function changeStatus({
  status,
  instance,
  id,
  gasPrice,
  gasLimit,
  onSuccess,
  onError,
}) {
  try {
    await instance.methods.setIsOperational(status).send({
      from: id,
      value: 0,
      gasPrice,
      gasLimit,
    })
    const votes = await instance.methods.requiredVotesForStatusChange().call()
    onSuccess(votes)
  } catch (error) {
    console.log("🚀 ~ error", error)
    onError()
  }
}

export async function registerAirline({
  instance,
  id,
  airline,
  owner,
  gasLimit,
  gasPrice,
  onCompletion,
}) {
  try {
    await instance.methods.registerAirline(airline, owner.toLowerCase()).send({
      from: id,
      value: 0,
      gasPrice,
      gasLimit,
    })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }

  onCompletion()
}
export async function approveAirline({
  instance,
  id,
  airline,
  gasLimit,
  gasPrice,
  onCompletion,
}) {
  try {
    await instance.methods.approveAirline(airline).send({
      from: id,
      value: 0,
      gasPrice,
      gasLimit,
    })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }

  onCompletion()
}

export async function fundAirline({
  instance,
  airline,
  id,
  toWei,
  gasLimit,
  gasPrice,
  onCompletion,
}) {
  try {
    await instance.methods
      .fundAirline(airline)
      .send({ from: id, value: toWei("1", "ether"), gasPrice, gasLimit })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }

  onCompletion()
}

export async function registerFlight({ instance, id, flight, onCompletion }) {
  try {
    await instance.methods.registerFlight(flight).send({ from: id, value: 0 })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }

  onCompletion()
}

export async function checkFlightStatus({
  instance,
  id,
  flight,
  onCompletion,
}) {
  try {
    await instance.methods
      .fetchFlightStatus(flight)
      .send({ from: id, value: 0 })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }

  onCompletion()
}

export async function getRefund({ instance, id, onCompletion }) {
  try {
    await instance.methods.getRefund().send({ from: id, value: 0 })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }

  onCompletion()
}

export async function buyInsurance({
  instance,
  id,
  flight,
  amount,
  toWei,
  gasLimit,
  gasPrice,
  onCompletion,
}) {
  try {
    const value = toWei(amount.toString(), "ether")
    await instance.methods.buyInsurance(flight).send({
      from: id,
      value,
      gasPrice,
      gasLimit,
    })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }

  onCompletion()
}

export async function registerOracle({
  instance,
  id,
  toWei,
  gasLimit,
  gasPrice,
  onCompletion,
}) {
  try {
    const value = toWei("0.1", "ether")
    await instance.methods.registerOracle().send({
      from: id,
      value,
      gasPrice,
      gasLimit,
    })
  } catch (error) {
    console.log("🚀 ~ error", error)
  }

  onCompletion()
}
