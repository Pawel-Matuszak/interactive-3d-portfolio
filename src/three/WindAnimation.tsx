import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useScene } from './useScene'

export function WindAnimation() {
  const { greenSceneMeshes } = useScene()
  const timeRef = useRef(0)

  useFrame((_state, delta) => {
    timeRef.current += delta

    // Animate leaves for wind effect
    greenSceneMeshes.current.forEach((mesh, index) => {
      if (!mesh) return

      const originalRotation = (mesh.userData as {
        originalRotation?: THREE.Euler
      }).originalRotation

      if (originalRotation) {
        // Create wind parameters
        const windSpeed = 1.0
        const windStrength = 0.02

        // Add some variation based on index so they don't all move in perfect sync
        const offset = index * 0.5

        // Calculate wind sway using sine waves
        // Sway in X direction only for a simpler bending effect
        const swayX = Math.sin(timeRef.current * windSpeed + offset) * windStrength

        // Apply rotation
        mesh.rotation.x = originalRotation.x + swayX
        // mesh.rotation.z = originalRotation.z + swayZ
      }
    })
  })

  return null
}

