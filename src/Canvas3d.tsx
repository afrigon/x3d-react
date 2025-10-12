import { CSSProperties, RefObject, useEffect, useRef } from "react"

interface Canvas3dProps {
    vertex: string
    fragment: string
    init?: (context: WebGL2RenderingContext) => void
    deinit?: (context: WebGL2RenderingContext) => void
    resize?: (context: WebGL2RenderingContext, width: number, height: number) => void
    draw: (context: WebGL2RenderingContext, now: number) => void
    className?: string
    style?: CSSProperties
}

export default function Canvas3d({ init, deinit, resize, draw, className, style }: Canvas3dProps) {
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

                if (resize) {
                    resize(gl, width, height)
                }
            }
        }

        function _draw(now: DOMHighResTimeStamp) {
            frameId = requestAnimationFrame(_draw)

            _resize()

            if (!gl || !canvas) {
                return
            }

            draw(gl, now)
        }

        const observer = new ResizeObserver(_resize)
        observer.observe(canvas)

        if (init) {
            init(gl)
        }

        frameId = requestAnimationFrame(_draw)

        return () => {
            observer.disconnect()
            cancelAnimationFrame(frameId)

            if (deinit) {
                deinit(gl)
            }
        }
    })

    return <canvas className={className} style={style} ref={ref}></canvas>
}
