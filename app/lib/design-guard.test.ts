import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

// Enforces the mechanical half of ai_docs/design-rules.md on app-owned
// surfaces (pages, layouts, blocks, finder). Registry primitives under
// components/ui are vendored and out of scope. If a rule genuinely has to
// bend, add the file to ALLOW with a reason instead of weakening a pattern.

const ROOT = resolve(__dirname, '..')
const SCAN_DIRS = ['pages', 'layouts', 'components/blocks', 'components/kanban', 'components/ui-kit']

const RULES: { name: string, pattern: RegExp, why: string }[] = [
  {
    name: 'raw-palette',
    pattern: /\b(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|decoration|shadow)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}\b/,
    why: 'use semantic tokens (success/warning/info/destructive) or chart-1..5',
  },
  { name: 'hex-colour', pattern: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6})\b/, why: 'use a theme token' },
  { name: 'font-bold', pattern: /\bfont-(?:bold|extrabold|black)\b/, why: 'weights are normal/medium/semibold' },
  { name: 'opacity-text', pattern: /\btext-(?:muted-)?foreground\/\d+/, why: 'use text-muted-foreground, not /NN opacity variants' },
  { name: 'tiny-text', pattern: /\btext-\[(?:\d|1[01])px\]/, why: 'no text below 12px' },
  { name: 'hw-icon-size', pattern: /\bh-(\d+(?:\.\d+)?) w-\1\b/, why: 'use size-N' },
  { name: 'style-block', pattern: /<style[\s>]/, why: 'utilities only (see styling escape hatch)' },
  { name: 'direct-lucide-import', pattern: /from 'lucide-vue-next'/, why: 'import icons from \'@/lib/icon-pack\' so the icon-pack switch covers them' },
  { name: 'static-inline-style', pattern: /\sstyle="/, why: 'utilities only; :style only for dynamic values' },
  {
    // pl-*/pr-* are exempt: they clear icons inside inputs and close buttons.
    name: 'spacing-over-4',
    pattern: /(?<![\w[-])-?(?:p|px|py|pt|pb|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-(?:[5-9]|1[0-9]|2[0-9])(?![\w.\]/-])/,
    why: 'padding, margin and gap max out at 4 (16px) everywhere',
  },
]

// file (relative to app/) -> rule names allowed there, with the reason.
const ALLOW: Record<string, string[]> = {
  // `-mt-6 h-6` fade overlay pulls up over its own height — not spacing.
  'components/blocks/NotificationsPopover.vue': ['spacing-over-4'],
  // Landing-page blocks mirror the Next.js boilerplate's home page class-for-
  // class (marketing sections use the larger px-6 / py-24 rhythm there).
  ...Object.fromEntries(
    ['Header01', 'Hero01', 'Logos01', 'Features01', 'Bento01', 'Pricing01', 'Testimonials01', 'Faq01', 'Contact01', 'Cta01']
      .map(b => [`components/blocks/${b}.vue`, ['spacing-over-4']]),
  ),
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(vue|ts)$/.test(name) && !name.endsWith('.test.ts') ? [full] : []
  })
}

const files = SCAN_DIRS.flatMap((d) => {
  try {
    return walk(join(ROOT, d))
  }
  catch {
    return []
  }
})

describe('design guard', () => {
  it('scans app surfaces', () => {
    expect(files.length).toBeGreaterThan(20)
  })

  for (const rule of RULES) {
    it(`no ${rule.name} (${rule.why})`, () => {
      const hits: string[] = []
      for (const file of files) {
        const rel = relative(ROOT, file)
        if (ALLOW[rel]?.includes(rule.name)) continue
        readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
          const m = line.match(rule.pattern)
          if (m) hits.push(`${rel}:${i + 1}  ${m[0]}`)
        })
      }
      expect(hits, hits.join('\n')).toEqual([])
    })
  }
})
