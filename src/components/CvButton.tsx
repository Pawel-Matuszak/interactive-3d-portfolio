import { useScene } from '../three/useScene'

const CV_URL = `${import.meta.env.BASE_URL}static/Pawel_Matuszak_CV.pdf`

export function CvButton() {
  const { loadedCameras } = useScene()

  // Wait for the scene so the button doesn't sit on top of the loading screen
  if (loadedCameras.length === 0) return null

  return (
    <a
      href={CV_URL}
      download
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 20px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.65)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <span style={{ fontSize: '20px', lineHeight: 1 }}>↓</span>
      Download CV
    </a>
  )
}
