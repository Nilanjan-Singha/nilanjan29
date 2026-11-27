export type SocialKey =
  | 'dribbble'
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'github'
  | 'link';

export type TracklistStatus = 'Want to' | 'In progress' | 'Completed' | 'Paused';

export interface StatItem {
  n: string;
  l: string;
}

export interface ProfileData {
  name: string;
  role: string;
  initial: string;
  avatar: string;
  cover: string;
  bio: string;
  stats: StatItem[];
}

export interface FactItem {
  k: string;
  v: string;
}

export interface AboutData {
  paras: string[];
  facts: FactItem[];
}

export interface JobItem {
  yr: string;
  role: string;
  co: string;
  desc: string;
}

export interface WorkData {
  email: string;
  jobs: JobItem[];
}

export interface SkillsData {
  core: string[];
  languages: string[];
  frontend: string[];
  ai: string[];
  tools: string[];
}

export interface ListItem {
  t: string;
  s: string;
  status?: TracklistStatus;
  c?: string;
  c2?: string;
  ink?: string;
  img?: string;
  url?: string;
}

export interface ListShelf {
  name: string;
  items: ListItem[];
}

export interface EditorJSBlock {
  id?: string;
  type: string;
  data: Record<string, unknown>;
}

export interface EditorJSData {
  time?: number;
  version?: string;
  blocks: EditorJSBlock[];
}

export interface PostItem {
  id?: string;
  t: string;
  d: string;
  tags: string | string[];
  x: string;
  body: string | string[];
  bodyData: EditorJSData | null;
}

export interface RenderedPost {
  id: string;
  d: string;
  tags: string[];
  t: string;
  x: string;
  bodyHtml: string[];
}

export interface ProjectItem {
  t: string;
  x: string;
  url?: string;
  img?: string;
  c1?: string;
  c2?: string;
}

export interface PhotoItem {
  src: string;
  alt?: string;
}

export type ThemePreference =
  | 'system'
  | 'light'
  | 'dark'
  | 'catppuccin-latte'
  | 'catppuccin-frappe'
  | 'catppuccin-macchiato'
  | 'catppuccin-mocha';

export type FontFamilyOption =
  | 'geist-mono'
  | 'newsreader'
  | 'inter'
  | 'jetbrains-mono'
  | 'system';

export interface SiteSettings {
  theme: ThemePreference;
  fontFamily: FontFamilyOption;
  accentColor?: string;
}

export interface CmsData {
  settings?: SiteSettings;
  profile: ProfileData;
  about: AboutData;
  work: WorkData;
  skills: SkillsData;
  lists: ListShelf[];
  posts: PostItem[];
  projects: ProjectItem[];
  photos: PhotoItem[];
}
