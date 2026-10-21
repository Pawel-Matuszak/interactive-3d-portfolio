import * as THREE from 'three'

const FLASH_FADE_IN_MS = 200
const FLASH_HOLD_MS = 300
const FLASH_FADE_OUT_MS = 200
const FLASH_BRIGHTNESS = 2

export function getOriginalMaterial(mesh: THREE.Mesh) {
  return mesh.userData.originalMaterial as THREE.Material | undefined
}

export function cloneWithColorScale(material: THREE.Material, factor: number) {
  const clone = material.clone()
  if ('color' in clone && clone.color instanceof THREE.Color) {
    clone.color.multiplyScalar(factor)
  }
  return clone
}

export function setOutlineVisible(outline: THREE.Group | null, visible: boolean) {
  if (!outline) return
  outline.visible = visible
  outline.traverse((child) => {
    if (child instanceof THREE.Mesh) child.visible = visible
  })
}

// Brighten the mesh, hold, then fade back to its original material
export function flashMesh(mesh: THREE.Mesh, delayMs: number) {
  const original = getOriginalMaterial(mesh)
  if (!(original instanceof THREE.MeshBasicMaterial)) return

  const baseColor = original.color.clone()
  const peakColor = baseColor.clone().multiplyScalar(FLASH_BRIGHTNESS)
  const flash = original.clone()

  setTimeout(() => {
    const start = performance.now()

    const step = () => {
      const elapsed = performance.now() - start
      if (elapsed < FLASH_FADE_IN_MS) {
        flash.color.lerpColors(baseColor, peakColor, elapsed / FLASH_FADE_IN_MS)
      } else if (elapsed < FLASH_FADE_IN_MS + FLASH_HOLD_MS) {
        flash.color.copy(peakColor)
      } else if (elapsed < FLASH_FADE_IN_MS + FLASH_HOLD_MS + FLASH_FADE_OUT_MS) {
        const progress = (elapsed - FLASH_FADE_IN_MS - FLASH_HOLD_MS) / FLASH_FADE_OUT_MS
        flash.color.lerpColors(peakColor, baseColor, progress)
      } else {
        mesh.material = original
        flash.dispose()
        return
      }
      mesh.material = flash
      requestAnimationFrame(step)
    }

    step()
  }, delayMs)
}
