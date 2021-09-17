import tw from 'twin.macro'
import Canvas from '../Components/Canvas/Canvas'

const Main = tw.main`
h-screen bg-blue-500
`

const Editor = () => {
    return (
        <Main>
            <Canvas />
        </Main>
    )
}

export default Editor
