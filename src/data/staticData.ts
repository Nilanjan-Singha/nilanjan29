import type { FontFamilyOption, SiteSettings, SkillsData, SocialKey } from '../types/cms';

export const ICONS: Record<SocialKey, string> = {
  dribbble:
    '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.6 4.6a8.1 8.1 0 011.8 4.9c-.3-.1-2.8-.6-5.3-.2l-.6-1.400c2.100-.9 3.400-2 4.100-3.300zM12 3.900c1.900 0 3.600.7 4.900 1.800-.6 1.100-1.800 2.100-3.700 2.900A33 33 0 0010.200 4.300c.6-.3 1.200-.4 1.800-.4zM8.700 4.900c1 1.300 1.900 2.800 2.800 4.400-3.400.9-6.200.9-6.800.9A8.100 8.100 0 018.700 4.900zM3.900 12v-.2c.7 0 4 0 7.700-1l.8 1.700c-3.300 1-6 3.400-7.700 6A8.100 8.100 0 013.900 12zm8.100 8.100c-1.700 0-3.200-.6-4.500-1.500 1.600-2.500 3.900-4.500 6.900-5.300.8 2.200 1.300 4.300 1.500 5.200-1.200.5-2.500.6-3.900.6zm5.500-1.600a38 38 0 00-1.300-4.700c2-.3 3.800 0 4.300.1a8.100 8.100 0 01-3 4.600z"/>',
  twitter:
    '<path d="M22 5.900c-.7.3-1.500.5-2.300.6.800-.5 1.500-1.300 1.800-2.200-.8.500-1.700.8-2.600 1a4.100 4.100 0 00-7 3.700A11.600 11.600 0 014.500 4.700a4.100 4.100 0 001.300 5.500c-.7 0-1.300-.2-1.900-.5 0 2 1.400 3.700 3.300 4.100-.6.2-1.200.2-1.800.1.500 1.600 2 2.800 3.800 2.900A8.300 8.300 0 012 18.500 11.600 11.600 0 008.300 20.300c7.500 0 11.700-6.300 11.700-11.700v-.5c.8-.6 1.500-1.300 2-2.200z"/>',
  instagram:
    '<path d="M12 7.300A4.700 4.700 0 1016.700 12 4.700 4.700 0 0012 7.300zm0 7.700a3 3 0 113-3 3 3 0 01-3 3zM17 6a1.100 1.100 0 11-1.100 1.100A1.100 1.100 0 0117 6zM12 3.800c2.700 0 3 0 4.100.1 2.800.1 4 1.400 4.100 4.100.1 1.100.1 1.400.1 4.100s0 3-.1 4.100c-.1 2.700-1.400 4-4.100 4.100-1.100.1-1.400.1-4.100.1s-3 0-4.100-.1c-2.800-.1-4-1.400-4.100-4.100-.1-1.100-.1-1.400-.1-4.100s0-3 .1-4.100C3.900 5.300 5.200 4 7.900 3.900 9 3.800 9.300 3.800 12 3.800zM12 2c-2.700 0-3.100 0-4.200.1C4.200 2.200 2.200 4.200 2.100 7.800 2 8.900 2 9.300 2 12s0 3.100.1 4.200c.1 3.600 2.100 5.600 5.700 5.700 1.100.1 1.500.1 4.200.1s3.100 0 4.200-.1c3.600-.1 5.600-2.100 5.700-5.700.1-1.100.1-1.500.1-4.200s0-3.100-.1-4.200c-.1-3.600-2.100-5.600-5.700-5.700C15.100 2 14.700 2 12 2z"/>',
  linkedin:
    '<path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.300 18H5.700V9.700h2.600zM7 8.600a1.500 1.500 0 110-3 1.500 1.500 0 010 3zM18.300 18h-2.600v-4c0-1 0-2.200-1.400-2.200s-1.600 1-1.600 2.100v4.100H10.100V9.700h2.500v1.100c.4-.7 1.300-1.300 2.600-1.300 2.700 0 3.100 1.800 3.100 4z"/>',
  github:
    '<path d="M12 2a10 10 0 00-3.200 19.500c.5.100.7-.2.7-.5v-1.700c-2.800.6-3.400-1.300-3.400-1.300-.5-1.100-1.100-1.400-1.100-1.400-.9-.6.100-.6.100-.6 1 .1 1.500 1 1.500 1 .9 1.500 2.300 1.100 2.900.8.1-.7.3-1.100.6-1.300-2.200-.3-4.600-1.100-4.600-5 0-1.100.4-2 1-2.700-.1-.3-.4-1.300.1-2.700 0 0 .8-.3 2.700 1a9.300 9.300 0 015 0c1.900-1.300 2.700-1 2.700-1 .5 1.400.2 2.400.1 2.700.6.700 1 1.600 1 2.700 0 3.900-2.300 4.700-4.600 5 .4.300.7.900.7 1.800v2.700c0 .3.2.6.7.5A10 10 0 0012 2z"/>',
  link: '<path d="M10.600 13.400a1 1 0 001.400 1.400l3.500-3.500a3 3 0 10-4.200-4.200l-1.100 1.100 1.400 1.400 1.100-1.100a1 1 0 111.400 1.400zm2.800-2.800a1 1 0 00-1.400-1.400l-3.500 3.500a3 3 0 104.200 4.200l1.100-1.100-1.400-1.400-1.100 1.100a1 1 0 11-1.400-1.400z"/>',
};

export const SOCIALS: { primary: SocialKey[]; footer: SocialKey[] } = {
  primary: ['dribbble', 'twitter', 'instagram', 'linkedin'],
  footer: ['dribbble', 'twitter', 'instagram', 'linkedin', 'github'],
};

export const SKILL_LABELS: Record<string, string> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  py: 'Python',
  java: 'Java',
  go: 'Go',
  rust: 'Rust',
  react: 'React',
  nextjs: 'Next.js',
  tailwind: 'Tailwind CSS',
  nodejs: 'Node.js',
  nestjs: 'NestJS',
  spring: 'Spring',
  pytorch: 'PyTorch',
  mongodb: 'MongoDB',
  postgres: 'PostgreSQL',
  redis: 'Redis',
  rabbitmq: 'RabbitMQ',
  prisma: 'Prisma',
  git: 'Git',
  github: 'GitHub',
  vscode: 'VS Code',
  postman: 'Postman',
  linux: 'Linux',
  vercel: 'Vercel',
};

export const DEFAULT_SKILLS: SkillsData = {
  core: ['Frontend', 'Backend', 'AI & ML', 'Product design'],
  languages: ['js', 'ts', 'py', 'java', 'go', 'rust'],
  frontend: ['react', 'nextjs', 'tailwind', 'nodejs', 'nestjs', 'spring'],
  ai: ['pytorch', 'mongodb', 'postgres', 'redis', 'rabbitmq', 'prisma'],
  tools: ['git', 'github', 'vscode', 'postman', 'linux', 'vercel'],
};

export const TRACKLIST_STATUSES = [
  'Want to',
  'In progress',
  'Completed',
  'Paused',
] as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  theme: 'catppuccin-mocha',
  fontFamily: 'geist-mono',
  accentColor: '',
};

export const FONT_FAMILY_OPTIONS: {
  value: FontFamilyOption;
  label: string;
  stack: string;
}[] = [
  {
    value: 'geist-mono',
    label: 'Geist Mono (Default)',
    stack: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  {
    value: 'newsreader',
    label: 'Newsreader (Editorial Serif)',
    stack: '"Newsreader", Georgia, "Times New Roman", serif',
  },
  {
    value: 'inter',
    label: 'Inter (Clean Sans)',
    stack: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    value: 'jetbrains-mono',
    label: 'JetBrains Mono (Code)',
    stack: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  {
    value: 'system',
    label: 'System UI',
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
];

export const ACCENT_PRESETS: { name: string; color: string }[] = [
  { name: 'Default Olive', color: '' },
  { name: 'Sage', color: '#8fba55' },
  { name: 'Forest', color: '#44691b' },
  { name: 'Ocean', color: '#2563eb' },
  { name: 'Indigo', color: '#4f46e5' },
  { name: 'Teal', color: '#0d9488' },
  { name: 'Terracotta', color: '#c2410c' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Amber', color: '#d97706' },
];
