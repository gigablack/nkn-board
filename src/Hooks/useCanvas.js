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
    const destinations = useRef([])
    const [readyDestinations,setReadyDestinations] = useState(false)
    const {onMessageType, publishTo, getSubscribers, isConnected,unSubscribe, subscribeTo, sendTo, client} = useNkn()
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
    const getDestinations = async topic => {
        try {
            let res = await getSubscribers(topic)
            destinations.current = [...res.subscribers,client.addr]
            setReadyDestinations(true)
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        if (isConnected) {
            const topic = location.pathname.slice(1)
            if (topic !== localStorage.getItem('subscription')) unSubscribe(localStorage.getItem('subscription'))
            getDestinations(topic)
            subscribeTo(topic)
            localStorage.setItem('subscription', topic)
            setCanvas(new fabric.Canvas(canvasRef.current))
        }
    }, [canvasRef,isConnected])

    useEffect(() => {
        if(readyDestinations) console.log(destinations.current)
    },[readyDestinations,destinations])

    useEffect(() => {
        if (canvas) {
            canvas.isDrawingMode = true
            canvas.on('path:created', opt => {
                sendTo(destinations.current,{ type: CANVAS_CHANGE, state: canvas })
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
