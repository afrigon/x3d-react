import { CSSProperties, RefObject, useEffect, useRef } from "react"
import { Renderer } from "x3d"

interface Canvas3dProps {
    renderer: Renderer
    className?: string
    style?: CSSProperties
}

export default function Canvas3d({ renderer, className, style }: Canvas3dProps) {
    const ref: RefObject<HTMLCanvasElement | null> = useRef(null)

    useEffect(() => {
        const canvas = ref.current

        if (!canvas) {
            return
        }

        const gl = canvas.getContext("webgl2")

        if (!gl) {
            return
        }

        let frameId: number

        function _resize() {
            if (!canvas || !gl) {
                throw new Error("Could not find the drawing context")
            }

            const ratio = window.devicePixelRatio
            const width = Math.max(1, Math.floor(canvas.clientWidth * ratio))
            const height = Math.max(1, Math.floor(canvas.clientHeight * ratio))

            if (canvas.width != width || canvas.height != height) {
                canvas.width = width
                canvas.height = height
                gl.viewport(0, 0, width, height)

                renderer.resize(gl, width, height)
            }
        }

        function _draw(now: DOMHighResTimeStamp) {
            frameId = requestAnimationFrame(_draw)

            _resize()

            if (!gl || !canvas) {
                return
            }

            renderer.draw(gl, now)
        }

        const observer = new ResizeObserver(_resize)
        observer.observe(canvas)

        renderer.init(gl)

        frameId = requestAnimationFrame(_draw)

        return () => {
            observer.disconnect()
            cancelAnimationFrame(frameId)

            renderer.deinit(gl)
        }
    })

    return <canvas className={className} style={style} ref={ref}></canvas>
}
