// Same colour as the flat fill of water.png / waterClose.png
const OCEAN_COLOR = '#428CA6'
// Just inside the sky sphere (radius 500), so its edge sits on the horizon
const OCEAN_RADIUS = 480

// Plain sea under the baked water plane. It carries the water's colour out to the
// horizon so the edge of the water plane is never visible.
export function Ocean() {
  return (
    // Drawn first without writing depth, so the baked water and islands always cover it
    <mesh rotation-x={-Math.PI / 2} renderOrder={-1}>
      <circleGeometry args={[OCEAN_RADIUS, 64]} />
      <meshBasicMaterial color={OCEAN_COLOR} depthWrite={false} />
    </mesh>
  )
}
