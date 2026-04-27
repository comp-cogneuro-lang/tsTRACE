<template>
  <div :class="$style.container">
    <div :class="$style.subnav">
      <button
        v-for="entry in docs"
        :key="entry.id"
        :class="[$style.subnavBtn, activeId === entry.id && $style.subnavBtnActive]"
        type="button"
        @click="select(entry.id)"
      >
        {{ entry.label }}
      </button>
    </div>

    <article
      ref="articleEl"
      :class="$style.article"
      v-html="rendered"
      @click="onClick"
    ></article>
  </div>
</template>

<script lang="ts">
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
// Vite raw imports: read each markdown source as a string at build time.
// @ts-ignore
import userGuideMd from '../../../../docs/tstrace-user-guide.md?raw';
// @ts-ignore
import structureOfTraceMd from '../../../../docs/structure-of-trace.md?raw';

// Bundle every image referenced by the docs. Vite gives us a map from
// absolute project path to the hashed asset URL it emits at build, so the
// docs render the same in `yarn dev` (served from /) and in the GitHub
// Pages build (served from /tsTRACE/) without copying anything into public/.
const imgModules = import.meta.glob(
  '../../../../docs/image/*.{png,jpg,jpeg,gif,svg,webp}',
  { eager: true, import: 'default' }
) as Record<string, string>;

const fileToUrl: Record<string, string> = {};
for (const path in imgModules) {
  const file = path.split('/').pop();
  if (file) fileToUrl[file] = imgModules[path];
}

const md = new MarkdownIt({ html: true, linkify: true, breaks: false }).use(
  markdownItAnchor,
  {
    // Standard slugify (lowercase, dashes) — matches the existing TOC
    // anchors in tstrace-user-guide.md (`#table-of-contents`, etc.).
    permalink: false,
  }
);

interface DocEntry {
  id: string;
  label: string;
  source: string;
}

const docs: DocEntry[] = [
  { id: 'user-guide', label: 'User Guide', source: userGuideMd },
  { id: 'structure-of-trace', label: 'Structure of TRACE', source: structureOfTraceMd },
];

const renderDoc = (source: string): string => {
  // Replace src="image/foo.png" (and single-quoted variant) with the
  // bundled asset URL. Anything not found falls through unchanged so a
  // typo'd path shows the broken-image icon rather than silently hiding.
  const rewritten = source.replace(
    /(src=["'])image\/([^"']+)(["'])/g,
    (_match: string, p1: string, file: string, p3: string) =>
      `${p1}${fileToUrl[file] ?? `image/${file}`}${p3}`
  );
  return md.render(rewritten);
};

export default defineComponent({
  name: 'DocsTab',
  setup() {
    const activeId = ref<string>(docs[0].id);
    const articleEl = ref<HTMLElement | null>(null);

    const rendered = computed(() => {
      const entry = docs.find((d) => d.id === activeId.value) ?? docs[0];
      return renderDoc(entry.source);
    });

    const select = (id: string) => {
      if (id === activeId.value) return;
      activeId.value = id;
      // Reset scroll to the top of the newly-shown doc.
      nextTick(() => {
        const el = articleEl.value?.parentElement;
        if (el) el.scrollTop = 0;
      });
    };

    // Intercept clicks on cross-doc links: a markdown link with a
    // `data-tstrace-doc="<id>"` attribute swaps the active doc instead
    // of navigating away. Plain anchors (`#section`) and external links
    // are left alone.
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest('a');
      if (!target) return;
      const docId = target.getAttribute('data-tstrace-doc');
      if (docId && docs.some((d) => d.id === docId)) {
        event.preventDefault();
        select(docId);
      }
    };

    // markdown-it-anchor adds id attributes to headings, so native anchor
    // navigation works. But because the article lives inside a scrollable
    // container, we need to do the scroll ourselves to land at the right
    // place rather than letting the page-level handler get confused.
    watch(rendered, () => {
      // Defer until the new HTML is in the DOM.
      nextTick(() => {
        const el = articleEl.value?.parentElement;
        if (el) el.scrollTop = 0;
      });
    });

    return { docs, activeId, select, rendered, articleEl, onClick };
  },
});
</script>

<style module>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.subnav {
  flex: 0 0 auto;
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem 1rem 0;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.subnavBtn {
  padding: 0.4rem 0.9rem;
  border: 1px solid transparent;
  border-bottom: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
  border-radius: 4px 4px 0 0;
}

.subnavBtn:hover {
  color: #222;
  background: #f0f0f0;
}

.subnavBtnActive,
.subnavBtnActive:hover {
  color: #222;
  background: #fff;
  border-color: #eee;
  border-bottom: 1px solid #fff;
  margin-bottom: -1px;
  font-weight: 500;
}

.article {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 2rem 3rem;
}

.article :global(h1),
.article :global(h2),
.article :global(h3),
.article :global(h4) {
  margin-top: 1.5em;
  line-height: 1.25;
}

.article :global(h1) {
  font-size: 1.8rem;
}
.article :global(h2) {
  font-size: 1.45rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.25rem;
}
.article :global(h3) {
  font-size: 1.2rem;
}
.article :global(h4) {
  font-size: 1.05rem;
}

.article :global(p),
.article :global(ul),
.article :global(ol) {
  margin: 0.75em 0;
}

.article :global(li) {
  margin: 0.25em 0;
}

.article :global(img) {
  max-width: 100%;
  height: auto;
}

.article :global(table) {
  border-collapse: collapse;
  margin: 0.75em auto;
}

.article :global(td),
.article :global(th) {
  padding: 0.25rem 0.5rem;
}

.article :global(pre),
.article :global(code) {
  background: #f5f5f5;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.85em;
}

.article :global(code) {
  padding: 0.05rem 0.3rem;
}

.article :global(pre) {
  padding: 0.5rem 0.75rem;
  overflow-x: auto;
}

.article :global(pre code) {
  background: transparent;
  padding: 0;
}

.article :global(blockquote) {
  margin: 0.75em 0;
  padding: 0.25em 1em;
  border-left: 3px solid #dbdbdb;
  color: #444;
  background: #fafafa;
}

.article :global(a) {
  color: #2962ff;
  text-decoration: none;
}
.article :global(a:hover) {
  text-decoration: underline;
}

.article :global(hr) {
  border: 0;
  border-top: 1px solid #eee;
  margin: 1.5em 0;
}

.article :global(mark) {
  background: #fff7c2;
  padding: 0 0.2em;
}
</style>
