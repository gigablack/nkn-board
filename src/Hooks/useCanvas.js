import {useRef, useEffect, useState} from 'react'
import { useLocation } from 'react-router-dom'
import {useNkn} from '../Contexts/NKN/nkn'
import { CANVAS_CHANGE } from '../MessageTypes/types'
import { fabric } from 'fabric'


export const useCanvas = () => {
    const canvasRef = useRef()
    const parentRef = useRef()
    const location = useLocation()
    const [canvas,setCanvas] = useState(null)
    const [width, setWidth ] = useState(300)
    const [height, setHeight] = useState(150)
    const [topic,setTopic] = useState('')
    const {onMessageType, publishTo,getSubscription, isConnected,unSubscribe, subscribeTo} = useNkn()
    const noDuplicate = (arr1, arr2) => {
        let newArr = [...arr1]
        for (let el2 of arr2) {
            let isEqual = false
            for (let el1 of arr1) {
                if (JSON.stringify(el1) === JSON.stringify(el2)) {
                    isEqual = true
                }
            }
            if (!isEqual) {
                newArr.push(el2)
            }
        }
        return newArr
    }
    const testingSubscription = async topic => {
        try {
            console.log(await getSubscription(topic))
        } catch (err) {
            console.log(err)
        }
    }
    const subscribing = async topic => {
        try {
            console.log(await subscribeTo(topic))
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        if (isConnected) {
            const savedTopic = location.pathname.slice(1)
            if (savedTopic !== localStorage.getItem('subscription')) unSubscribe(localStorage.getItem('subscription'))
            setTopic(savedTopic)
            subscribing(savedTopic)
            localStorage.setItem('subscription', savedTopic)
            setCanvas(new fabric.Canvas(canvasRef.current))
        }
    }, [canvasRef,isConnected])


    useEffect(() => {
        if (canvas) {
            canvas.isDrawingMode = true
            const interval = setInterval(async () => {
                let subs = await getSubscription(topic)
                console.log('CONNECTING WITH PEERS...')
                if (subs?.expiresAt > 0) {
                    console.log(subs)
                    console.log('SUBSCRIBED')
                    clearInterval(interval)
                }
            },1000)
            canvas.on('path:created', opt => {
                publishTo(topic,{ type: CANVAS_CHANGE, state: canvas })
            })
            onMessageType(CANVAS_CHANGE, evt => {
                const oldCanvas = canvas.toObject()
                const newCanvas = Object.assign({}, oldCanvas, {
                    objects: noDuplicate(oldCanvas.objects,evt.detail.state.objects)
                })

                canvas.loadFromJSON(newCanvas)
            })

            window.addEventListener('resize', () => {

                const { width: parentWidth, height: parentHeight } = parentRef.current.getBoundingClientRect()
                setWidth(parentWidth)
                setHeight(parentHeight)
                canvas.renderAll()
            })
        }
    },[canvas])

    useEffect(() => {
        if (parentRef) {
        }
    }, [parentRef, canvasRef])
    useEffect(() => {

        const {width: parentWidth, height: parentHeight} = parentRef.current.getBoundingClientRect()
        setWidth(parentWidth)
        setHeight(parentHeight)
    },[])
    return {
        canvasRef,
        canvas,
        parentRef,
        height,
        width
    }
}
