import EditorJS, { type OutputData, type ToolConstructable, type ToolSettings } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import NestedList from '@editorjs/nested-list';
import Checklist from '@editorjs/checklist';
import Table from '@editorjs/table';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import InlineCode from '@editorjs/inline-code';
import Underline from '@editorjs/underline';
import SimpleImage from '@editorjs/simple-image';
import LinkTool from '@editorjs/link';
import Strikethrough from '@sotaproject/strikethrough';
import { escHtml, uploadFileToBucket } from '../../utils/cmsHelpers';
import {
  BentoTool,
  CarouselTool as FilmstripCarouselTool,
  CompareTool,
  LightboxGalleryTool,
} from './blocks/mediaBlocks';
import {
  AccordionTool,
  PullQuoteTool,
  SlidesTool,
  TabsTool,
} from './blocks/layoutTextBlocks';
import {
  BadgesTool,
  CardsTool,
  ProsConsTool,
  StatsTool,
  TagsTool,
  TimelineTool,
} from './blocks/structuredBlocks';

interface ToolConstructorOptions<T = Record<string, any>> {
  data?: T;
}

export class CustomMediaTool {
  private data: { url?: string; caption?: string };
  private elements?: {
    root: HTMLDivElement;
    input: HTMLInputElement;
    caption: HTMLInputElement;
  };

  constructor(options: ToolConstructorOptions<{ url?: string; caption?: string }>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-media-fields';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Paste image URL';
    input.value = this.data.url || '';

    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';

    const caption = document.createElement('input');
    caption.type = 'text';
    caption.placeholder = 'Caption';
    caption.value = this.data.caption || '';

    const preview = document.createElement('div');
    preview.className = 'custom-media-preview';

    const paint = (url: string) => {
      preview.innerHTML = url ? `<img src="${escHtml(url)}" alt="">` : '';
    };
    paint(input.value);

    input.oninput = () => paint(input.value);
    file.onchange = async () => {
      const selected = file.files?.[0];
      if (!selected) return;
      const bucketUrl = await uploadFileToBucket(selected, 'writing');
      if (bucketUrl) {
        input.value = bucketUrl;
        paint(bucketUrl);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || '');
        input.value = res;
        paint(res);
      };
      reader.readAsDataURL(selected);
    };

    root.append(input, file, caption, preview);
    this.elements = { root, input, caption };
    return root;
  }

  save() {
    return {
      url: this.elements?.input.value.trim() || '',
      caption: this.elements?.caption.value.trim() || '',
    };
  }
}

export class GalleryTool {
  private data: { items?: string[] };
  private elements?: { urls: HTMLTextAreaElement };

  constructor(options: ToolConstructorOptions<{ items?: string[] }>) {
    this.data = options.data || { items: [] };
  }

  static get toolbox() {
    return {
      title: 'Image gallery',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-media-fields';

    const urls = document.createElement('textarea');
    urls.rows = 4;
    urls.placeholder = 'Image URLs or data URLs, one per line';
    urls.value = (this.data.items || []).join('\n');

    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.multiple = true;

    const preview = document.createElement('div');
    preview.className = 'custom-carousel-preview';

    const paint = () => {
      const items = urls.value
        .split(/\n+/)
        .map((u) => u.trim())
        .filter(Boolean);
      preview.innerHTML = items
        .map((u) => `<img src="${escHtml(u)}" alt="">`)
        .join('');
    };
    paint();

    urls.oninput = paint;
    file.onchange = () => {
      const files = Array.from(file.files || []);
      const readers = files.map(
        (selected) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.readAsDataURL(selected);
          })
      );
      Promise.all(readers).then((items) => {
        urls.value =
          (urls.value.trim() ? `${urls.value.trim()}\n` : '') +
          items.join('\n');
        paint();
      });
    };

    root.append(urls, file, preview);
    this.elements = { urls };
    return root;
  }

  save() {
    return {
      items: (this.elements?.urls.value || '')
        .split(/\n+/)
        .map((u) => u.trim())
        .filter(Boolean),
    };
  }
}

export class CarouselTool extends GalleryTool {
  static get toolbox() {
    return {
      title: 'Carousel',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M2 8v8"/><path d="M22 8v8"/></svg>',
    };
  }
}

export class GifTool {
  private data: { url?: string; caption?: string };
  private elements?: { url: HTMLInputElement; caption: HTMLInputElement };

  constructor(options: ToolConstructorOptions<{ url?: string; caption?: string }>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'GIF',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9H7a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v-3H8"/><path d="M13 9v6"/><path d="M16 15V9h3"/><path d="M16 12h2"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-media-fields';

    const searchRow = document.createElement('div');
    searchRow.className = 'gif-search-row';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search free GIFs (trending or keyword)...';

    const searchBtn = document.createElement('button');
    searchBtn.type = 'button';
    searchBtn.className = 'b2';
    searchBtn.textContent = 'Search';

    searchRow.append(searchInput, searchBtn);

    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'gif-picker-grid';

    const url = document.createElement('input');
    url.type = 'url';
    url.placeholder = 'Or paste GIF / image URL';
    url.value = this.data.url || '';

    const caption = document.createElement('input');
    caption.type = 'text';
    caption.placeholder = 'Caption';
    caption.value = this.data.caption || '';

    const preview = document.createElement('div');
    preview.className = 'custom-media-preview';

    const paint = () => {
      preview.innerHTML = url.value
        ? `<img src="${escHtml(url.value)}" alt="${escHtml(caption.value || 'GIF')}">`
        : '';
    };
    paint();
    url.oninput = paint;

    const runSearch = async (query: string) => {
      resultsGrid.innerHTML = '<span class="gif-picker-status">Loading GIFs…</span>';
      try {
        const res = await fetch(
          `/api/gifs?q=${encodeURIComponent(query)}&limit=12`
        );
        const json = (await res.json()) as {
          results?: Array<{
            id: string;
            title: string;
            previewUrl: string;
            url: string;
          }>;
        };
        const items = json.results || [];
        if (!items.length) {
          resultsGrid.innerHTML =
            '<span class="gif-picker-status">No GIFs found. Try another keyword or paste a URL below.</span>';
          return;
        }
        resultsGrid.innerHTML = '';
        items.forEach((item) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'gif-picker-item';
          btn.title = item.title;
          btn.innerHTML = `<img src="${escHtml(item.previewUrl)}" alt="${escHtml(item.title)}" loading="lazy">`;
          btn.onclick = () => {
            url.value = item.url;
            if (!caption.value) caption.value = item.title;
            paint();
          };
          resultsGrid.appendChild(btn);
        });
      } catch {
        resultsGrid.innerHTML =
          '<span class="gif-picker-status">Could not load GIFs. Paste a GIF URL below.</span>';
      }
    };

    searchBtn.onclick = () => void runSearch(searchInput.value);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        void runSearch(searchInput.value);
      }
    });

    if (!this.data.url) {
      void runSearch('');
    }

    root.append(searchRow, resultsGrid, url, caption, preview);
    this.elements = { url, caption };
    return root;
  }

  save() {
    return {
      url: this.elements?.url.value.trim() || '',
      caption: this.elements?.caption.value.trim() || '',
    };
  }
}

export class DrawingTool {
  private data: { dataUrl?: string };
  private elements?: { canvas: HTMLCanvasElement };

  constructor(options: ToolConstructorOptions<{ dataUrl?: string }>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Drawing',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'drawing-tool';

    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 420;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      if (this.data.dataUrl) {
        const image = new Image();
        image.onload = () =>
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
        image.src = this.data.dataUrl;
      }
      context.strokeStyle = '#111';
      context.lineWidth = 4;
      context.lineCap = 'round';

      let drawing = false;
      const point = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: ((event.clientX - rect.left) * canvas.width) / rect.width,
          y: ((event.clientY - rect.top) * canvas.height) / rect.height,
        };
      };

      canvas.onpointerdown = (event) => {
        drawing = true;
        canvas.setPointerCapture(event.pointerId);
        const p = point(event);
        context.beginPath();
        context.moveTo(p.x, p.y);
      };
      canvas.onpointermove = (event) => {
        if (!drawing) return;
        const p = point(event);
        context.lineTo(p.x, p.y);
        context.stroke();
      };
      canvas.onpointerup = () => {
        drawing = false;
      };
    }

    root.append(canvas);
    this.elements = { canvas };
    return root;
  }

  save() {
    return {
      dataUrl: this.elements?.canvas.toDataURL('image/png') || '',
    };
  }
}

export class AttachTool {
  private data: { name?: string; dataUrl?: string };
  private elements?: {
    file: HTMLInputElement;
    name: HTMLInputElement;
    dataUrl: string;
    dataName: string;
  };

  constructor(options: ToolConstructorOptions<{ name?: string; dataUrl?: string }>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Attachment',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-media-fields';

    const file = document.createElement('input');
    file.type = 'file';

    const name = document.createElement('input');
    name.type = 'text';
    name.placeholder = 'Attachment label';
    name.value = this.data.name || '';

    root.append(file, name);
    const elements = {
      file,
      name,
      dataUrl: this.data.dataUrl || '',
      dataName: this.data.name || '',
    };
    this.elements = elements;

    file.onchange = () => {
      const selected = file.files?.[0];
      if (!selected) return;
      const reader = new FileReader();
      reader.onload = () => {
        elements.dataUrl = String(reader.result || '');
        elements.dataName = selected.name;
        if (!name.value) name.value = selected.name;
      };
      reader.readAsDataURL(selected);
    };

    return root;
  }

  save() {
    return {
      name: this.elements?.name.value.trim() || this.elements?.dataName || '',
      dataUrl: this.elements?.dataUrl || '',
    };
  }
}

export class ButtonTool {
  private data: { text?: string; url?: string };
  private elements?: { text: HTMLInputElement; url: HTMLInputElement };

  constructor(options: ToolConstructorOptions<{ text?: string; url?: string }>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Button',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="10" rx="5"/><path d="M9 12h6"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-media-fields';

    const text = document.createElement('input');
    text.placeholder = 'Button text';
    text.value = this.data.text || 'Learn more';

    const url = document.createElement('input');
    url.type = 'url';
    url.placeholder = 'https://';
    url.value = this.data.url || '';

    root.append(text, url);
    this.elements = { text, url };
    return root;
  }

  save() {
    return {
      text: this.elements?.text.value.trim() || '',
      url: this.elements?.url.value.trim() || '',
    };
  }
}

interface LayoutToolData {
  left?: string;
  right?: string;
  leftData?: OutputData;
  rightData?: OutputData;
}

function toColumnData(
  blockData?: OutputData,
  legacyText?: string
): OutputData {
  if (blockData && Array.isArray(blockData.blocks) && blockData.blocks.length) {
    return blockData;
  }
  return {
    blocks: [{ type: 'paragraph', data: { text: legacyText || '' } }],
  };
}

export class LayoutTool {
  private data: LayoutToolData;
  private leftEditor?: EditorJS;
  private rightEditor?: EditorJS;

  constructor(options: ToolConstructorOptions<LayoutToolData>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Two-column layout',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-layout-fields';

    const createColumn = (label: string, initial: OutputData) => {
      const col = document.createElement('div');
      col.className = 'custom-layout-col';

      const heading = document.createElement('div');
      heading.className = 'custom-layout-col-label';
      heading.textContent = label;

      const holder = document.createElement('div');
      holder.className = 'custom-layout-editor';

      col.append(heading, holder);
      const editor = new EditorJS({
        holder,
        data: initial,
        placeholder: 'Write or press / for blocks...',
        tools: getEditorTools(false),
        minHeight: 80,
      });

      return { col, editor };
    };

    const left = createColumn(
      'Left column',
      toColumnData(this.data.leftData, this.data.left)
    );
    const right = createColumn(
      'Right column',
      toColumnData(this.data.rightData, this.data.right)
    );

    this.leftEditor = left.editor;
    this.rightEditor = right.editor;

    // Prevent outer Editor.js from hijacking Enter/Backspace inside nested editors
    root.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });

    root.append(left.col, right.col);
    return root;
  }

  async save(): Promise<LayoutToolData> {
    const [leftData, rightData] = await Promise.all([
      this.leftEditor
        ? this.leftEditor.isReady.then(() => this.leftEditor!.save())
        : Promise.resolve(toColumnData(this.data.leftData, this.data.left)),
      this.rightEditor
        ? this.rightEditor.isReady.then(() => this.rightEditor!.save())
        : Promise.resolve(toColumnData(this.data.rightData, this.data.right)),
    ]);
    return { leftData, rightData };
  }

  destroy() {
    [this.leftEditor, this.rightEditor].forEach((ed) => {
      if (ed && typeof ed.destroy === 'function') {
        ed.isReady
          .then(() => ed.destroy())
          .catch(() => {
            // ignore
          });
      }
    });
  }
}

export class DelimiterTool {
  static get toolbox() {
    return {
      title: 'Horizontal rule',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'editor-hr-block';
    const hr = document.createElement('hr');
    hr.className = 'editor-hr';
    root.appendChild(hr);
    return root;
  }

  save() {
    return {};
  }
}

interface ToggleHeadingData {
  level?: 1 | 2 | 3;
  title?: string;
  open?: boolean;
  contentData?: OutputData;
}

class BaseToggleHeadingTool {
  protected defaultLevel: 1 | 2 | 3 = 1;
  private data: ToggleHeadingData;
  private titleInput?: HTMLInputElement;
  private isOpen = true;
  private bodyEditor?: EditorJS;

  constructor(options: ToolConstructorOptions<ToggleHeadingData>, level: 1 | 2 | 3) {
    this.defaultLevel = level;
    this.data = options.data || {};
    this.isOpen = this.data.open !== false;
  }

  render() {
    const level = this.data.level || this.defaultLevel;
    const root = document.createElement('div');
    root.className = `toggle-heading-block level-${level}`;

    const head = document.createElement('div');
    head.className = 'toggle-heading-head';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'toggle-heading-btn';
    toggleBtn.setAttribute('aria-expanded', String(this.isOpen));
    toggleBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l10 7-10 7z"/></svg>';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = `toggle-heading-input h${level}`;
    titleInput.placeholder = `Toggle Heading ${level}`;
    titleInput.value = this.data.title || '';

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'toggle-heading-body';
    bodyWrap.hidden = !this.isOpen;

    const syncOpen = () => {
      toggleBtn.setAttribute('aria-expanded', String(this.isOpen));
      toggleBtn.classList.toggle('open', this.isOpen);
      bodyWrap.hidden = !this.isOpen;
    };
    syncOpen();

    toggleBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.isOpen = !this.isOpen;
      syncOpen();
    };

    const holder = document.createElement('div');
    holder.className = 'toggle-heading-editor';
    bodyWrap.appendChild(holder);

    const initialContent: OutputData =
      this.data.contentData &&
      Array.isArray(this.data.contentData.blocks) &&
      this.data.contentData.blocks.length
        ? this.data.contentData
        : { blocks: [{ type: 'paragraph', data: { text: '' } }] };

    this.bodyEditor = new EditorJS({
      holder,
      data: initialContent,
      placeholder: 'Nested content (press / for blocks)...',
      tools: getEditorTools(false),
      minHeight: 48,
    });

    // Keep nested Editor.js Enter/Backspace isolated from outer Editor.js
    bodyWrap.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });

    head.append(toggleBtn, titleInput);
    root.append(head, bodyWrap);
    this.titleInput = titleInput;
    return root;
  }

  async save(): Promise<ToggleHeadingData> {
    const level = this.data.level || this.defaultLevel;
    const contentData = this.bodyEditor
      ? await this.bodyEditor.isReady.then(() => this.bodyEditor!.save())
      : this.data.contentData;
    return {
      level,
      title: this.titleInput?.value || '',
      open: this.isOpen,
      contentData,
    };
  }

  destroy() {
    if (this.bodyEditor && typeof this.bodyEditor.destroy === 'function') {
      this.bodyEditor.isReady
        .then(() => this.bodyEditor!.destroy())
        .catch(() => {
          // ignore
        });
    }
  }
}

export class CustomEmbedTool {
  private data: { source?: string; embed?: string; caption?: string };
  private elements?: {
    url: HTMLInputElement;
    caption: HTMLInputElement;
    embedUrl: string;
  };

  constructor(
    options: ToolConstructorOptions<{
      source?: string;
      embed?: string;
      caption?: string;
    }>
  ) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Embed',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    };
  }

  private toEmbedUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    try {
      const u = new URL(trimmed);
      const host = u.hostname.replace(/^www\./, '').toLowerCase();

      // YouTube
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
        if (u.pathname.startsWith('/shorts/')) {
          return `https://www.youtube.com/embed/${u.pathname.split('/')[2] || ''}`;
        }
      }
      if (host === 'youtu.be') {
        const id = u.pathname.slice(1);
        if (id) return `https://www.youtube.com/embed/${id}`;
      }

      // Vimeo
      if (host === 'vimeo.com') {
        const id = u.pathname.replace(/^\/+/, '').split('/')[0];
        if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
      }

      // CodePen
      if (host === 'codepen.io' && u.pathname.includes('/pen/')) {
        return trimmed.replace('/pen/', '/embed/');
      }

      // Spotify
      if (host === 'open.spotify.com' && !u.pathname.startsWith('/embed/')) {
        return `https://open.spotify.com/embed${u.pathname}`;
      }

      // Figma
      if (host === 'figma.com') {
        return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
          trimmed
        )}`;
      }

      // Loom
      if (host === 'loom.com' && u.pathname.startsWith('/share/')) {
        return trimmed.replace('/share/', '/embed/');
      }

      return trimmed;
    } catch {
      return '';
    }
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-media-fields';

    const url = document.createElement('input');
    url.type = 'url';
    url.placeholder = 'Paste YouTube, Vimeo, CodePen, Spotify, Figma, or embed URL';
    url.value = this.data.source || this.data.embed || '';

    const caption = document.createElement('input');
    caption.type = 'text';
    caption.placeholder = 'Caption (optional)';
    caption.value = this.data.caption || '';

    const preview = document.createElement('div');
    preview.className = 'custom-embed-preview';

    const elements = {
      url,
      caption,
      embedUrl: this.data.embed || this.toEmbedUrl(url.value),
    };
    this.elements = elements;

    const paint = () => {
      const embedUrl = this.toEmbedUrl(url.value);
      elements.embedUrl = embedUrl;
      preview.innerHTML = embedUrl
        ? `<iframe src="${escHtml(embedUrl)}" title="${escHtml(
            caption.value || 'Embedded content'
          )}" loading="lazy" allowfullscreen></iframe>`
        : '';
    };
    paint();

    url.oninput = paint;
    caption.oninput = () => {
      const iframe = preview.querySelector('iframe');
      if (iframe) iframe.title = caption.value || 'Embedded content';
    };

    root.append(url, caption, preview);
    return root;
  }

  save() {
    const source = this.elements?.url.value.trim() || '';
    const embed = this.toEmbedUrl(source);
    return {
      source,
      embed,
      caption: this.elements?.caption.value.trim() || '',
    };
  }
}

export class ToggleH1Tool extends BaseToggleHeadingTool {
  constructor(options: ToolConstructorOptions<ToggleHeadingData>) {
    super(options, 1);
  }
  static get toolbox() {
    return {
      title: 'toggleh1',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l5 4-5 4V6z" fill="currentColor"/><path d="M12 6v12"/><path d="M12 12h6"/><path d="M18 6v12"/></svg>',
    };
  }
}

export class ToggleH2Tool extends BaseToggleHeadingTool {
  constructor(options: ToolConstructorOptions<ToggleHeadingData>) {
    super(options, 2);
  }
  static get toolbox() {
    return {
      title: 'toggleh2',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l5 4-5 4V6z" fill="currentColor"/><path d="M11 8v8"/><path d="M11 12h4"/><path d="M15 8v8"/><path d="M18 10a2 2 0 1 1 3 1.7L18 16h3"/></svg>',
    };
  }
}

export class ToggleH3Tool extends BaseToggleHeadingTool {
  constructor(options: ToolConstructorOptions<ToggleHeadingData>) {
    super(options, 3);
  }
  static get toolbox() {
    return {
      title: 'toggleh3',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l5 4-5 4V6z" fill="currentColor"/><path d="M11 8v8"/><path d="M11 12h4"/><path d="M15 8v8"/><path d="M18 9h3l-1.8 2.5A2 2 0 0 1 21 15a2 2 0 0 1-3 .5"/></svg>',
    };
  }
}

export class SpoilerTool {
  private data: { label?: string; text?: string };
  private elements?: { label: HTMLInputElement; text: HTMLTextAreaElement };

  constructor(options: ToolConstructorOptions<{ label?: string; text?: string }>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Spoiler',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-media-fields';

    const label = document.createElement('input');
    label.type = 'text';
    label.placeholder = 'Spoiler warning / label (e.g. Plot spoiler)';
    label.value = this.data.label || 'Spoiler';

    const text = document.createElement('textarea');
    text.rows = 3;
    text.placeholder = 'Hidden spoiler text...';
    text.value = this.data.text || '';

    root.append(label, text);
    this.elements = { label, text };
    return root;
  }

  save() {
    return {
      label: this.elements?.label.value.trim() || 'Spoiler',
      text: this.elements?.text.value || '',
    };
  }
}

export type AlertVariant = 'info' | 'tip' | 'warning' | 'danger';

export class AlertTool {
  private data: { variant?: AlertVariant; title?: string; message?: string };
  private elements?: {
    variant: HTMLSelectElement;
    title: HTMLInputElement;
    message: HTMLTextAreaElement;
  };

  constructor(
    options: ToolConstructorOptions<{
      variant?: AlertVariant;
      title?: string;
      message?: string;
    }>
  ) {
    this.data = options.data || { variant: 'info' };
  }

  static get toolbox() {
    return {
      title: 'Alert',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    const initialVariant = this.data.variant || 'info';
    root.className = `custom-alert-fields variant-${initialVariant}`;

    const top = document.createElement('div');
    top.className = 'custom-alert-top';

    const iconEl = document.createElement('span');
    iconEl.className = 'custom-alert-icon';

    const icons: Record<AlertVariant, string> = {
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      tip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      danger: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    };
    iconEl.innerHTML = icons[initialVariant];

    const variant = document.createElement('select');
    (['info', 'tip', 'warning', 'danger'] as AlertVariant[]).forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v.charAt(0).toUpperCase() + v.slice(1);
      variant.appendChild(opt);
    });
    variant.value = initialVariant;
    variant.onchange = () => {
      const v = variant.value as AlertVariant;
      root.className = `custom-alert-fields variant-${v}`;
      iconEl.innerHTML = icons[v] || icons.info;
    };

    const title = document.createElement('input');
    title.type = 'text';
    title.placeholder = 'Alert title (optional)';
    title.value = this.data.title || '';

    top.append(iconEl, variant, title);

    const message = document.createElement('textarea');
    message.rows = 3;
    message.placeholder = 'Alert message...';
    message.value = this.data.message || '';

    root.append(top, message);
    this.elements = { variant, title, message };
    return root;
  }

  save() {
    return {
      variant: (this.elements?.variant.value as AlertVariant) || 'info',
      title: this.elements?.title.value.trim() || '',
      message: this.elements?.message.value || '',
    };
  }
}

export class CommentTool {
  private data: { text?: string };
  private elements?: { text: HTMLTextAreaElement };

  constructor(options: ToolConstructorOptions<{ text?: string }>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Comment',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-comment-fields';

    const badge = document.createElement('span');
    badge.className = 'custom-comment-badge';
    badge.textContent = 'Internal note (hidden on published site)';

    const text = document.createElement('textarea');
    text.rows = 2;
    text.placeholder = 'Write an editorial comment or reminder...';
    text.value = this.data.text || '';

    root.append(badge, text);
    this.elements = { text };
    return root;
  }

  save() {
    return {
      text: this.elements?.text.value || '',
    };
  }
}

export class CollapsibleTool {
  private data: { title?: string; text?: string };
  private elements?: { title: HTMLInputElement; text: HTMLTextAreaElement };

  constructor(options: ToolConstructorOptions<{ title?: string; text?: string }>) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Collapsible',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/><path d="M4 5h16"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-collapsible-fields';

    const title = document.createElement('input');
    title.placeholder = 'Title';
    title.value = this.data.title || '';

    const text = document.createElement('textarea');
    text.placeholder = 'Content';
    text.value = this.data.text || '';

    root.append(title, text);
    this.elements = { title, text };
    return root;
  }

  save() {
    return {
      title: this.elements?.title.value.trim() || '',
      text: this.elements?.text.value || '',
    };
  }
}

export class LinkPreviewTool {
  private data: {
    link?: string;
    url?: string;
    title?: string;
    description?: string;
  };
  private elements?: {
    url: HTMLInputElement;
    title: HTMLInputElement;
    description: HTMLInputElement;
  };

  constructor(
    options: ToolConstructorOptions<{
      link?: string;
      url?: string;
      title?: string;
      description?: string;
    }>
  ) {
    this.data = options.data || {};
  }

  static get toolbox() {
    return {
      title: 'Link',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'custom-media-fields';

    const url = document.createElement('input');
    url.type = 'url';
    url.placeholder = 'https://';
    url.value = this.data.link || this.data.url || '';

    const title = document.createElement('input');
    title.type = 'text';
    title.placeholder = 'Link title';
    title.value = this.data.title || '';

    const description = document.createElement('input');
    description.type = 'text';
    description.placeholder = 'Description';
    description.value = this.data.description || '';

    root.append(url, title, description);
    this.elements = { url, title, description };
    return root;
  }

  save() {
    return {
      link: this.elements?.url.value.trim() || '',
      title: this.elements?.title.value.trim() || '',
      description: this.elements?.description.value.trim() || '',
    };
  }
}

export class MarkerInline {
  static get isInline() {
    return true;
  }
  static get title() {
    return 'Marker';
  }
  render() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ce-inline-tool';
    button.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>';
    return button;
  }
  surround(range: Range) {
    const mark = document.createElement('mark');
    try {
      range.surroundContents(mark);
    } catch {
      // ignore cross-node selection
    }
  }
  checkState() {
    return false;
  }
}

export class MentionInline {
  static get isInline() {
    return true;
  }
  static get title() {
    return '@mention';
  }
  render() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ce-inline-tool';
    button.title = 'Mention with URL';
    button.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>';
    return button;
  }
  surround(range: Range) {
    const selectedText = range.toString().trim();
    const url = window.prompt('Enter profile or mention URL (https://...)');
    if (!url) return;
    const anchor = document.createElement('a');
    anchor.className = 'editor-mention';
    anchor.href = url.trim();
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    try {
      range.surroundContents(anchor);
      if (selectedText && !selectedText.startsWith('@')) {
        anchor.textContent = `@${selectedText}`;
      }
    } catch {
      // ignore cross-node selection
    }
  }
  checkState() {
    return false;
  }
}

export class HyperlinkInline {
  static get isInline() {
    return true;
  }
  static get title() {
    return 'Hyperlink';
  }
  render() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ce-inline-tool';
    button.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
    return button;
  }
  surround(range: Range) {
    const url = window.prompt('Enter URL');
    if (!url) return;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    try {
      range.surroundContents(anchor);
    } catch {
      // ignore cross-node selection
    }
  }
  checkState() {
    return false;
  }
}

export function getEditorTools(
  includeLayout = true
): Record<string, ToolConstructable | ToolSettings> {
  const tools: Record<string, ToolConstructable | ToolSettings> = {
    // 1. Most frequently used core blocks
    header: {
      class: Header as unknown as ToolConstructable,
      config: { placeholder: 'Heading', levels: [1, 2, 3], defaultLevel: 2 },
    },
    list: List as unknown as ToolConstructable,
    image: CustomMediaTool as unknown as ToolConstructable,
    quote: {
      class: Quote as unknown as ToolConstructable,
      inlineToolbar: true,
      config: {
        quotePlaceholder: 'Enter a quote',
        captionPlaceholder: 'Quote author',
      },
    },
    code: CodeTool as unknown as ToolConstructable,
    linkTool: {
      class: LinkTool as unknown as ToolConstructable,
      config: {
        endpoint: '/api/fetchUrl',
      },
    },
    delimiter: DelimiterTool as unknown as ToolConstructable,
    checklist: Checklist as unknown as ToolConstructable,
    table: Table as unknown as ToolConstructable,
    alert: AlertTool as unknown as ToolConstructable,

    // 2. Common rich media & layout
    embed: CustomEmbedTool as unknown as ToolConstructable,
    gallery: LightboxGalleryTool as unknown as ToolConstructable,
    carousel: FilmstripCarouselTool as unknown as ToolConstructable,
    bento: BentoTool as unknown as ToolConstructable,
    ...(includeLayout
      ? { layout: LayoutTool as unknown as ToolConstructable }
      : {}),
    tabs: TabsTool as unknown as ToolConstructable,
    accordion: AccordionTool as unknown as ToolConstructable,
    toggleh1: ToggleH1Tool as unknown as ToolConstructable,
    toggleh2: ToggleH2Tool as unknown as ToolConstructable,
    toggleh3: ToggleH3Tool as unknown as ToolConstructable,

    // 3. Structured & editorial blocks
    pullquote: PullQuoteTool as unknown as ToolConstructable,
    timeline: TimelineTool as unknown as ToolConstructable,
    stats: StatsTool as unknown as ToolConstructable,
    proscons: ProsConsTool as unknown as ToolConstructable,
    cards: CardsTool as unknown as ToolConstructable,
    badges: BadgesTool as unknown as ToolConstructable,
    tags: TagsTool as unknown as ToolConstructable,
    button: ButtonTool as unknown as ToolConstructable,

    // 4. Specialized / least frequent blocks
    gif: GifTool as unknown as ToolConstructable,
    compare: CompareTool as unknown as ToolConstructable,
    slides: SlidesTool as unknown as ToolConstructable,
    spoiler: SpoilerTool as unknown as ToolConstructable,
    collapsible: CollapsibleTool as unknown as ToolConstructable,
    attaches: AttachTool as unknown as ToolConstructable,
    drawing: DrawingTool as unknown as ToolConstructable,
    nestedlist: NestedList as unknown as ToolConstructable,
    simpleImage: SimpleImage as unknown as ToolConstructable,
    comment: CommentTool as unknown as ToolConstructable,

    // Inline toolbar tools
    inlineCode: InlineCode as unknown as ToolConstructable,
    marker: MarkerInline as unknown as ToolConstructable,
    underline: Underline as unknown as ToolConstructable,
    strikethrough: Strikethrough as unknown as ToolConstructable,
    hyperlink: HyperlinkInline as unknown as ToolConstructable,
    mention: MentionInline as unknown as ToolConstructable,
  };
  return tools;
}
