import { useEffect } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { useScene } from '../three/useScene'
import { CAMERA } from '../three/interactions/constants'
import { PROJECTS } from '../content/projects'

// Details card for the blueprint clicked on the Workshop island
export function ProjectCard() {
  const { selectedProject, setSelectedProject, currentCameraIndex } = useScene()
  const project = selectedProject ? PROJECTS[selectedProject] : undefined

  // Leaving the workshop closes the card
  useEffect(() => {
    if (currentCameraIndex !== CAMERA.WORKSHOP) setSelectedProject(null)
  }, [currentCameraIndex, setSelectedProject])

  useEffect(() => {
    if (!selectedProject) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedProject, setSelectedProject])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {project && (
          <motion.aside
            key={selectedProject}
            className="project-card"
            aria-label={project.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <button
              type="button"
              className="project-card__close"
              aria-label="Close"
              onClick={() => setSelectedProject(null)}
            >
              ✕
            </button>

            <h2 className="project-card__title">{project.title}</h2>
            <p className="project-card__pitch">{project.pitch}</p>

            {project.comingSoon ? (
              <p className="project-card__soon">Coming soon. Check back later!</p>
            ) : (
              <>
                {project.stack.length > 0 && (
                  <section>
                    <h3 className="project-card__heading">Stack</h3>
                    <ul className="project-card__chips">
                      {project.stack.map((tech) => <li key={tech}>{tech}</li>)}
                    </ul>
                  </section>
                )}

                {project.builtByMe.length > 0 && (
                  <section>
                    <h3 className="project-card__heading">What I built</h3>
                    <ul className="project-card__list">
                      {project.builtByMe.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </section>
                )}

                {(project.liveUrl ?? project.codeUrl) && (
                  <div className="project-card__actions">
                    {project.liveUrl && (
                      <a className="project-card__button is-primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        Live
                      </a>
                    )}
                    {project.codeUrl && (
                      <a className="project-card__button" href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                        Code
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
