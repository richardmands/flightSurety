import { useState, useEffect } from "react"

function useContract({
  web3,
  smartContract,
  gasPrice,
  gasLimit,
  onSuccess,
  onFailure,
}) {
  const [contract, setContract] = useState(null)
  const [contractURI, setContractURI] = useState(null)

  useEffect(() => {
    async function prepareContract() {
      try {
        setContract(null)
        const networkId = await web3.eth.net.getId()
        const deployedContract = smartContract.networks[networkId]
        if (!deployedContract) {
          onFailure()
        } else {
          const instance =
            deployedContract &&
            new web3.eth.Contract(
              smartContract.abi,
              deployedContract && deployedContract.address,
              { gasPrice, gasLimit }
            )
          setContract(instance)
          const { _address: uri } = instance
          setContractURI(uri)
          onSuccess()
        }
      } catch (error) {
        onFailure()
        console.error(error)
      }
    }

    if (web3 && gasPrice > 0 && gasLimit > 0) {
      prepareContract()
    }
  }, [web3, gasPrice, gasLimit])

  return [contract, contractURI]
}

export default useContract
