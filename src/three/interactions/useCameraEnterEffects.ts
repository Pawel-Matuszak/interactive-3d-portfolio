import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useScene } from '../useScene'
import { CAMERA, LEAF_NAMES } from './constants'
import { flashMesh } from './meshUtils'

const LEAF_FLASH_STAGGER_MS = 250
const CONTACT_TEXT_FRAME_MS = 100

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useCameraEnterEffects(hideTreeContents: () => void, hideAllOutlines: () => void) {
  const { currentCameraIndex, loadedScenes, contactAnimationMeshes } = useScene()
  const leavesFlashed = useRef(false)
  const contactTextPlayed = useRef(false)

  // Clear anything left open on the previous island
  useEffect(() => {
    hideTreeContents()
    hideAllOutlines()
  }, [currentCameraIndex, hideTreeContents, hideAllOutlines])

  // First visit to the tree: flash the leaves to hint that they're interactive
  useEffect(() => {
    if (currentCameraIndex !== CAMERA.TREE || leavesFlashed.current) return
    const nature = loadedScenes.find((s) => s.name === 'bushRocks-scene')
    if (!nature) return
    leavesFlashed.current = true

    LEAF_NAMES.forEach((name, i) => {
      const leaf = nature.scene.getObjectByName(name)
      if (leaf instanceof THREE.Mesh) {
        flashMesh(leaf as THREE.Mesh, (i + 1) * LEAF_FLASH_STAGGER_MS)
      } else {
        console.warn('Leaf not found:', name)
      }
    })
  }, [currentCameraIndex, loadedScenes])

  // First visit to contact: play the "contact me" text frame by frame
  useEffect(() => {
    if (currentCameraIndex !== CAMERA.CONTACT || contactTextPlayed.current) return
    contactTextPlayed.current = true

    const frames = contactAnimationMeshes.current
    void (async () => {
      for (let i = 0; i < frames.length; i++) {
        if (i > 0) frames[i - 1].visible = false
        frames[i].visible = true
        if (i < frames.length - 1) await wait(CONTACT_TEXT_FRAME_MS)
      }
    })()
  }, [currentCameraIndex, contactAnimationMeshes])
}
