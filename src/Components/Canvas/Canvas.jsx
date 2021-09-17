import { useCanvas } from '../../Hooks/useCanvas'
import '../../styles/canvas.css'

const Canvas = () => {

    const {canvasRef, canvas, parentRef, width, height } = useCanvas()  
    return (
        <section ref={parentRef} style={{ width: '100vw', height: '80vh', backgroundColor: 'white', borderRadius: '10px' }}>
        <canvas 
        ref={canvasRef} width={width} height={height} ></canvas>
        <input type="color" onChange={ evt => canvas.freeDrawingBrush.color = evt.target.value } />
        <input type="range" min='1' max='50' defaultValue='1' onChange={ evt => canvas.freeDrawingBrush.width = evt.target.value} />
        </section>
    )
}

export default Canvas
