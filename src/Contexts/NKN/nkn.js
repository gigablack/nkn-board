import { useEffect, useState, useContext, createContext } from 'react'
import nkn from 'nkn-sdk'

const NknContext = createContext()

const useWallet = () => {
    const [wallet, setWallet] = useState(null)
    useEffect(() => {
        setWallet(new nkn.Wallet({ rpcServerAddr: 'http://mainnet-seed-0001.nkn.org:30003' }))
    },[])

    return wallet
}

const useClient = () => {
    const [client, setClient] = useState(null)
    const [isConnected,setIsConnected] = useState(false)
    const wallet = useWallet()
    const publishTo = async (topic,payload) => {
        try {

            return await client.publish(topic,JSON.stringify(payload))
        } catch (err) {
            console.log(err)
        }
    }
    const subscribeTo = async topic => {
        try {
            return await client.subscribe(topic,400000)
        } catch (err) {
            console.log(err)
        }
    }
    const unSubscribe = async topic => {
        try {
            return await client.unsubscribe(topic)
        } catch (err) {
            console.log(err)
        }
    }
    const sendTo = async (user,payload) => {
        try {
            
            return await client.send(user, JSON.stringify(payload))
        } catch (err) {
            console.log(err)
        }
    }
    const getSubscribers = async topic => {
        try {
            return await client.getSubscribers(topic)
        } catch (err) {
            console.log(err)
        }
    }
    const getSubscription = async topic => {
        try {
            return await client.getSubscription(topic,client.addr)
        } catch (err) {
            console.log(err)
        }
    }
    const onMessageType = (type, handler) => {
        window.addEventListener(type, handler)
    }
    useEffect(() => {
        if (wallet) {

            setClient( new nkn.MultiClient({ seed: wallet.getSeed() }) )
        }
    }, [wallet])
    useEffect(() => {
        if (client) {
            client.onConnect(() => {
                setIsConnected(true)
            })
            client.onMessage(({src, payload}) => {
                const data = JSON.parse(payload)
                data.user = src
                window.dispatchEvent(new CustomEvent(data.type,{ detail: data }))
            })
        }
    },[client])

    return {
        client,
        wallet,
        isConnected,
        publishTo,
        subscribeTo,
        unSubscribe,
        sendTo,
        onMessageType,
        getSubscribers,
        getSubscription
    }
}

export const NknProvider = ({children}) => {
    const nkn = useClient()
    return (
        <NknContext.Provider value={nkn}>{ children }</NknContext.Provider>
    )
}

export const useNkn = () => {
    return useContext(NknContext)
}
