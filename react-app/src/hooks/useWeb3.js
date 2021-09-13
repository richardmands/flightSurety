import { useState, useEffect } from "react"
import Web3 from "web3"

function useWeb3(gp, gl) {
  const [connectedWeb3, setConnectedWeb3] = useState(null)
  const [preparingWeb3, setPreparingWeb3] = useState(false)
  const [accounts, setAccounts] = useState(null)
  const [gasPrice, setGasPrice] = useState(0)
  const [gasLimit, setGasLimit] = useState(0)

  const getWeb3 = () =>
    new Promise((resolve, reject) => {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      window.addEventListener("load", async () => {
        async function reloadWeb3() {
          const web3 = new Web3(window.ethereum)
          try {
            await window.ethereum.enable()
            resolve(web3)
          } catch (error) {
            reject(error)
          }
          setConnectedWeb3(web3)
        }
        try {
          if (window.ethereum) {
            const web3 = new Web3(window.ethereum)
            window.web3 = web3
            resolve(web3)

            window.ethereum.on("accountsChanged", async (data) => {
              console.log("🚀 ~ accountsChanged")
              await reloadWeb3()

              setAccounts(data)
            })

            window.ethereum.on("chainChanged", async () => {
              console.log("🚀 ~ chainChanged")
              await reloadWeb3()
            })

            window.ethereum.on("disconnect", async () => {
              console.log("🚀 ~ disconnect")
              await reloadWeb3()
            })

            window.ethereum.on("connect", async () => {
              console.log("🚀 ~ connect")
              await reloadWeb3()
            })
          }
        } catch (error) {
          reject(error)
        }
      })
    })

  useEffect(() => {
    async function prepareWeb3() {
      setPreparingWeb3(true)
      try {
        const web3 = await getWeb3()
        const userAccounts = await web3.eth.getAccounts()
        if (userAccounts.length) {
          setConnectedWeb3(web3)
          setAccounts(userAccounts)
          setGasPrice(web3 && Number(web3.utils.toWei(gp.amount, gp.unit)))
          setGasLimit(web3 && Number(web3.utils.toWei(gl.amount, gl.unit)))
        }
      } catch (error) {
        console.log("🚀 ~ error", error)
      }
      setPreparingWeb3(false)
    }

    if (!connectedWeb3 && !preparingWeb3) {
      prepareWeb3()
    }
  }, [gp, gl])

  return [connectedWeb3, accounts, gasPrice, gasLimit]
}

export default useWeb3
