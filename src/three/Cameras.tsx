import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { useFrame, useThree } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { CAMERAS_GLTF_URL, DRACO_DECODER_PATH } from './sceneConfigs'
import { useScene } from './useScene'
import { CAMERA } from './interactions/constants'
import {
  INTRO_DELAY_MS,
  INTRO_MS,
  emptyFlightPose,
  flightDuration,
  isFlightDone,
  prefersReducedMotion,
  sampleFlight,
  sampleIntro,
  toFlightPose,
  type Flight,
} from './cameraFlight'

// How far ahead of a camera its focus point sits, if the view ray doesn't hit the scene
const DEFAULT_FOCUS_DISTANCE = 20
const MIN_FOCUS_DISTANCE = 6
const MAX_FOCUS_DISTANCE = 80
// Mouse tilt eases back in over this long after the camera lands, instead of kicking in at once
const PARALLAX_RAMP_MS = 700

type IntroState =
  | { phase: 'waiting' }
  | { phase: 'playing', start: number, pivot: THREE.Vector3 }
  | { phase: 'done' }

// The cameras in cameras.glb only provide poses. Everything renders through a single rig
// camera that flies between them.
export function Cameras() {
  const { size, set } = useThree()
  const {
    setLoadedCameras,
    loadedCameras,
    loadedScenes,
    currentCameraIndex,
    setCurrentCameraIndex,
    setIsCameraFlying,
    introDone,
    setIntroDone,
    islandWorkshopMeshes,
    islandTreeMeshes,
    islandContactMeshes,
  } = useScene()
  const { active: loading } = useProgress()

  const [rig] = useState(() => new THREE.PerspectiveCamera(50, size.width / size.height, 0.1, 550))
  const flight = useRef<Flight | null>(null)
  const intro = useRef<IntroState>({ phase: 'waiting' })
  const flightPose = useMemo(emptyFlightPose, [])
  const lastIndex = useRef(currentCameraIndex)
  const landedAt = useRef(0)
  const reducedMotion = useMemo(prefersReducedMotion, [])
  const focusDistances = useRef(new Map<number, number>())
  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  // Distance to whatever is in the middle of a camera's view, so flights keep it framed
  const focusDistance = useCallback((index: number) => {
    const cached = focusDistances.current.get(index)
    if (cached !== undefined) return cached
    const cam = loadedCameras[index]
    raycaster.set(cam.position, new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion))
    raycaster.far = MAX_FOCUS_DISTANCE
    const hit = raycaster.intersectObjects(loadedScenes.map((s) => s.scene))[0]
    const distance = hit
      ? THREE.MathUtils.clamp(hit.distance, MIN_FOCUS_DISTANCE, MAX_FOCUS_DISTANCE)
      : DEFAULT_FOCUS_DISTANCE
    focusDistances.current.set(index, distance)
    return distance
  }, [loadedCameras, loadedScenes, raycaster])

  useEffect(() => {
    const loader = new GLTFLoader()
    const draco = new DRACOLoader()
    draco.setDecoderPath(DRACO_DECODER_PATH)
    loader.setDRACOLoader(draco)

    loader.load(CAMERAS_GLTF_URL, (gltf) => {
      const cams: THREE.PerspectiveCamera[] = []
      gltf.scene.traverse((child: THREE.Object3D) => {
        const source = child as THREE.PerspectiveCamera
        if (!source.isPerspectiveCamera) return
        const pose = new THREE.PerspectiveCamera(source.fov, 1, source.near, 550)
        child.updateMatrixWorld(true)
        child.matrixWorld.decompose(pose.position, pose.quaternion, new THREE.Vector3())
        pose.name = child.name || `Camera ${cams.length + 1}`
        cams.push(pose)
      })
      setLoadedCameras(cams)
    })
  }, [setLoadedCameras])

  // Start on the main view and make the rig the rendering camera
  useEffect(() => {
    const main = loadedCameras[CAMERA.MAIN]
    if (!main) return
    rig.position.copy(main.position)
    rig.quaternion.copy(main.quaternion)
    rig.fov = main.fov
    rig.near = main.near
    rig.updateProjectionMatrix()
    set({ camera: rig })
  }, [loadedCameras, rig, set])

  // Once everything has loaded, swing out to the intro's start pose while the loading overlay still covers it
  useEffect(() => {
    const main = loadedCameras[CAMERA.MAIN]
    if (!main || loadedScenes.length === 0 || loading || intro.current.phase !== 'waiting') return

    if (reducedMotion) {
      intro.current = { phase: 'done' }
      setIntroDone(true)
      return
    }

    const islands = new THREE.Box3()
    for (const meshes of [islandWorkshopMeshes, islandTreeMeshes, islandContactMeshes]) {
      for (const mesh of meshes.current) islands.expandByObject(mesh)
    }
    const pivot = islands.isEmpty()
      ? main.position.clone().add(new THREE.Vector3(0, 0, -30).applyQuaternion(main.quaternion))
      : islands.getCenter(new THREE.Vector3())

    sampleIntro(main, pivot, 0, rig)
    rig.updateProjectionMatrix()
    intro.current = { phase: 'playing', start: performance.now() + INTRO_DELAY_MS, pivot }
  }, [
    loadedCameras,
    loadedScenes,
    loading,
    reducedMotion,
    rig,
    setIntroDone,
    islandWorkshopMeshes,
    islandTreeMeshes,
    islandContactMeshes,
  ])

  // Any click or key press skips the intro
  useEffect(() => {
    if (introDone) return
    function skip() {
      const state = intro.current
      if (state.phase === 'playing') state.start = performance.now() - INTRO_MS
    }
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [introDone])

  // Fly to the newly selected camera. Mid-flight, the new flight takes over from the current
  // one, keeping its momentum; at rest it starts from the rig's pose.
  useEffect(() => {
    const previousIndex = lastIndex.current
    if (previousIndex === currentCameraIndex) return
    lastIndex.current = currentCameraIndex
    const target = loadedCameras[currentCameraIndex]
    if (reducedMotion || !target) return

    const now = performance.now()
    const from = flight.current && !isFlightDone(flight.current, now)
      ? flight.current
      : toFlightPose(rig, focusDistance(previousIndex))
    flight.current = {
      from,
      to: toFlightPose(target, focusDistance(currentCameraIndex)),
      start: now,
      duration: flightDuration(rig.position, target.position),
    }
    setIsCameraFlying(true)
  }, [currentCameraIndex, loadedCameras, focusDistance, reducedMotion, rig, setIsCameraFlying])

  // Keyboard-based camera switching: [ -> previous, ] -> next
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (loadedCameras.length === 0 || !introDone) return
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
  }, [loadedCameras, currentCameraIndex, setCurrentCameraIndex, introDone])

  //camera parallax tilt effect
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      mouseX.current = e.clientX / window.innerWidth - 0.5
      mouseY.current = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const parallaxQuat = useMemo(() => new THREE.Quaternion(), [])
  const parallaxEuler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])

  useFrame((_, delta) => {
    const target = loadedCameras[currentCameraIndex]
    if (!target) return
    const now = performance.now()

    const introState = intro.current
    if (introState.phase === 'playing') {
      const main = loadedCameras[CAMERA.MAIN]
      const t = Math.min(Math.max((now - introState.start) / INTRO_MS, 0), 1)
      sampleIntro(main, introState.pivot, t, rig)
      rig.updateProjectionMatrix()
      if (t === 1) {
        intro.current = { phase: 'done' }
        landedAt.current = now
        setIntroDone(true)
      }
      return
    }
    if (introState.phase === 'waiting') return

    const current = flight.current
    if (current) {
      // An interrupted flight that has finished playing out is just its end pose now
      if ('start' in current.from && isFlightDone(current.from, now)) current.from = current.from.to

      sampleFlight(current, now, flightPose)
      rig.position.copy(flightPose.position)
      rig.quaternion.copy(flightPose.quaternion)
      rig.fov = flightPose.fov
      rig.updateProjectionMatrix()
      if (isFlightDone(current, now)) {
        flight.current = null
        landedAt.current = now
        setIsCameraFlying(false)
      }
      return
    }

    if (reducedMotion && !rig.position.equals(target.position)) {
      rig.position.copy(target.position)
      rig.quaternion.copy(target.quaternion)
      rig.fov = target.fov
      rig.updateProjectionMatrix()
    }

    const ramp = THREE.MathUtils.smoothstep(now - landedAt.current, 0, PARALLAX_RAMP_MS)
    const maxRotation = 0.05 * ramp
    parallaxEuler.set(-mouseY.current * maxRotation, -mouseX.current * maxRotation, 0)
    parallaxQuat.setFromEuler(parallaxEuler).premultiply(target.quaternion)
    // Same smoothing as a 0.1 slerp per frame at 60fps, independent of frame rate
    rig.quaternion.slerp(parallaxQuat, 1 - Math.exp(-6.3 * delta))
  })

  return null
}
