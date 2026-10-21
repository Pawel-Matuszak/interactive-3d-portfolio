import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { useThree } from '@react-three/fiber'
import { CAMERAS_GLTF_URL, DRACO_DECODER_PATH } from './sceneConfigs'
import { useScene } from './useScene'
import { useFrame } from '@react-three/fiber'

export function Cameras() {
  const { camera: baseCamera, set } = useThree()
  const { setLoadedCameras, loadedCameras, currentCameraIndex, setCurrentCameraIndex } = useScene()
  const baseAspect = (baseCamera as THREE.PerspectiveCamera).aspect
  const baseQuaternionsRef = useRef<Map<THREE.PerspectiveCamera, THREE.Quaternion>>(new Map())
  const basePositionsRef = useRef<Map<THREE.PerspectiveCamera, THREE.Vector3>>(new Map())

  useEffect(() => {
    const loader = new GLTFLoader()
    const draco = new DRACOLoader()
    draco.setDecoderPath(DRACO_DECODER_PATH)
    loader.setDRACOLoader(draco)

    loader.load(CAMERAS_GLTF_URL, (gltf) => {
      const cams: THREE.PerspectiveCamera[] = []
      gltf.scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Camera).isCamera) {
          let newCam: THREE.PerspectiveCamera | null = null
          const source = child as THREE.PerspectiveCamera
          if (source.isPerspectiveCamera) {
            const customFar = 550;
            newCam = new THREE.PerspectiveCamera(source.fov, baseAspect, source.near, customFar)
          }
          if (newCam) {
            child.updateMatrixWorld(true)
            const pos = new THREE.Vector3()
            const quat = new THREE.Quaternion()
            const scl = new THREE.Vector3()
            child.matrixWorld.decompose(pos, quat, scl)
            newCam.position.copy(pos)
            newCam.quaternion.copy(quat)
            newCam.name = child.name || `Camera ${cams.length + 1}`
            cams.push(newCam)
          }
        }
      })
      setLoadedCameras(cams)
    })
  }, [baseAspect, setLoadedCameras])

  // Sync active camera switch
  useEffect(() => {
    const selected = loadedCameras[currentCameraIndex]
    if (selected) {
      set({ camera: selected })
      // Ensure the selected camera starts from its original orientation and position
      const baseQuat = baseQuaternionsRef.current.get(selected)
      const basePos = basePositionsRef.current.get(selected)
      if (baseQuat) {
        selected.quaternion.copy(baseQuat)
      }
      if (basePos) {
        selected.position.copy(basePos)
      }
    }
  }, [loadedCameras, currentCameraIndex, set])

  // Keyboard-based camera switching: [ -> previous, ] -> next
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (loadedCameras.length === 0) return
      if (e.key === '[') {
        const nextIndex = (currentCameraIndex - 1 + loadedCameras.length) % loadedCameras.length
        setCurrentCameraIndex(nextIndex)
      } else if (e.key === ']') {
        const nextIndex = (currentCameraIndex + 1) % loadedCameras.length
        setCurrentCameraIndex(nextIndex)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [loadedCameras, currentCameraIndex, setCurrentCameraIndex])

  //camera parallax tilt effect
  const mouseX = useRef(0)
  const mouseY = useRef(0)
  const lastMouseUpdate = useRef(0)
  const MOUSE_UPDATE_THROTTLE = 16 // ~60fps

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const now = performance.now()
      if (now - lastMouseUpdate.current < MOUSE_UPDATE_THROTTLE) return

      lastMouseUpdate.current = now
      const selected = loadedCameras[currentCameraIndex]
      if (selected) {
        mouseX.current = e.clientX / window.innerWidth - 0.5
        mouseY.current = e.clientY / window.innerHeight - 0.5
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [loadedCameras, currentCameraIndex])

  // Capture and cache each camera's original quaternion and position once
  useEffect(() => {
    for (const cam of loadedCameras) {
      if (!baseQuaternionsRef.current.has(cam)) {
        baseQuaternionsRef.current.set(cam, cam.quaternion.clone())
      }
      if (!basePositionsRef.current.has(cam)) {
        basePositionsRef.current.set(cam, cam.position.clone())
      }
    }
  }, [loadedCameras])

  const cameraUpdateThrottle = useRef(0)
  const CAMERA_UPDATE_MS = 16 // ~60fps

  useFrame(() => {
    const now = performance.now()
    if (now - cameraUpdateThrottle.current < CAMERA_UPDATE_MS) return
    cameraUpdateThrottle.current = now

    const selected = loadedCameras[currentCameraIndex]
    if (selected) {
      const baseQuat = baseQuaternionsRef.current.get(selected)
      if (!baseQuat) return

      const maxRotation = 0.05
      const offsetX = -mouseY.current * maxRotation
      const offsetY = -mouseX.current * maxRotation

      const offsetEuler = new THREE.Euler(offsetX, offsetY, 0, 'YXZ')
      const offsetQuat = new THREE.Quaternion().setFromEuler(offsetEuler)
      const desiredQuat = baseQuat.clone().multiply(offsetQuat)

      selected.quaternion.slerp(desiredQuat, 0.1)
    }
  })

  return null
}

