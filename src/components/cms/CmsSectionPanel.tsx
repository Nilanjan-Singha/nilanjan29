import React from 'react';
import {
  ACCENT_PRESETS,
  DEFAULT_SETTINGS,
  FONT_FAMILY_OPTIONS,
  TRACKLIST_STATUSES,
} from '../../data/staticData';
import type {
  CmsData,
  FactItem,
  FontFamilyOption,
  JobItem,
  ListItem,
  ListShelf,
  PhotoItem,
  PostItem,
  ProjectItem,
  StatItem,
  ThemePreference,
  TracklistStatus,
} from '../../types/cms';
import { CMS_SECTIONS, type CmsSectionId } from './CmsSidebar';
import { ImageField } from './ImageField';
import { ObjectListField } from './ObjectListField';
import { StringListField } from './StringListField';

interface CmsSectionPanelProps {
  sectionId: CmsSectionId;
  data: CmsData;
  saveStatus: string;
  onUpdate: (updater: (prev: CmsData) => CmsData) => void;
  onCreateAndEditPost: () => void;
}

export const CmsSectionPanel: React.FC<CmsSectionPanelProps> = ({
  sectionId,
  data,
  saveStatus,
  onUpdate,
  onCreateAndEditPost,
}) => {
  const meta = CMS_SECTIONS.find((s) => s.id === sectionId) || CMS_SECTIONS[0];

  return (
    <main>
      <header className="mh">
        <div>
          <h1>{meta.label}</h1>
          <p>{meta.description}</p>
        </div>
        <span className="stat" id="stat">
          {saveStatus}
        </span>
      </header>

      <div className="fields">
        {sectionId === 'general' && (
          <>
            <label className="f">
              <span className="l">Default theme</span>
              <select
                value={data.settings?.theme || 'system'}
                onChange={(e) => {
                  const theme = e.target.value as ThemePreference;
                  try {
                    localStorage.removeItem('theme');
                  } catch {
                    // ignore
                  }
                  onUpdate((prev) => ({
                    ...prev,
                    settings: {
                      ...DEFAULT_SETTINGS,
                      ...(prev.settings || {}),
                      theme,
                    },
                  }));
                }}
              >
                <option value="system">System (Auto)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="catppuccin-latte">Catppuccin Latte (Light)</option>
                <option value="catppuccin-frappe">Catppuccin Frappé (Dark)</option>
                <option value="catppuccin-macchiato">Catppuccin Macchiato (Dark)</option>
                <option value="catppuccin-mocha">Catppuccin Mocha (Dark)</option>
              </select>
            </label>

            <label className="f">
              <span className="l">Font family</span>
              <select
                value={data.settings?.fontFamily || 'geist-mono'}
                onChange={(e) => {
                  const fontFamily = e.target.value as FontFamilyOption;
                  onUpdate((prev) => ({
                    ...prev,
                    settings: {
                      ...DEFAULT_SETTINGS,
                      ...(prev.settings || {}),
                      fontFamily,
                    },
                  }));
                }}
              >
                {FONT_FAMILY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="f full">
              <span className="l">Accent color</span>
              <div className="accent-presets">
                {ACCENT_PRESETS.map((preset) => {
                  const isActive =
                    (data.settings?.accentColor || '').toLowerCase() ===
                    preset.color.toLowerCase();
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      className={`swatch${isActive ? ' active' : ''}`}
                      title={preset.name}
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          settings: {
                            ...DEFAULT_SETTINGS,
                            ...(prev.settings || {}),
                            accentColor: preset.color,
                          },
                        }))
                      }
                    >
                      <span
                        className="swatch-dot"
                        style={{
                          background: preset.color || '#44691b',
                        }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="ir" style={{ marginTop: '8px' }}>
                <input
                  type="color"
                  value={data.settings?.accentColor || '#44691b'}
                  onChange={(e) => {
                    const accentColor = e.target.value;
                    onUpdate((prev) => ({
                      ...prev,
                      settings: {
                        ...DEFAULT_SETTINGS,
                        ...(prev.settings || {}),
                        accentColor,
                      },
                    }));
                  }}
                />
                <input
                  type="text"
                  className="iu"
                  placeholder="#44691b (leave empty for theme default)"
                  value={data.settings?.accentColor || ''}
                  onChange={(e) => {
                    const accentColor = e.target.value.trim();
                    onUpdate((prev) => ({
                      ...prev,
                      settings: {
                        ...DEFAULT_SETTINGS,
                        ...(prev.settings || {}),
                        accentColor,
                      },
                    }));
                  }}
                />
                {data.settings?.accentColor && (
                  <button
                    className="b2"
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        settings: {
                          ...DEFAULT_SETTINGS,
                          ...(prev.settings || {}),
                          accentColor: '',
                        },
                      }))
                    }
                  >
                    Reset color
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {sectionId === 'profile' && (
          <>
            <ImageField
              label="Cover image"
              value={data.profile.cover}
              maxWidth={1800}
              folder="profile"
              onChange={(cover) =>
                onUpdate((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, cover },
                }))
              }
            />
            <ImageField
              label="Avatar"
              value={data.profile.avatar}
              maxWidth={400}
              round
              folder="profile"
              onChange={(avatar) =>
                onUpdate((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, avatar },
                }))
              }
            />
            <label className="f">
              <span className="l">Name</span>
              <input
                type="text"
                value={data.profile.name}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, name: e.target.value },
                  }))
                }
              />
            </label>
            <label className="f">
              <span className="l">Role</span>
              <input
                type="text"
                value={data.profile.role}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, role: e.target.value },
                  }))
                }
              />
            </label>
            <label className="f">
              <span className="l">
                Avatar letter (used when there is no image)
              </span>
              <input
                type="text"
                value={data.profile.initial}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, initial: e.target.value },
                  }))
                }
              />
            </label>
            <label className="f full">
              <span className="l">Bio</span>
              <textarea
                rows={4}
                value={data.profile.bio}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, bio: e.target.value },
                  }))
                }
              />
            </label>
            <ObjectListField<StatItem>
              label="Stats"
              items={data.profile.stats}
              addLabel="Add stat"
              inline
              createItem={() => ({ n: '', l: '' })}
              onChange={(stats) =>
                onUpdate((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, stats },
                }))
              }
              renderFields={(item, _, updateItem) => (
                <>
                  <label className="f full">
                    <span className="l">Number</span>
                    <input
                      type="text"
                      value={item.n}
                      onChange={(e) => updateItem({ n: e.target.value })}
                    />
                  </label>
                  <label className="f full">
                    <span className="l">Label</span>
                    <input
                      type="text"
                      value={item.l}
                      onChange={(e) => updateItem({ l: e.target.value })}
                    />
                  </label>
                </>
              )}
            />
          </>
        )}

        {sectionId === 'about' && (
          <>
            <StringListField
              label="Paragraphs"
              items={data.about.paras}
              addLabel="Add paragraph"
              area
              rows={3}
              onChange={(paras) =>
                onUpdate((prev) => ({
                  ...prev,
                  about: { ...prev.about, paras },
                }))
              }
            />
            <ObjectListField<FactItem>
              label="Facts"
              items={data.about.facts}
              addLabel="Add fact"
              inline
              createItem={() => ({ k: '', v: '' })}
              onChange={(facts) =>
                onUpdate((prev) => ({
                  ...prev,
                  about: { ...prev.about, facts },
                }))
              }
              renderFields={(item, _, updateItem) => (
                <>
                  <label className="f full">
                    <span className="l">Label</span>
                    <input
                      type="text"
                      value={item.k}
                      onChange={(e) => updateItem({ k: e.target.value })}
                    />
                  </label>
                  <label className="f full">
                    <span className="l">Value</span>
                    <input
                      type="text"
                      value={item.v}
                      onChange={(e) => updateItem({ v: e.target.value })}
                    />
                  </label>
                </>
              )}
            />
          </>
        )}

        {sectionId === 'work' && (
          <>
            <label className="f">
              <span className="l">Contact email</span>
              <input
                type="text"
                value={data.work.email}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    work: { ...prev.work, email: e.target.value },
                  }))
                }
              />
            </label>
            <ObjectListField<JobItem>
              label="Roles and education"
              items={data.work.jobs}
              addLabel="Add role"
              summaryKey="role"
              createItem={() => ({
                yr: '',
                role: 'New role',
                co: '',
                desc: '',
              })}
              onChange={(jobs) =>
                onUpdate((prev) => ({
                  ...prev,
                  work: { ...prev.work, jobs },
                }))
              }
              renderFields={(item, _, updateItem) => (
                <>
                  <label className="f">
                    <span className="l">Years</span>
                    <input
                      type="text"
                      value={item.yr}
                      onChange={(e) => updateItem({ yr: e.target.value })}
                    />
                  </label>
                  <label className="f">
                    <span className="l">Title</span>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => updateItem({ role: e.target.value })}
                    />
                  </label>
                  <label className="f full">
                    <span className="l">Company or school</span>
                    <input
                      type="text"
                      value={item.co}
                      onChange={(e) => updateItem({ co: e.target.value })}
                    />
                  </label>
                  <label className="f full">
                    <span className="l">Description</span>
                    <textarea
                      rows={3}
                      value={item.desc}
                      onChange={(e) => updateItem({ desc: e.target.value })}
                    />
                  </label>
                </>
              )}
            />
          </>
        )}

        {sectionId === 'skills' && (
          <>
            <StringListField
              label="Core skills"
              items={data.skills.core}
              addLabel="Add skill"
              onChange={(core) =>
                onUpdate((prev) => ({
                  ...prev,
                  skills: { ...prev.skills, core },
                }))
              }
            />
            <StringListField
              label="Languages (icon names)"
              items={data.skills.languages}
              addLabel="Add language"
              onChange={(languages) =>
                onUpdate((prev) => ({
                  ...prev,
                  skills: { ...prev.skills, languages },
                }))
              }
            />
            <StringListField
              label="Frontend & backend (icon names)"
              items={data.skills.frontend}
              addLabel="Add technology"
              onChange={(frontend) =>
                onUpdate((prev) => ({
                  ...prev,
                  skills: { ...prev.skills, frontend },
                }))
              }
            />
            <StringListField
              label="AI & data (icon names)"
              items={data.skills.ai}
              addLabel="Add technology"
              onChange={(ai) =>
                onUpdate((prev) => ({
                  ...prev,
                  skills: { ...prev.skills, ai },
                }))
              }
            />
            <StringListField
              label="Tools & platforms (icon names)"
              items={data.skills.tools}
              addLabel="Add tool"
              onChange={(tools) =>
                onUpdate((prev) => ({
                  ...prev,
                  skills: { ...prev.skills, tools },
                }))
              }
            />
          </>
        )}

        {sectionId === 'lists' && (
          <ObjectListField<ListShelf>
            label="Shelves"
            items={data.lists}
            addLabel="Add shelf"
            summaryKey="name"
            createItem={() => ({ name: 'New shelf', items: [] })}
            onChange={(lists) => onUpdate((prev) => ({ ...prev, lists }))}
            renderFields={(shelf, _, updateShelf) => (
              <>
                <label className="f full">
                  <span className="l">Shelf name</span>
                  <input
                    type="text"
                    value={shelf.name}
                    onChange={(e) => updateShelf({ name: e.target.value })}
                  />
                </label>
                <ObjectListField<ListItem>
                  label="Items (ranked in order)"
                  items={shelf.items || []}
                  addLabel="Add item"
                  inline
                  createItem={() => ({
                    t: '',
                    s: '',
                    status: 'Want to',
                    img: '',
                    url: '',
                  })}
                  onChange={(items) => updateShelf({ items })}
                  renderFields={(item, __, updateItem) => (
                    <>
                      <label className="f full">
                        <span className="l">Title</span>
                        <input
                          type="text"
                          value={item.t}
                          onChange={(e) => updateItem({ t: e.target.value })}
                        />
                      </label>
                      <label className="f full">
                        <span className="l">Author or studio</span>
                        <input
                          type="text"
                          value={item.s}
                          onChange={(e) => updateItem({ s: e.target.value })}
                        />
                      </label>
                      <label className="f">
                        <span className="l">Status</span>
                        <select
                          value={item.status || 'Want to'}
                          onChange={(e) =>
                            updateItem({
                              status: e.target.value as TracklistStatus,
                            })
                          }
                        >
                          {TRACKLIST_STATUSES.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="f full">
                        <span className="l">URL (Spotify, YouTube, Goodreads, etc.)</span>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={item.url || ''}
                          onChange={(e) => updateItem({ url: e.target.value })}
                        />
                      </label>
                      <ImageField
                        label="Cover image"
                        value={item.img || ''}
                        maxWidth={420}
                        wide
                        folder="lists"
                        onChange={(img) => updateItem({ img })}
                      />
                    </>
                  )}
                />
              </>
            )}
          />
        )}

        {sectionId === 'writing' && (
          <ObjectListField<PostItem>
            label="Posts"
            items={data.posts}
            addLabel="New post"
            summaryKey="t"
            top
            isPostList
            createItem={() => ({
              t: 'Untitled post',
              d: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              tags: '',
              x: '',
              body: '',
              bodyData: null,
            })}
            onNewPost={onCreateAndEditPost}
            onChange={(posts) => onUpdate((prev) => ({ ...prev, posts }))}
            renderFields={(item, _, updateItem) => (
              <>
                <label className="f full">
                  <span className="l">Title</span>
                  <input
                    type="text"
                    value={item.t}
                    onChange={(e) => updateItem({ t: e.target.value })}
                  />
                </label>
                <label className="f">
                  <span className="l">Date</span>
                  <input
                    type="text"
                    value={item.d}
                    onChange={(e) => updateItem({ d: e.target.value })}
                  />
                </label>
                <label className="f">
                  <span className="l">Tags (comma separated)</span>
                  <input
                    type="text"
                    value={
                      Array.isArray(item.tags)
                        ? item.tags.join(', ')
                        : item.tags || ''
                    }
                    onChange={(e) => updateItem({ tags: e.target.value })}
                  />
                </label>
                <label className="f full">
                  <span className="l">Excerpt</span>
                  <textarea
                    rows={2}
                    value={item.x}
                    onChange={(e) => updateItem({ x: e.target.value })}
                  />
                </label>
              </>
            )}
          />
        )}

        {sectionId === 'projects' && (
          <ObjectListField<ProjectItem>
            label="Projects"
            items={data.projects}
            addLabel="Add project"
            summaryKey="t"
            createItem={() => ({
              t: 'New project',
              x: '',
              url: '',
              img: '',
            })}
            onChange={(projects) => onUpdate((prev) => ({ ...prev, projects }))}
            renderFields={(item, _, updateItem) => (
              <>
                <label className="f full">
                  <span className="l">Name</span>
                  <input
                    type="text"
                    value={item.t}
                    onChange={(e) => updateItem({ t: e.target.value })}
                  />
                </label>
                <label className="f full">
                  <span className="l">Description</span>
                  <textarea
                    rows={2}
                    value={item.x}
                    onChange={(e) => updateItem({ x: e.target.value })}
                  />
                </label>
                <label className="f">
                  <span className="l">Project URL</span>
                  <input
                    type="text"
                    value={item.url || ''}
                    onChange={(e) => updateItem({ url: e.target.value })}
                  />
                </label>
                <ImageField
                  label="Project image"
                  value={item.img || ''}
                  maxWidth={1000}
                  folder="projects"
                  onChange={(img) => updateItem({ img })}
                />
              </>
            )}
          />
        )}

        {sectionId === 'photos' && (
          <ObjectListField<PhotoItem>
            label="Photos"
            items={data.photos}
            addLabel="Add photo"
            inline
            createItem={() => ({ src: '', alt: '' })}
            onChange={(photos) => onUpdate((prev) => ({ ...prev, photos }))}
            renderFields={(item, _, updateItem) => (
              <>
                <ImageField
                  label="Photo"
                  value={item.src || ''}
                  maxWidth={1200}
                  wide
                  folder="photography"
                  onChange={(src) => updateItem({ src })}
                />
                <label className="f full">
                  <span className="l">Description</span>
                  <input
                    type="text"
                    value={item.alt || ''}
                    onChange={(e) => updateItem({ alt: e.target.value })}
                  />
                </label>
              </>
            )}
          />
        )}
      </div>
    </main>
  );
};
