import * as THREE from 'three'

export const INTRO_MS = 3500
// Delay before the intro starts moving, so it begins as the loading overlay fades
export const INTRO_DELAY_MS = 300

// Flight time grows with distance: short hops stay snappy, long ones don't feel rushed
const FLIGHT_BASE_MS = 600
const FLIGHT_MS_PER_UNIT = 12
const FLIGHT_MIN_MS = 800
const FLIGHT_MAX_MS = 1600
// How high flights arc, relative to the distance travelled, capped for long flights
const ARC_LIFT = 0.12
const ARC_MAX = 6
// Intro starts this far around the islands, raised and tilted down
const INTRO_YAW = THREE.MathUtils.degToRad(-40)
const INTRO_RISE = 0.15
const INTRO_PITCH = THREE.MathUtils.degToRad(-6)

export interface CameraPose {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  fov: number
}

// A pose plus the point it's looking at, which flights keep framed
export interface FlightPose extends CameraPose {
  focus: THREE.Vector3
}

export interface Flight {
  // A resting pose, or the flight that was interrupted, which keeps playing out underneath
  // so a retarget carries its momentum instead of restarting from a standstill
  from: FlightPose | Flight
  to: FlightPose
  start: number
  duration: number
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Flight easing: starts from rest (no jolt) and has the lowest peak speed of the common
// curves, about 1.6x the average, so the camera never feels yanked away
function easeFlight(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const UP = new THREE.Vector3(0, 1, 0)
const RIGHT = new THREE.Vector3(1, 0, 0)

const FORWARD = new THREE.Vector3(0, 0, -1)

export function flightDuration(from: THREE.Vector3, to: THREE.Vector3) {
  const ms = FLIGHT_BASE_MS + from.distanceTo(to) * FLIGHT_MS_PER_UNIT
  return THREE.MathUtils.clamp(ms, FLIGHT_MIN_MS, FLIGHT_MAX_MS)
}

export function toFlightPose(pose: CameraPose, focusDistance: number): FlightPose {
  return {
    position: pose.position.clone(),
    quaternion: pose.quaternion.clone(),
    fov: pose.fov,
    focus: FORWARD.clone()
      .applyQuaternion(pose.quaternion)
      .multiplyScalar(focusDistance)
      .add(pose.position),
  }
}

export function emptyFlightPose(): FlightPose {
  return {
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    fov: 50,
    focus: new THREE.Vector3(),
  }
}

export function isFlightDone(flight: Flight, now: number) {
  return now >= flight.start + flight.duration
}

const lookMatrix = new THREE.Matrix4()

function lookAtQuat(eye: THREE.Vector3, target: THREE.Vector3, out: THREE.Quaternion) {
  return out.setFromRotationMatrix(lookMatrix.lookAt(eye, target, UP))
}

// Pose at time `now` on a flight. Position and focus point travel together and the camera
// keeps aiming at the focus, so the shot always frames something and rising on the arc tilts
// the view down towards the target. A small correction, blended across the flight, makes it
// start and end on the exact camera rotations.
export function sampleFlight(flight: Flight, now: number, out: FlightPose): FlightPose {
  const t = THREE.MathUtils.clamp((now - flight.start) / flight.duration, 0, 1)
  const { to } = flight
  const from = 'start' in flight.from
    ? sampleFlight(flight.from, now, emptyFlightPose())
    : flight.from
  const e = easeFlight(t)

  const arcHeight = Math.min(from.position.distanceTo(to.position) * ARC_LIFT, ARC_MAX)
  const lift = Math.sin(Math.PI * e) * arcHeight
  out.position.lerpVectors(from.position, to.position, e).addScaledVector(UP, lift)
  out.focus.lerpVectors(from.focus, to.focus, e)
  out.fov = THREE.MathUtils.lerp(from.fov, to.fov, e)

  const fromCorrection = lookAtQuat(from.position, from.focus, new THREE.Quaternion())
    .invert()
    .premultiply(from.quaternion)
  const toCorrection = lookAtQuat(to.position, to.focus, new THREE.Quaternion())
    .invert()
    .premultiply(to.quaternion)
  const aimed = lookAtQuat(out.position, out.focus, new THREE.Quaternion())
    .premultiply(fromCorrection.slerp(toCorrection, e))

  // Safety net: if the focus ever ends up beside or behind the camera, fall back to a plain
  // rotation blend rather than whipping around
  const blended = new THREE.Quaternion().slerpQuaternions(from.quaternion, to.quaternion, e)
  const aim = out.focus.clone().sub(out.position)
  const facing = aim.length() < 0.5
    ? 0
    : aim.normalize().dot(FORWARD.clone().applyQuaternion(blended))
  out.quaternion.slerpQuaternions(blended, aimed, THREE.MathUtils.smoothstep(facing, 0.1, 0.4))

  return out
}

const offset = new THREE.Vector3()
const yawQuat = new THREE.Quaternion()
const pitchQuat = new THREE.Quaternion()

// Intro sweep: the end pose swung around the pivot's vertical axis, raised and tilted down,
// unwinding to exactly the end pose at t = 1
export function sampleIntro(
  end: CameraPose,
  pivot: THREE.Vector3,
  t: number,
  out: THREE.PerspectiveCamera,
) {
  const remaining = 1 - easeInOutCubic(t)
  offset.subVectors(end.position, pivot)
  const rise = offset.length() * INTRO_RISE * remaining

  yawQuat.setFromAxisAngle(UP, INTRO_YAW * remaining)
  pitchQuat.setFromAxisAngle(RIGHT, INTRO_PITCH * remaining)

  out.position.copy(offset.applyQuaternion(yawQuat)).add(pivot).addScaledVector(UP, rise)
  out.quaternion.copy(yawQuat).multiply(end.quaternion).multiply(pitchQuat)
  out.fov = end.fov
}
