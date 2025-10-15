import { CSSProperties, RefObject, useEffect, useRef } from "react"
import * as x3d from "x3d"

interface Canvas3dProps {
    ref: RefObject<x3d.SceneRenderer | null>
    className?: string
    style?: CSSProperties
}

export function Canvas3d({ ref, className, style }: Canvas3dProps) {
    const canvasRef: RefObject<HTMLCanvasElement | null> = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current

        if (!canvas) {
            return
        }

        ref.current = new x3d.SceneRenderer({ canvas })
    })

    return <canvas ref={canvasRef} className={className} style={style}></canvas>
}
