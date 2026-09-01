# x3d-react

React bindings for the [x3d](https://github.com/afrigon/x3d-js) game engine. It bridges React's declarative component tree and the engine's imperative render loop: a component renders the canvas element, wires it to the engine, and hands control back to your code.

## Install

The package is distributed through git:

```sh
aube add github:afrigon/x3d-react
```

## Usage

`ManagedCanvas3d` runs the whole loop: it creates an `x3d.SceneRenderer` on its canvas, keeps the drawing buffer sized to the element, forwards keyboard, pointer, and wheel events into an `x3d.Input`, and calls back into your code every frame.

```tsx
import { ManagedCanvas3d } from "x3d-react"

export function Game() {
    return (
        <ManagedCanvas3d
            locksCursor={true}
            onInit={(renderer) => {}}
            onResize={(renderer, width, height) => {}}
            onDraw={(renderer, input, delta) => {}}
        />
    )
}
```

With `locksCursor` enabled, clicking the canvas requests pointer lock, Escape releases it, and keyboard and scroll input reach the `Input` only while the cursor is locked. Without it, the cursor position is tracked relative to the canvas and input flows unconditionally.

`Canvas3d` is the low-level piece: it renders a `<canvas>`, attaches an `x3d.SceneRenderer` to it, and exposes the renderer through a ref. Initialization, resizing, input, and the frame loop are yours to drive.

```tsx
import { useRef } from "react"
import { Canvas3d } from "x3d-react"
import * as x3d from "x3d"

export function Viewport() {
    const renderer = useRef<x3d.SceneRenderer | null>(null)

    return <Canvas3d ref={renderer} />
}
```

Both components forward `className` and `style` to the canvas element.

## Development

```sh
aubr build
aubr type-check
aubr lint
aubr prettier
```
