import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useScene } from '../useScene'
import {
  BLUEPRINT_HOVER_NAMES,
  CAMERA,
  CONTACT_NAMES,
  LEAF_NAMES,
  POST_SIGN_NAMES,
  getNavTarget,
  isNavName,
  type IslandOutline,
} from './constants'
import { cloneWithColorScale, getOriginalMaterial } from './meshUtils'
import { useInteractiveMeshes } from './useInteractiveMeshes'

const RAYCAST_INTERVAL_MS = 16 // ~60fps
const MIN_POINTER_DELTA = 0.001
const HOVER_BRIGHTNESS = 1.5
const BLUEPRINT_HOVER_SCALE = 1.02
const CONTACT_HOVER_SCALE = 1.1

interface HoverState {
  mesh: THREE.Mesh
  originalScale: THREE.Vector3 | null
}

export function useHoverEffects(
  pointer: THREE.Vector2,
  treeContents: { show: (index: number) => void, hide: () => void, pinned: boolean },
  outlines: { show: (island: IslandOutline) => void, hideAll: () => void },
) {
  const { gl, camera } = useThree()
  const {
    isCameraFlying,
    introDone,
    currentCameraIndex,
    currentVisibleTreeContent,
    setHoveredWorkshopContent,
  } = useScene()
  const getMeshes = useInteractiveMeshes()

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const frustum = useMemo(() => new THREE.Frustum(), [])
  const viewProjection = useMemo(() => new THREE.Matrix4(), [])
  const lastPointer = useRef(new THREE.Vector2())
  const lastRaycast = useRef(0)
  const hovered = useRef<HoverState | null>(null)
  // Created on first hover and reused, so hovering doesn't clone materials every time
  const hoverMaterials = useRef(new Map<THREE.Mesh, THREE.Material>())

  function applyHoverMaterial(mesh: THREE.Mesh) {
    let material = hoverMaterials.current.get(mesh)
    if (!material) {
      const original = getOriginalMaterial(mesh)
      if (!original) return
      material = cloneWithColorScale(original, HOVER_BRIGHTNESS)
      hoverMaterials.current.set(mesh, material)
    }
    mesh.material = material
  }

  function scaleUp(mesh: THREE.Mesh, factor: number) {
    const originalScale = mesh.scale.clone()
    mesh.scale.multiplyScalar(factor)
    return originalScale
  }

  function markHovered(mesh: THREE.Mesh, originalScale: THREE.Vector3 | null = null) {
    gl.domElement.style.cursor = 'pointer'
    hovered.current = { mesh, originalScale }
  }

  function endHover({ mesh, originalScale }: HoverState, next: THREE.Object3D | undefined) {
    const original = getOriginalMaterial(mesh)
    if (original) mesh.material = original
    if (originalScale) mesh.scale.copy(originalScale)
    gl.domElement.style.cursor = 'default'

    if (mesh.name.startsWith('BlueprintContent')) setHoveredWorkshopContent(null)
    if (isNavName(mesh.name)) outlines.hideAll()

    // Keep the skill panel open while moving from one leaf to another, or while it's pinned
    const stillOnLeaf = next !== undefined && LEAF_NAMES.includes(next.name)
    if (LEAF_NAMES.includes(mesh.name) && !stillOnLeaf && !treeContents.pinned) treeContents.hide()

    hovered.current = null
  }

  function startHover(mesh: THREE.Mesh) {
    const { name } = mesh

    switch (currentCameraIndex) {
      case CAMERA.TREE: {
        if (!LEAF_NAMES.includes(name)) return
        applyHoverMaterial(mesh)
        markHovered(mesh)
        const leafIndex = Number(name.replace('leaves', ''))
        // A pinned panel stays put until it's closed or another leaf is clicked
        if (!treeContents.pinned && currentVisibleTreeContent !== leafIndex) {
          treeContents.show(leafIndex)
        }
        return
      }
      case CAMERA.WORKSHOP: {
        if (!BLUEPRINT_HOVER_NAMES.includes(name)) return
        applyHoverMaterial(mesh)
        const isPanel = name !== 'BlueprintHoverContent'
        markHovered(mesh, isPanel ? scaleUp(mesh, BLUEPRINT_HOVER_SCALE) : null)
        if (isPanel) setHoveredWorkshopContent(name)
        return
      }
      case CAMERA.CONTACT: {
        if (CONTACT_NAMES.includes(name)) markHovered(mesh, scaleUp(mesh, CONTACT_HOVER_SCALE))
        return
      }
      case CAMERA.MAIN: {
        const target = getNavTarget(name)
        if (!target) return
        if (POST_SIGN_NAMES.includes(name)) applyHoverMaterial(mesh)
        markHovered(mesh)
        outlines.show(target.outline)
        return
      }
    }
  }

  useFrame(() => {
    // Nothing is hoverable mid-flight; hover resumes once the camera lands
    if (isCameraFlying || !introDone) return

    const now = performance.now()
    if (now - lastRaycast.current < RAYCAST_INTERVAL_MS) return
    if (pointer.distanceTo(lastPointer.current) < MIN_POINTER_DELTA) return
    lastRaycast.current = now
    lastPointer.current.copy(pointer)

    // Only raycast against meshes the camera can see
    camera.updateMatrixWorld()
    viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(viewProjection)
    const candidates = getMeshes().filter((mesh) => frustum.intersectsObject(mesh))

    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(candidates)[0]?.object

    if (hovered.current) endHover(hovered.current, hit)
    if (hit instanceof THREE.Mesh) startHover(hit as THREE.Mesh)
  })
}
