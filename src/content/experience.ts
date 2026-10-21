// Experience island: one entry per TreeContent{N} mesh in treeContents.glb.
// `description` is split into bullet points on '. '.

const BASE_URL = import.meta.env.BASE_URL

// Skill name -> icon. Add an icon to public/static/icons/ and register it here.
export const SKILL_ICONS = {
  'Python': `${BASE_URL}static/icons/python.png`,
  'TypeScript': `${BASE_URL}static/icons/typescript.png`,
  'React': `${BASE_URL}static/icons/react.png`,
  'AI': `${BASE_URL}static/icons/science.png`,
  'REST API': `${BASE_URL}static/icons/api.png`,
  'Next.js': `${BASE_URL}static/icons/nextjs.png`,
} satisfies Record<string, string>

export type SkillName = keyof typeof SKILL_ICONS

export interface ExperienceEntry {
  title: string
  description: string
  // Up to 4 skills, see SKILL_ICONS
  skills: SkillName[]
}

export const EXPERIENCE: Record<number, ExperienceEntry> = {
  4: {
    title: 'RTB House – TypeScript Developer',
    description: 'Developed an internal AI chat assistant to support daily tasks. Built tracking scripts, crawlers, and reporting scripts.',
    skills: ['Python', 'TypeScript', 'AI'],
  },
  3: {
    title: 'Anfata Games – Full Stack Developer',
    description: 'Enhanced application performance and fixed critical bugs improving overall code stability. Integrated dynamic user content from a headless CMS.',
    skills: ['Next.js', 'TypeScript', 'React'],
  },
  2: {
    title: 'CeboTech – Python Developer',
    description: 'Contributed to AI-driven applications. REST API design. Domain-driven architecture. Developed app features to improve small business finance management.',
    skills: ['Python', 'AI', 'REST API', 'React'],
  },
  1: {
    title: 'Storm Gray Unit – Junior Frontend Developer',
    description: 'Developed React-based admin dashboards for IoT management. Collaborated on REST API design to ensure seamless data flow.',
    skills: ['React', 'REST API'],
  },
}
