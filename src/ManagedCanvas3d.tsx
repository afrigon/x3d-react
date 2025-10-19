import { CSSProperties, RefObject, useEffect, useRef } from "react"
import * as x3d from "x3d"
import { Canvas3d } from "./Canvas3d"

interface ManagedCanvas3dProps {
    onInit: (renderer: x3d.SceneRenderer) => void,
    onResize: (renderer: x3d.SceneRenderer, width: number, height: number) => void,
    onDraw: (renderer: x3d.SceneRenderer, input: x3d.Input, delta: number) => void,
    locksCursor: boolean
    className?: string
    style?: CSSProperties
}

export function ManagedCanvas3d({ 
    onInit, 
    onResize, 
    onDraw, 
    locksCursor,
    className, 
    style 
}: ManagedCanvas3dProps) {
    const ref: RefObject<x3d.SceneRenderer | null> = useRef(null)

    useEffect(() => {
        const renderer = ref.current
        const input = new x3d.Input()
        let previous: DOMHighResTimeStamp

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

            if (renderer.width != width || renderer.height != height) {
                renderer.resize(width, height)
                onResize(renderer, width, height)
            }
        }

        function _draw(now: DOMHighResTimeStamp) {
            frameId = requestAnimationFrame(_draw)
            const delta = now - (previous ?? now)
            previous = now

            _resize()

            if (!renderer) {
                return
            }

            onDraw(renderer, input, delta)

            input.clearDelta()
            input.clearButtonUpdates()
        }

        function _keydown(event: KeyboardEvent) {
            if (input.isLocked && event.key == "Escape") {
                document.exitPointerLock()
            }

            if (input.isLocked) {
                event.preventDefault()
            }

            if (input.isLocked || !locksCursor) {
                input.didPress(event.key)
            }
        }

        function _keyup(event: KeyboardEvent) {
            if (input.isLocked || !locksCursor) {
                input.didRelease(event.key)
            }
        }

        function _pointerdown(event: PointerEvent) {
            if (!input.isLocked && event.button == 0 && locksCursor) {
                renderer?.canvas.requestPointerLock().catch(() => {})
            }

            input.didPress(`pointer-${event.button}`)
        }

        function _pointerup(event: PointerEvent) {
            input.didRelease(`pointer-${event.button}`)
        }

        function _pointermove(event: PointerEvent) {
            if (!renderer) {
                return
            }

            if (locksCursor) {
                if (input.isLocked) {
                    input.addCursorDelta(event.movementX, event.movementY)
                }
            } else {
                const rect = renderer.canvas.getBoundingClientRect()
                const x = event.clientX - rect.left
                const y = event.clientY - rect.top

                const previous = input.cursorPosition
                input.cursorPosition = new x3d.Vector2(x, y)

                input.addCursorDelta(x - previous.x, y - previous.y)
            }
        }

        function _pointerenter(event: PointerEvent) {
            if (!renderer) {
                return
            }

            const rect = renderer.canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            input.cursorPosition = new x3d.Vector2(x, y)
        }

        function _wheel(event: WheelEvent) {
            if (input.isLocked) {
                event.preventDefault()
            }

            if (input.isLocked || !locksCursor) {
                input.addScrollDelta(event.deltaX, event.deltaY)
            }
        }

        function _lockchange() {
            input.clearDelta()

            if (!renderer) {
                return input.isLocked = false
            }

            input.isLocked = document.pointerLockElement == renderer.canvas
        }

        function _lockerror() {
            document.exitPointerLock()
        }

        const observer = new ResizeObserver(_resize)
        observer.observe(renderer.canvas)

        onInit(renderer)

        frameId = requestAnimationFrame(_draw)

        window.addEventListener("keydown", _keydown)
        window.addEventListener("keyup", _keyup)
        renderer.canvas.addEventListener("pointerdown", _pointerdown)
        renderer.canvas.addEventListener("pointerup", _pointerup)
        renderer.canvas.addEventListener("pointermove", _pointermove)
        renderer.canvas.addEventListener("pointerenter", _pointerenter)
        renderer.canvas.addEventListener("wheel", _wheel, { passive: false })
        document.addEventListener("pointerlockchange", _lockchange)
        document.addEventListener("pointerlockerror", _lockerror)

        return () => {
            observer.disconnect()
            cancelAnimationFrame(frameId)

            window.removeEventListener("keydown", _keydown)
            window.removeEventListener("keyup", _keyup)
            renderer.canvas.removeEventListener("pointerdown", _pointerdown)
            renderer.canvas.removeEventListener("pointerup", _pointerup)
            renderer.canvas.removeEventListener("pointermove", _pointermove)
            renderer.canvas.removeEventListener("pointerenter", _pointerenter)
            renderer.canvas.removeEventListener("wheel", _wheel)
            document.removeEventListener("pointerlockchange", _lockchange)
            document.removeEventListener("pointerlockerror", _lockerror)

            renderer.delete()
        }
    })

    return <Canvas3d ref={ref} className={className} style={style} />
}