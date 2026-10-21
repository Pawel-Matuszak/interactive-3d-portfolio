import * as THREE from 'three'
import { BackSide } from 'three'

const SKY_CONFIG = {
  horizonColor: '#DCE3E5',
  midColor: '#A4BDDB',
  zenithColor: '#6D8DB5',

  // Transition points (0 = horizon, 1 = straight up)
  horizonToMidPoint: 0.05,  // Where horizon ends / mid begins
  midToZenithPoint: 0.4,   // Where mid ends / zenith begins

  // Transition smoothness (0.01 to 0.3)
  smoothness: 0.15,
}

export function GradientSky() {
  const { horizonToMidPoint, midToZenithPoint, smoothness } = SKY_CONFIG

  return (
    // Background: drawn before everything else (including the ocean) without writing depth
    <mesh renderOrder={-2}>
      <sphereGeometry args={[500, 32, 32]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        uniforms={{
          uColorHorizon: { value: new THREE.Color(SKY_CONFIG.horizonColor) },
          uColorMid: { value: new THREE.Color(SKY_CONFIG.midColor) },
          uColorZenith: { value: new THREE.Color(SKY_CONFIG.zenithColor) },
          uHorizonToMid: { value: horizonToMidPoint },
          uMidToZenith: { value: midToZenithPoint },
          uSmoothness: { value: smoothness },
        }}
        vertexShader={`
          varying float vHeight;
          void main() {
            vHeight = normalize(position).y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColorHorizon;
          uniform vec3 uColorMid;
          uniform vec3 uColorZenith;
          uniform float uHorizonToMid;
          uniform float uMidToZenith;
          uniform float uSmoothness;
          varying float vHeight;
          
          void main() {
            float t = clamp(vHeight, 0.0, 1.0);
            
            // Smooth transitions using configurable smoothness
            float horizonToMid = smoothstep(uHorizonToMid - uSmoothness, uHorizonToMid + uSmoothness, t);
            float midToZenith = smoothstep(uMidToZenith - uSmoothness, uMidToZenith + uSmoothness, t);
            
            vec3 color = mix(uColorHorizon, uColorMid, horizonToMid);
            color = mix(color, uColorZenith, midToZenith);
            
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  )
}

