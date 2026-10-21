// Google Docs PDF export, served as an attachment so it downloads
const CV_URL = 'https://docs.google.com/document/d/13BYVxxXqn8vqU8tCViN_PKiFDPH8JFJGAenxA2dncUI/export?format=pdf'

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  )
}

// CV download, kept apart from the island navigation in the site header
export function CvButton() {
  return (
    <a
      className="site-nav__cv"
      href={CV_URL}
      rel="noopener noreferrer"
      aria-label="Download CV"
    >
      <span className="site-nav__label">
        <DownloadIcon />
        CV
      </span>
    </a>
  )
}
