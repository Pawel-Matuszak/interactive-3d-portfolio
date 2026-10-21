import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

export function updatePointerFromEvent(
  pointer: THREE.Vector2,
  element: HTMLElement,
  event: PointerEvent,
) {
  const rect = element.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

// Pointer position over the canvas in normalized device coordinates
export function usePointer() {
  const { gl } = useThree()
  const pointer = useMemo(() => new THREE.Vector2(), [])

  useEffect(() => {
    const element = gl.domElement
    const onPointer = (event: PointerEvent) => updatePointerFromEvent(pointer, element, event)

    element.addEventListener('pointermove', onPointer, { passive: true })
    element.addEventListener('pointerdown', onPointer)
    return () => {
      element.removeEventListener('pointermove', onPointer)
      element.removeEventListener('pointerdown', onPointer)
    }
  }, [gl, pointer])

  return pointer
}
