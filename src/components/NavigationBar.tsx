import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { CAMERA } from '../three/interactions/constants'
import { CvButton } from './CvButton'

interface NavigationBarProps {
  visible: boolean
  disabled: boolean
  items: { name: string; index: number }[]
  currentCameraIndex: number
  onNavigate: (index: number) => void
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9v11h14V9" />
    </svg>
  )
}

// Site header: name on the left, Home and the islands on the right in a fixed order,
// with the current one highlighted, and the CV download in its own pill after them
export function NavigationBar({
  visible,
  disabled,
  items,
  currentCameraIndex,
  onNavigate,
}: NavigationBarProps) {
  function navigate(index: number) {
    if (index !== currentCameraIndex) onNavigate(index)
  }

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {visible && (
          <motion.header
            className="site-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="site-nav__brand">Paweł Matuszak</div>

            <div className="site-nav__actions">
              <nav className="site-nav__items" aria-label="Islands">
                {items.map(({ name, index }) => {
                  const active = index === currentCameraIndex
                  return (
                    <button
                      key={index}
                      type="button"
                      className={`site-nav__item${active ? ' is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      aria-label={name}
                      disabled={disabled}
                      onClick={() => navigate(index)}
                    >
                      {active && (
                        <motion.span
                          layoutId="site-nav-active"
                          className="site-nav__pill"
                          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                        />
                      )}
                      <span className="site-nav__label">
                        {index === CAMERA.MAIN && <HomeIcon />}
                        <span className={index === CAMERA.MAIN ? 'site-nav__home-text' : undefined}>
                          {name}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </nav>
              <CvButton />
            </div>
          </motion.header>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
