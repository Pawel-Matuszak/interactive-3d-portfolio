import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useScene } from '../useScene'
import { BLUEPRINT_LINKS, CONTACT_LINKS } from '../sceneConfigs'
import { BLUEPRINT_NAMES, CAMERA, CONTACT_NAMES, TREE_CONTENT_NAMES, getNavTarget } from './constants'
import { updatePointerFromEvent } from './usePointer'
import { useInteractiveMeshes } from './useInteractiveMeshes'

function openLink(links: Record<string, string>, name: string) {
  const url = links[name]
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

export function useClickHandler(pointer: THREE.Vector2, hideTreeContents: () => void) {
  const { gl, camera } = useThree()
  const { currentCameraIndex, setCurrentCameraIndex } = useScene()
  const getMeshes = useInteractiveMeshes()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  useEffect(() => {
    const element = gl.domElement

    function onClick() {
      raycaster.setFromCamera(pointer, camera)
      const name = raycaster.intersectObjects(getMeshes())[0]?.object.name

      if (name === undefined) {
        // Clicking empty space closes the open skill panel
        if (currentCameraIndex === CAMERA.TREE) hideTreeContents()
        return
      }

      if (TREE_CONTENT_NAMES.includes(name)) {
        hideTreeContents()
      } else if (currentCameraIndex === CAMERA.CONTACT && CONTACT_NAMES.includes(name)) {
        openLink(CONTACT_LINKS, name)
      } else if (currentCameraIndex === CAMERA.WORKSHOP && BLUEPRINT_NAMES.includes(name)) {
        openLink(BLUEPRINT_LINKS, name)
      } else if (currentCameraIndex === CAMERA.MAIN) {
        const target = getNavTarget(name)
        if (target) setCurrentCameraIndex(target.camera)
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerType === 'touch') {
        updatePointerFromEvent(pointer, element, event)
        onClick()
      }
    }

    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('click', onClick)
    return () => {
      element.removeEventListener('pointerup', onPointerUp)
      element.removeEventListener('click', onClick)
    }
  }, [
    gl,
    camera,
    pointer,
    raycaster,
    getMeshes,
    currentCameraIndex,
    setCurrentCameraIndex,
    hideTreeContents,
  ])
}
