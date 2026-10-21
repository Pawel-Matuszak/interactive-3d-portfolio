import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useScene } from './useScene'

export function WaterAnimation() {
  const { waterMeshes, boatMesh } = useScene()
  const timeRef = useRef(0)

  useFrame((_state, delta) => {
    timeRef.current += delta

    const waveSpeed = 1.5 // Speed of wave propagation
    const waveAmplitude = 0.01 // Height of waves
    const waveFrequency = 4.0 // Frequency of waves

    // Animate water vertices for wave effect (preserves baked shadows)
    waterMeshes.current.forEach((mesh) => {
      if (!mesh?.geometry) return

      const geometry = mesh.geometry
      const positionAttribute = geometry.attributes.position
      if (!positionAttribute) return

      const originalPositions = (mesh.userData as {
        originalPositions?: Float32Array
      }).originalPositions
      if (!originalPositions) return

      const positions = positionAttribute.array as Float32Array
      const vertex = new THREE.Vector3()

      // Create wave animation by modifying vertex positions
      for (let i = 0; i < positions.length; i += 3) {
        // Get original position
        vertex.set(originalPositions[i], originalPositions[i + 1], originalPositions[i + 2])

        // Create wave effect using multiple sine waves for more natural motion
        const wave1 = Math.sin(
          vertex.x * waveFrequency + timeRef.current * waveSpeed
        ) * waveAmplitude
        const wave2 = Math.cos(
          vertex.z * waveFrequency * 0.7 + timeRef.current * waveSpeed * 1.3
        ) * waveAmplitude * 0.7

        // Apply wave to Y position (vertical displacement)
        positions[i] = originalPositions[i] // X stays the same
        positions[i + 1] = originalPositions[i + 1] + wave1 + wave2 // Y gets wave displacement
        positions[i + 2] = originalPositions[i + 2] // Z stays the same
      }

      // Mark position attribute as needing update
      positionAttribute.needsUpdate = true
      // Recalculate normals for proper lighting (optional, but helps with visual quality)
      geometry.computeVertexNormals()
    })

    // Animate boat
    if (boatMesh.current) {
      const mesh = boatMesh.current
      const originalPos = (mesh.userData as { originalPosition?: THREE.Vector3 }).originalPosition
      const originalRot = (mesh.userData as { originalRotation?: THREE.Euler }).originalRotation

      if (originalPos && originalRot) {
        // Calculate wave height at boat position
        const x = originalPos.x
        const z = originalPos.z

        const wave1 = Math.sin(
          x * waveFrequency + timeRef.current * waveSpeed
        ) * waveAmplitude
        const wave2 = Math.cos(
          z * waveFrequency * 0.7 + timeRef.current * waveSpeed * 1.3
        ) * waveAmplitude * 0.7

        // Update Y position
        mesh.position.y = originalPos.y + (wave1 + wave2)

        // Calculate tilt (derivative of wave function)
        // dy/dx = A * k * cos(kx + wt)
        const tiltX = waveAmplitude * waveFrequency * Math.cos(
          x * waveFrequency + timeRef.current * waveSpeed
        )
        // dy/dz = -A * k * sin(kz + wt)
        const tiltZ = -waveAmplitude * 0.7 * waveFrequency * 0.7 * Math.sin(
          z * waveFrequency * 0.7 + timeRef.current * waveSpeed * 1.3
        )

        // Apply tilt to rotation
        // We add the tilt to the original rotation
        // Note: This is an approximation for small angles
        mesh.rotation.x = originalRot.x - tiltZ * .5 // Scale factor to dampen/adjust effect
        mesh.rotation.z = originalRot.z + tiltX * .5 // Scale factor to dampen/adjust effect
      }
    }
  })

  return null
}
