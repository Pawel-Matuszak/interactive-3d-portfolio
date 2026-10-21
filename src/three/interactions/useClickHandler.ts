import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useScene } from '../useScene'
import { CONTACT_LINKS } from '../sceneConfigs'
import { BLUEPRINT_NAMES, CAMERA, CONTACT_NAMES, LEAF_NAMES, getNavTarget } from './constants'
import { updatePointerFromEvent } from './usePointer'
import { useInteractiveMeshes } from './useInteractiveMeshes'

function openLink(links: Record<string, string>, name: string) {
  const url = links[name]
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

// The skill panel is HTML that lets clicks through to the canvas, so hit-test its
// on-screen boxes (text card + skill icons) to tell a click on it from one outside
function isOnTreePanel(x: number, y: number) {
  const parts = document.querySelectorAll('[data-tree-panel] > div:first-child, [data-tree-panel] img')
  return [...parts].some((part) => {
    const r = part.getBoundingClientRect()
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  })
}

export function useClickHandler(
  pointer: THREE.Vector2,
  treeContents: { pin: (index: number) => void, hide: () => void },
) {
  const { gl, camera } = useThree()
  const {
    currentCameraIndex,
    setCurrentCameraIndex,
    isCameraFlying,
    introDone,
    setSelectedProject,
  } = useScene()
  const getMeshes = useInteractiveMeshes()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  useEffect(() => {
    const element = gl.domElement

    function onClick(event: MouseEvent) {
      if (isCameraFlying || !introDone) return
      raycaster.setFromCamera(pointer, camera)
      const name = raycaster.intersectObjects(getMeshes())[0]?.object.name

      // Clicking anything but a blueprint closes the project card
      if (currentCameraIndex === CAMERA.WORKSHOP && !BLUEPRINT_NAMES.includes(name ?? '')) {
        setSelectedProject(null)
      }

      if (currentCameraIndex === CAMERA.TREE) {
        // Clicking a leaf pins its skill panel; a click anywhere outside the panel closes it
        if (name !== undefined && LEAF_NAMES.includes(name)) {
          treeContents.pin(Number(name.replace('leaves', '')))
        } else if (!isOnTreePanel(event.clientX, event.clientY)) {
          treeContents.hide()
        }
        return
      }

      if (name === undefined) return

      if (currentCameraIndex === CAMERA.CONTACT && CONTACT_NAMES.includes(name)) {
        openLink(CONTACT_LINKS, name)
      } else if (currentCameraIndex === CAMERA.WORKSHOP && BLUEPRINT_NAMES.includes(name)) {
        setSelectedProject(name)
      } else if (currentCameraIndex === CAMERA.MAIN) {
        const target = getNavTarget(name)
        if (target) setCurrentCameraIndex(target.camera)
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerType === 'touch') {
        updatePointerFromEvent(pointer, element, event)
        onClick(event)
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
    isCameraFlying,
    introDone,
    treeContents,
    setSelectedProject,
  ])
}
