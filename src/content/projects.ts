// Workshop blueprints: hover shows `title`, click opens the details card.
// Keys are the mesh names in blueprintContents.glb.

export interface Project {
  title: string
  // One-line pitch shown under the title
  pitch: string
  stack: string[]
  // "What I built" bullet points
  builtByMe: string[]
  // Buttons are hidden when a link is missing
  liveUrl?: string
  codeUrl?: string
  // Shows a "coming soon" note instead of the details
  comingSoon?: boolean
}

export const PROJECTS: Record<string, Project> = {
  BlueprintContent1: {
    title: 'Project 1',
    pitch: 'An exciting project currently in development.',
    stack: [],
    builtByMe: [],
    comingSoon: true,
  },
  BlueprintContent2: {
    title: 'Pixel Art Editor',
    pitch: 'A browser-based pixel art editor with a full drawing toolset.',
    stack: ['TypeScript', 'React', 'Canvas API'],
    builtByMe: [
      'Canvas rendering engine with zoomable pixel grid',
      'Drawing tools: pencil, eraser, bucket fill, color picker',
      'Undo / redo history and PNG export',
    ],
    liveUrl: 'https://pixel-art-editor-xi.vercel.app/',
    codeUrl: 'https://github.com/Pawel-Matuszak/pixel-art-editor',
  },
  BlueprintContent3: {
    title: 'Telecom Website',
    pitch: 'A responsive marketing website for a telecommunications company.',
    stack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    builtByMe: [
      'Whole site from design to deployment',
      'Responsive layout for mobile, tablet and desktop',
      'Offer and contact pages',
    ],
    liveUrl: 'https://www.a-tel.com.pl/',
    codeUrl: 'https://github.com/Pawel-Matuszak/a-tel',
  },
  BlueprintContent4: {
    title: 'Chess Game',
    pitch: 'A playable chess game written in vanilla JavaScript, no libraries.',
    stack: ['JavaScript', 'HTML', 'CSS'],
    builtByMe: [
      'Move generation and validation for every piece',
      'Check, checkmate and special moves (castling, en passant, promotion)',
      'Drag-and-drop board UI',
    ],
    liveUrl: 'https://pawel-matuszak.github.io/chess-js/',
    codeUrl: 'https://github.com/Pawel-Matuszak/chess-js',
  },
}
