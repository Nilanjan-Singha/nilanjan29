import { useEffect } from 'react';

export function useInteractiveArticle(
  containerRef: React.RefObject<HTMLElement | null>,
  depKey: unknown
) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const cleanups: Array<() => void> = [];

    // 1. Carousel sliders
    root.querySelectorAll<HTMLElement>('[data-carousel]').forEach((carousel) => {
      const track = carousel.querySelector<HTMLElement>('.editor-carousel-track');
      const prevBtn = carousel.querySelector<HTMLButtonElement>('.editor-carousel-prev');
      const nextBtn = carousel.querySelector<HTMLButtonElement>('.editor-carousel-next');
      const dots = Array.from(carousel.querySelectorAll<HTMLButtonElement>('.editor-carousel-dot'));
      if (!track || !dots.length) return;

      const setActiveDot = (index: number) => {
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
      };

      const goTo = (index: number) => {
        const clamped = Math.max(0, Math.min(dots.length - 1, index));
        track.scrollTo({
          left: clamped * track.clientWidth,
          behavior: 'smooth',
        });
        setActiveDot(clamped);
      };

      const onScroll = () => {
        if (!track.clientWidth) return;
        const idx = Math.round(track.scrollLeft / track.clientWidth);
        setActiveDot(idx);
      };
      track.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => track.removeEventListener('scroll', onScroll));

      if (prevBtn) {
        const onPrev = () => {
          const idx = Math.round(track.scrollLeft / (track.clientWidth || 1));
          goTo(idx - 1);
        };
        prevBtn.addEventListener('click', onPrev);
        cleanups.push(() => prevBtn.removeEventListener('click', onPrev));
      }

      if (nextBtn) {
        const onNext = () => {
          const idx = Math.round(track.scrollLeft / (track.clientWidth || 1));
          goTo(idx + 1);
        };
        nextBtn.addEventListener('click', onNext);
        cleanups.push(() => nextBtn.removeEventListener('click', onNext));
      }

      dots.forEach((dot, idx) => {
        const onDot = () => goTo(idx);
        dot.addEventListener('click', onDot);
        cleanups.push(() => dot.removeEventListener('click', onDot));
      });
    });

    // 2. Before / After comparison sliders
    root.querySelectorAll<HTMLElement>('.editor-compare').forEach((compare) => {
      let dragging = false;
      const setPos = (clientX: number) => {
        const rect = compare.getBoundingClientRect();
        if (!rect.width) return;
        const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        compare.style.setProperty('--pos', `${pct.toFixed(2)}%`);
        const handle = compare.querySelector('.editor-compare-handle');
        handle?.setAttribute('aria-valuenow', String(Math.round(pct)));
      };

      const onPointerDown = (e: PointerEvent) => {
        dragging = true;
        compare.setPointerCapture(e.pointerId);
        setPos(e.clientX);
      };
      const onPointerMove = (e: PointerEvent) => {
        if (dragging) setPos(e.clientX);
      };
      const onPointerUp = () => {
        dragging = false;
      };

      compare.addEventListener('pointerdown', onPointerDown);
      compare.addEventListener('pointermove', onPointerMove);
      compare.addEventListener('pointerup', onPointerUp);
      compare.addEventListener('pointercancel', onPointerUp);
      cleanups.push(() => {
        compare.removeEventListener('pointerdown', onPointerDown);
        compare.removeEventListener('pointermove', onPointerMove);
        compare.removeEventListener('pointerup', onPointerUp);
        compare.removeEventListener('pointercancel', onPointerUp);
      });
    });

    // 3. Lightbox gallery
    root.querySelectorAll<HTMLElement>('.editor-gallery').forEach((gallery) => {
      const buttons = Array.from(
        gallery.querySelectorAll<HTMLButtonElement>('.editor-gallery-item')
      );
      const srcs = buttons.map((b) => b.dataset.gallerySrc || '').filter(Boolean);
      if (!srcs.length) return;

      const openLightbox = (startIndex: number) => {
        let current = startIndex;
        const overlay = document.createElement('div');
        overlay.className = 'editor-lightbox';
        overlay.innerHTML = `
          <button type="button" class="editor-lightbox-close" aria-label="Close">×</button>
          <button type="button" class="editor-lightbox-nav prev" aria-label="Previous image">‹</button>
          <img class="editor-lightbox-img" src="${srcs[current]}" alt="">
          <button type="button" class="editor-lightbox-nav next" aria-label="Next image">›</button>
          <div class="editor-lightbox-count">${current + 1} / ${srcs.length}</div>
        `;
        const img = overlay.querySelector<HTMLImageElement>('.editor-lightbox-img')!;
        const count = overlay.querySelector<HTMLElement>('.editor-lightbox-count')!;

        const update = (next: number) => {
          current = (next + srcs.length) % srcs.length;
          img.src = srcs[current];
          count.textContent = `${current + 1} / ${srcs.length}`;
        };

        const close = () => {
          document.removeEventListener('keydown', onKey);
          overlay.remove();
        };

        const onKey = (e: KeyboardEvent) => {
          if (e.key === 'Escape') close();
          else if (e.key === 'ArrowLeft') update(current - 1);
          else if (e.key === 'ArrowRight') update(current + 1);
        };

        overlay.querySelector('.editor-lightbox-close')?.addEventListener('click', close);
        overlay.querySelector('.editor-lightbox-nav.prev')?.addEventListener('click', () => update(current - 1));
        overlay.querySelector('.editor-lightbox-nav.next')?.addEventListener('click', () => update(current + 1));
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) close();
        });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
      };

      buttons.forEach((btn, idx) => {
        const onClick = () => openLightbox(idx);
        btn.addEventListener('click', onClick);
        cleanups.push(() => btn.removeEventListener('click', onClick));
      });
    });

    // 4. Slide deck / Presentation blocks
    root.querySelectorAll<HTMLElement>('[data-slides]').forEach((deck) => {
      const panels = Array.from(deck.querySelectorAll<HTMLElement>('.editor-slide-panel'));
      const countEl = deck.querySelector<HTMLElement>('.editor-slides-count');
      const prevBtn = deck.querySelector<HTMLButtonElement>('.editor-slides-prev');
      const nextBtn = deck.querySelector<HTMLButtonElement>('.editor-slides-next');
      const presentBtn = deck.querySelector<HTMLButtonElement>('.editor-slides-present');
      if (!panels.length) return;

      let current = 0;
      const show = (next: number) => {
        current = Math.max(0, Math.min(panels.length - 1, next));
        panels.forEach((p, idx) => p.classList.toggle('active', idx === current));
        if (countEl) countEl.textContent = `${current + 1} / ${panels.length}`;
      };

      const onPrev = () => show(current - 1);
      const onNext = () => show(current + 1);
      const onPresent = () => {
        if (document.fullscreenElement === deck) {
          void document.exitFullscreen();
        } else if (deck.requestFullscreen) {
          void deck.requestFullscreen();
        } else {
          deck.classList.toggle('is-presenting');
        }
      };

      prevBtn?.addEventListener('click', onPrev);
      nextBtn?.addEventListener('click', onNext);
      presentBtn?.addEventListener('click', onPresent);
      cleanups.push(() => {
        prevBtn?.removeEventListener('click', onPrev);
        nextBtn?.removeEventListener('click', onNext);
        presentBtn?.removeEventListener('click', onPresent);
      });
    });

    // 5. Tabbed content blocks
    root.querySelectorAll<HTMLElement>('[data-tabs]').forEach((tabsBlock) => {
      const tabBtns = Array.from(tabsBlock.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      const panels = Array.from(tabsBlock.querySelectorAll<HTMLElement>('[role="tabpanel"]'));

      tabBtns.forEach((btn, idx) => {
        const onClick = () => {
          tabBtns.forEach((b, i) => b.setAttribute('aria-selected', String(i === idx)));
          panels.forEach((p, i) => p.classList.toggle('active', i === idx));
        };
        btn.addEventListener('click', onClick);
        cleanups.push(() => btn.removeEventListener('click', onClick));
      });
    });

    // 6. Accordion / FAQ stack (mutually exclusive)
    root.querySelectorAll<HTMLElement>('.editor-accordion').forEach((acc) => {
      const items = Array.from(acc.querySelectorAll<HTMLDetailsElement>('.editor-accordion-item'));
      items.forEach((item) => {
        const onToggle = () => {
          if (item.open) {
            items.forEach((other) => {
              if (other !== item) other.open = false;
            });
          }
        };
        item.addEventListener('toggle', onToggle);
        cleanups.push(() => item.removeEventListener('toggle', onToggle));
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [containerRef, depKey]);
}
