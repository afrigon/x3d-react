import { CSSProperties, RefObject, useEffect, useRef } from "react"
import * as x3d from "x3d"
import { Canvas3d } from "./Canvas3d"

interface ManagedCanvas3dProps {
    onInit: (renderer: x3d.SceneRenderer) => void,
    onResize: (renderer: x3d.SceneRenderer, width: number, height: number) => void,
    onDraw: (renderer: x3d.SceneRenderer, now: number) => void,
    className?: string
    style?: CSSProperties
}

export function ManagedCanvas3d({ onInit, onResize, onDraw, className, style }: ManagedCanvas3dProps) {
    const ref: RefObject<x3d.SceneRenderer | null> = useRef(null)

    useEffect(() => {
        const renderer = ref.current

        if (!renderer) {
            return
        }

        let frameId: number

        function _resize() {
            if (!renderer) {
                throw new Error("Could not find x3d renderer")
            }

            const ratio = window.devicePixelRatio
            const width = Math.max(1, Math.floor(renderer.canvas.clientWidth * ratio))
            const height = Math.max(1, Math.floor(renderer.canvas.clientHeight * ratio))

            if (renderer.width != width || renderer.width != height) {
                renderer.resize(width, height)
                onResize(renderer, width, height)
            }
        }

        function _draw(now: DOMHighResTimeStamp) {
            frameId = requestAnimationFrame(_draw)

            _resize()

            if (!renderer) {
                return
            }

            onDraw(renderer, now)
        }

        const observer = new ResizeObserver(_resize)
        observer.observe(renderer.canvas)

        onInit(renderer)

        frameId = requestAnimationFrame(_draw)

        return () => {
            observer.disconnect()
            cancelAnimationFrame(frameId)

            renderer.delete()
        }
    })

    return <Canvas3d ref={ref} className={className} style={style} />
}