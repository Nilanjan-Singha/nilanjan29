import { uploadFileToBucket } from '../../../utils/cmsHelpers';

interface ToolOptions<T = Record<string, any>> {
  data?: T;
}

export interface TimelineStep {
  title: string;
  detail: string;
}

export class TimelineTool {
  private steps: TimelineStep[];

  constructor(options: ToolOptions<{ steps?: TimelineStep[] }>) {
    this.steps =
      Array.isArray(options.data?.steps) && options.data!.steps.length
        ? options.data!.steps.map((s) => ({ ...s }))
        : [
            { title: 'Step 1', detail: '' },
            { title: 'Step 2', detail: '' },
          ];
  }

  static get toolbox() {
    return {
      title: 'Timeline',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="4" x2="6" y2="20"/><circle cx="6" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><line x1="11" y1="6" x2="20" y2="6"/><line x1="11" y1="12" x2="20" y2="12"/><line x1="11" y1="18" x2="20" y2="18"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';
    const list = document.createElement('div');
    list.className = 'block-rows';

    const draw = () => {
      list.innerHTML = '';
      this.steps.forEach((step, idx) => {
        const row = document.createElement('div');
        row.className = 'block-subrow';

        const top = document.createElement('div');
        top.className = 'block-subrow-head';

        const titleIn = document.createElement('input');
        titleIn.type = 'text';
        titleIn.placeholder = `Step ${idx + 1} title`;
        titleIn.value = step.title;
        titleIn.oninput = () => {
          step.title = titleIn.value;
        };

        const rmBtn = document.createElement('button');
        rmBtn.type = 'button';
        rmBtn.className = 'b2';
        rmBtn.textContent = '×';
        rmBtn.onclick = () => {
          this.steps.splice(idx, 1);
          draw();
        };

        top.append(titleIn, rmBtn);

        const detailIn = document.createElement('textarea');
        detailIn.rows = 2;
        detailIn.placeholder = 'Short step description...';
        detailIn.value = step.detail;
        detailIn.oninput = () => {
          step.detail = detailIn.value;
        };

        row.append(top, detailIn);
        list.appendChild(row);
      });
    };

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'b2';
    addBtn.textContent = '+ Add step';
    addBtn.onclick = () => {
      this.steps.push({ title: `Step ${this.steps.length + 1}`, detail: '' });
      draw();
    };

    draw();
    root.append(list, addBtn);
    return root;
  }

  save() {
    return { steps: this.steps };
  }
}

export interface StatMetric {
  value: string;
  label: string;
}

export class StatsTool {
  private stats: StatMetric[];

  constructor(options: ToolOptions<{ stats?: StatMetric[] }>) {
    this.stats =
      Array.isArray(options.data?.stats) && options.data!.stats.length
        ? options.data!.stats.map((s) => ({ ...s }))
        : [
            { value: '99.9%', label: 'Uptime' },
            { value: '42ms', label: 'Latency' },
          ];
  }

  static get toolbox() {
    return {
      title: 'Stats row',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';
    const list = document.createElement('div');
    list.className = 'block-rows';

    const draw = () => {
      list.innerHTML = '';
      this.stats.forEach((stat, idx) => {
        const row = document.createElement('div');
        row.className = 'block-subrow-head';

        const valIn = document.createElement('input');
        valIn.type = 'text';
        valIn.placeholder = 'Value (e.g. 99.9%)';
        valIn.value = stat.value;
        valIn.oninput = () => {
          stat.value = valIn.value;
        };

        const lblIn = document.createElement('input');
        lblIn.type = 'text';
        lblIn.placeholder = 'Label (e.g. Uptime)';
        lblIn.value = stat.label;
        lblIn.oninput = () => {
          stat.label = lblIn.value;
        };

        const rmBtn = document.createElement('button');
        rmBtn.type = 'button';
        rmBtn.className = 'b2';
        rmBtn.textContent = '×';
        rmBtn.onclick = () => {
          this.stats.splice(idx, 1);
          draw();
        };

        row.append(valIn, lblIn, rmBtn);
        list.appendChild(row);
      });
    };

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'b2';
    addBtn.textContent = '+ Add metric';
    addBtn.onclick = () => {
      this.stats.push({ value: '', label: '' });
      draw();
    };

    draw();
    root.append(list, addBtn);
    return root;
  }

  save() {
    return { stats: this.stats };
  }
}

export class ProsConsTool {
  private data: { pros: string[]; cons: string[] };

  constructor(options: ToolOptions<{ pros?: string[]; cons?: string[] }>) {
    this.data = {
      pros: options.data?.pros || [''],
      cons: options.data?.cons || [''],
    };
  }

  static get toolbox() {
    return {
      title: 'Pros & Cons',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><path d="M6 12h3"/><path d="M7.5 10.5v3"/><path d="M15 12h3"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';
    const grid = document.createElement('div');
    grid.className = 'block-two-col';

    const makeCol = (title: string, key: 'pros' | 'cons') => {
      const box = document.createElement('div');
      box.className = 'block-subrow';

      const heading = document.createElement('div');
      heading.className = 'block-hint';
      heading.textContent = title;

      const ta = document.createElement('textarea');
      ta.rows = 4;
      ta.placeholder = `${title}, one per line...`;
      ta.value = this.data[key].join('\n');
      ta.oninput = () => {
        this.data[key] = ta.value
          .split(/\n/)
          .map((s) => s.trim())
          .filter(Boolean);
      };

      box.append(heading, ta);
      return box;
    };

    grid.append(makeCol('Pros', 'pros'), makeCol('Cons', 'cons'));
    root.appendChild(grid);
    return root;
  }

  save() {
    return this.data;
  }
}

export interface GridCardItem {
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
}

export class CardsTool {
  private cards: GridCardItem[];

  constructor(options: ToolOptions<{ cards?: GridCardItem[] }>) {
    this.cards =
      Array.isArray(options.data?.cards) && options.data!.cards.length
        ? options.data!.cards.map((c) => ({ ...c }))
        : [{ title: '', subtitle: '', url: '', badge: 'Link' }];
  }

  static get toolbox() {
    return {
      title: 'Card grid',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';
    const list = document.createElement('div');
    list.className = 'block-rows';

    const draw = () => {
      list.innerHTML = '';
      this.cards.forEach((card, idx) => {
        const row = document.createElement('div');
        row.className = 'block-subrow';

        const top = document.createElement('div');
        top.className = 'block-subrow-head';

        const titleIn = document.createElement('input');
        titleIn.type = 'text';
        titleIn.placeholder = 'Card title';
        titleIn.value = card.title;
        titleIn.oninput = () => {
          card.title = titleIn.value;
        };

        const badgeIn = document.createElement('input');
        badgeIn.type = 'text';
        badgeIn.placeholder = 'Badge (PDF / Link)';
        badgeIn.value = card.badge || '';
        badgeIn.oninput = () => {
          card.badge = badgeIn.value;
        };

        const rmBtn = document.createElement('button');
        rmBtn.type = 'button';
        rmBtn.className = 'b2';
        rmBtn.textContent = '×';
        rmBtn.onclick = () => {
          this.cards.splice(idx, 1);
          draw();
        };

        top.append(titleIn, badgeIn, rmBtn);

        const subIn = document.createElement('input');
        subIn.type = 'text';
        subIn.placeholder = 'Short description';
        subIn.value = card.subtitle || '';
        subIn.oninput = () => {
          card.subtitle = subIn.value;
        };

        const urlIn = document.createElement('input');
        urlIn.type = 'url';
        urlIn.placeholder = 'URL or upload a file below';
        urlIn.value = card.url;
        urlIn.oninput = () => {
          card.url = urlIn.value.trim();
        };

        const fileIn = document.createElement('input');
        fileIn.type = 'file';
        fileIn.onchange = async () => {
          const file = fileIn.files?.[0];
          if (!file) return;
          if (!card.title) card.title = file.name;
          titleIn.value = card.title;
          const bucketUrl = await uploadFileToBucket(file, 'attachments');
          if (bucketUrl) {
            card.url = bucketUrl;
            urlIn.value = bucketUrl;
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            card.url = String(reader.result || '');
            urlIn.value = card.url;
          };
          reader.readAsDataURL(file);
        };

        row.append(top, subIn, urlIn, fileIn);
        list.appendChild(row);
      });
    };

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'b2';
    addBtn.textContent = '+ Add card';
    addBtn.onclick = () => {
      this.cards.push({ title: '', subtitle: '', url: '', badge: 'Link' });
      draw();
    };

    draw();
    root.append(list, addBtn);
    return root;
  }

  save() {
    return { cards: this.cards };
  }
}

export type BadgeTone = 'neutral' | 'accent' | 'green' | 'blue' | 'amber' | 'red';

export interface BadgeItem {
  label: string;
  tone?: BadgeTone;
}

export class BadgesTool {
  private items: BadgeItem[];

  constructor(options: ToolOptions<{ items?: BadgeItem[] }>) {
    this.items =
      Array.isArray(options.data?.items) && options.data!.items.length
        ? options.data!.items.map((b) => ({ ...b }))
        : [{ label: 'New', tone: 'accent' }];
  }

  static get toolbox() {
    return {
      title: 'Badges',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';
    const list = document.createElement('div');
    list.className = 'block-rows';

    const tones: BadgeTone[] = ['neutral', 'accent', 'green', 'blue', 'amber', 'red'];

    const draw = () => {
      list.innerHTML = '';
      this.items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'block-subrow-head';

        const labelIn = document.createElement('input');
        labelIn.type = 'text';
        labelIn.placeholder = 'Badge label (e.g. Beta, v2.0)';
        labelIn.value = item.label;
        labelIn.oninput = () => {
          item.label = labelIn.value;
        };

        const toneSel = document.createElement('select');
        tones.forEach((t) => {
          const opt = document.createElement('option');
          opt.value = t;
          opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
          toneSel.appendChild(opt);
        });
        toneSel.value = item.tone || 'neutral';
        toneSel.onchange = () => {
          item.tone = toneSel.value as BadgeTone;
        };

        const rmBtn = document.createElement('button');
        rmBtn.type = 'button';
        rmBtn.className = 'b2';
        rmBtn.textContent = '×';
        rmBtn.onclick = () => {
          this.items.splice(idx, 1);
          draw();
        };

        row.append(labelIn, toneSel, rmBtn);
        list.appendChild(row);
      });
    };

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'b2';
    addBtn.textContent = '+ Add badge';
    addBtn.onclick = () => {
      this.items.push({ label: '', tone: 'neutral' });
      draw();
    };

    draw();
    root.append(list, addBtn);
    return root;
  }

  save() {
    return { items: this.items.filter((i) => i.label.trim()) };
  }
}

export class TagsTool {
  private raw: string;
  private input?: HTMLInputElement;

  constructor(options: ToolOptions<{ tags?: string[] }>) {
    this.raw = Array.isArray(options.data?.tags)
      ? options.data!.tags.join(', ')
      : '';
  }

  static get toolbox() {
    return {
      title: 'Tags',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    };
  }

  render() {
    const root = document.createElement('div');
    root.className = 'block-card';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Comma-separated tags (e.g. react, typescript, design)';
    input.value = this.raw;

    root.appendChild(input);
    this.input = input;
    return root;
  }

  save() {
    const val = this.input?.value ?? this.raw;
    return {
      tags: val
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
    };
  }
}
