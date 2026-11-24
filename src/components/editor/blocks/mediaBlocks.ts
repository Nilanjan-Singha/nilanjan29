import { escHtml, uploadFileToBucket } from '../../../utils/cmsHelpers';

interface ToolOptions<T = Record<string, any>> {
  data?: T;
}

function attachUpload(
  fileInput: HTMLInputElement,
  folder: string,
  onUrl: (url: string) => void
) {
  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const bucketUrl = await uploadFileToBucket(file, folder);
    if (bucketUrl) {
      onUrl(bucketUrl);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  };
}

export type BentoPreset = 'hero-left' | 'hero-top' | 'equal';

export interface BentoTile {
  kind: 'image' | 'text';
  url?: string;
  title?: string;
  text?: string;
}

export class BentoTool {
  private data: { preset?: BentoPreset; tiles?: BentoTile[] };
  private tiles: BentoTile[];
  private preset: BentoPreset;

  constructor(options: ToolOptions<{ preset?: BentoPreset; tiles?: BentoTile[] }>) {
    this.data = options.data || {};
    this.preset = this.data.preset || 'hero-left';
    this.tiles =
      Array.isArray(this.data.tiles) && this.data.tiles.length
        ? this.data.tiles.map((t) => ({ ...t }))
        : [
            { kind: 'image', url: '', title: 'Hero tile', text: '' },
            { kind: 'text', title: 'Side note', text: 'Short highlight' },
            { kind: 'image', url: '', title: 'Detail', text: '' },
          ];
  }

  static get toolbox() {
    return {
      title: 'Bento grid',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="18" rx="1.5"/><rect x="14" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';

    const presetBar = document.createElement('div');
    presetBar.className = 'block-toolbar';
    const presets: { id: BentoPreset; label: string }[] = [
      { id: 'hero-left', label: 'Hero left' },
      { id: 'hero-top', label: 'Hero top' },
      { id: 'equal', label: 'Equal grid' },
    ];
    presets.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `b2${this.preset === p.id ? ' p' : ''}`;
      btn.textContent = p.label;
      btn.onclick = () => {
        this.preset = p.id;
        Array.from(presetBar.children).forEach((el, idx) => {
          el.className = `b2${presets[idx].id === p.id ? ' p' : ''}`;
        });
      };
      presetBar.appendChild(btn);
    });

    const list = document.createElement('div');
    list.className = 'block-rows';

    const draw = () => {
      list.innerHTML = '';
      this.tiles.forEach((tile, idx) => {
        const row = document.createElement('div');
        row.className = 'block-subrow';

        const top = document.createElement('div');
        top.className = 'block-subrow-head';

        const kindSel = document.createElement('select');
        kindSel.innerHTML =
          '<option value="image">Image tile</option><option value="text">Text card</option>';
        kindSel.value = tile.kind || 'image';

        const titleIn = document.createElement('input');
        titleIn.type = 'text';
        titleIn.placeholder = idx === 0 ? 'Hero title / caption' : 'Tile title';
        titleIn.value = tile.title || '';
        titleIn.oninput = () => {
          tile.title = titleIn.value;
        };

        const rmBtn = document.createElement('button');
        rmBtn.type = 'button';
        rmBtn.className = 'b2';
        rmBtn.textContent = '×';
        rmBtn.onclick = () => {
          this.tiles.splice(idx, 1);
          draw();
        };

        top.append(kindSel, titleIn, rmBtn);

        const body = document.createElement('div');
        body.className = 'block-subrow-body';

        const renderBody = () => {
          body.innerHTML = '';
          if (tile.kind === 'image') {
            const urlIn = document.createElement('input');
            urlIn.type = 'url';
            urlIn.placeholder = 'Image URL';
            urlIn.value = tile.url || '';
            urlIn.oninput = () => {
              tile.url = urlIn.value.trim();
            };
            const fileIn = document.createElement('input');
            fileIn.type = 'file';
            fileIn.accept = 'image/*';
            attachUpload(fileIn, 'writing', (url) => {
              tile.url = url;
              urlIn.value = url;
            });
            body.append(urlIn, fileIn);
          } else {
            const textIn = document.createElement('textarea');
            textIn.rows = 2;
            textIn.placeholder = 'Card text...';
            textIn.value = tile.text || '';
            textIn.oninput = () => {
              tile.text = textIn.value;
            };
            body.appendChild(textIn);
          }
        };

        kindSel.onchange = () => {
          tile.kind = kindSel.value as 'image' | 'text';
          renderBody();
        };
        renderBody();

        row.append(top, body);
        list.appendChild(row);
      });
    };

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'b2';
    addBtn.textContent = '+ Add tile';
    addBtn.onclick = () => {
      this.tiles.push({ kind: 'image', url: '', title: '', text: '' });
      draw();
    };

    draw();
    root.append(presetBar, list, addBtn);
    return root;
  }

  save() {
    return {
      preset: this.preset,
      tiles: this.tiles,
    };
  }
}

export interface CarouselSlideItem {
  url: string;
  caption?: string;
}

export class CarouselTool {
  private items: CarouselSlideItem[];

  constructor(options: ToolOptions<{ items?: Array<string | CarouselSlideItem> }>) {
    const raw = options.data?.items || [];
    this.items = raw.length
      ? raw.map((it) => (typeof it === 'string' ? { url: it, caption: '' } : { ...it }))
      : [{ url: '', caption: '' }];
  }

  static get toolbox() {
    return {
      title: 'Carousel',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M2 8v8"/><path d="M22 8v8"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';
    const list = document.createElement('div');
    list.className = 'block-rows';

    const draw = () => {
      list.innerHTML = '';
      this.items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'block-subrow';

        const top = document.createElement('div');
        top.className = 'block-subrow-head';

        const urlIn = document.createElement('input');
        urlIn.type = 'url';
        urlIn.placeholder = `Slide ${idx + 1} image URL`;
        urlIn.value = item.url || '';
        urlIn.oninput = () => {
          item.url = urlIn.value.trim();
        };

        const rmBtn = document.createElement('button');
        rmBtn.type = 'button';
        rmBtn.className = 'b2';
        rmBtn.textContent = '×';
        rmBtn.onclick = () => {
          this.items.splice(idx, 1);
          draw();
        };

        top.append(urlIn, rmBtn);

        const capIn = document.createElement('input');
        capIn.type = 'text';
        capIn.placeholder = 'Optional caption';
        capIn.value = item.caption || '';
        capIn.oninput = () => {
          item.caption = capIn.value;
        };

        const fileIn = document.createElement('input');
        fileIn.type = 'file';
        fileIn.accept = 'image/*';
        attachUpload(fileIn, 'writing', (url) => {
          item.url = url;
          urlIn.value = url;
        });

        row.append(top, fileIn, capIn);
        list.appendChild(row);
      });
    };

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'b2';
    addBtn.textContent = '+ Add slide image';
    addBtn.onclick = () => {
      this.items.push({ url: '', caption: '' });
      draw();
    };

    draw();
    root.append(list, addBtn);
    return root;
  }

  save() {
    return {
      items: this.items.filter((i) => i.url.trim()),
    };
  }
}

export class CompareTool {
  private data: {
    beforeUrl?: string;
    afterUrl?: string;
    beforeLabel?: string;
    afterLabel?: string;
  };

  constructor(
    options: ToolOptions<{
      beforeUrl?: string;
      afterUrl?: string;
      beforeLabel?: string;
      afterLabel?: string;
    }>
  ) {
    this.data = {
      beforeUrl: options.data?.beforeUrl || '',
      afterUrl: options.data?.afterUrl || '',
      beforeLabel: options.data?.beforeLabel || 'Before',
      afterLabel: options.data?.afterLabel || 'After',
    };
  }

  static get toolbox() {
    return {
      title: 'Before / After',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="2" x2="12" y2="22"/><polyline points="8 9 5 12 8 15"/><polyline points="16 9 19 12 16 15"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';
    const grid = document.createElement('div');
    grid.className = 'block-two-col';

    const makeSide = (
      sideTitle: string,
      urlKey: 'beforeUrl' | 'afterUrl',
      labelKey: 'beforeLabel' | 'afterLabel'
    ) => {
      const box = document.createElement('div');
      box.className = 'block-subrow';

      const lbl = document.createElement('input');
      lbl.type = 'text';
      lbl.placeholder = `${sideTitle} label`;
      lbl.value = this.data[labelKey] || sideTitle;
      lbl.oninput = () => {
        this.data[labelKey] = lbl.value;
      };

      const urlIn = document.createElement('input');
      urlIn.type = 'url';
      urlIn.placeholder = `${sideTitle} image URL`;
      urlIn.value = this.data[urlKey] || '';
      urlIn.oninput = () => {
        this.data[urlKey] = urlIn.value.trim();
      };

      const fileIn = document.createElement('input');
      fileIn.type = 'file';
      fileIn.accept = 'image/*';
      attachUpload(fileIn, 'writing', (url) => {
        this.data[urlKey] = url;
        urlIn.value = url;
      });

      box.append(lbl, urlIn, fileIn);
      return box;
    };

    grid.append(
      makeSide('Before', 'beforeUrl', 'beforeLabel'),
      makeSide('After', 'afterUrl', 'afterLabel')
    );
    root.appendChild(grid);
    return root;
  }

  save() {
    return this.data;
  }
}

export class LightboxGalleryTool {
  private items: string[];

  constructor(options: ToolOptions<{ items?: Array<string | { url?: string }> }>) {
    this.items = (options.data?.items || []).map((i) =>
      typeof i === 'string' ? i : i.url || ''
    );
  }

  static get toolbox() {
    return {
      title: 'Lightbox gallery',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';

    const urls = document.createElement('textarea');
    urls.rows = 3;
    urls.placeholder = 'Image URLs, one per line';
    urls.value = this.items.join('\n');

    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.multiple = true;

    const preview = document.createElement('div');
    preview.className = 'custom-carousel-preview';

    const paint = () => {
      this.items = urls.value
        .split(/\n+/)
        .map((u) => u.trim())
        .filter(Boolean);
      preview.innerHTML = this.items
        .map((u) => `<img src="${escHtml(u)}" alt="">`)
        .join('');
    };
    paint();
    urls.oninput = paint;

    file.onchange = async () => {
      const files = Array.from(file.files || []);
      const uploaded = await Promise.all(
        files.map(async (f) => {
          const b = await uploadFileToBucket(f, 'writing');
          if (b) return b;
          return await new Promise<string>((res) => {
            const r = new FileReader();
            r.onload = () => res(String(r.result || ''));
            r.readAsDataURL(f);
          });
        })
      );
      urls.value =
        (urls.value.trim() ? `${urls.value.trim()}\n` : '') +
        uploaded.join('\n');
      paint();
    };

    root.append(urls, file, preview);
    return root;
  }

  save() {
    return { items: this.items };
  }
}
