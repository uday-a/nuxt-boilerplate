/**
 * UI catalog data generator for the /dashboard/ui-kit finder.
 *
 *   node scripts/ui-catalog.ts sync-registry  -> app/data/ui-catalog/registry.snapshot.json
 *   node scripts/ui-catalog.ts scan-usage     -> app/data/ui-catalog/usage.generated.json
 *
 * sync-registry reads the uipkge Vue registry index (the sibling uipkge-ui
 * checkout when present, else https://uipkge.dev/r/vue/registry.json) and
 * keeps the trimmed `registry:ui` items plus the registry blocks that match a
 * local block (block or page items). Review the diff before committing it.
 *
 * scan-usage maps every installed ui component and local block to the routes
 * that render it, following components (blocks, kanban, brand) up to pages.
 * The drift test re-runs scanUsage() and compares it with the committed file.
 *
 * Plain Node (>= 22.18 strips types natively): only erasable TS syntax here.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const DATA_DIR = join(ROOT, 'app/data/ui-catalog')
export const SNAPSHOT_FILE = join(DATA_DIR, 'registry.snapshot.json')
export const USAGE_FILE = join(DATA_DIR, 'usage.generated.json')

const REGISTRY_URL = 'https://uipkge.dev/r/vue/registry.json'
const LOCAL_REGISTRY = resolve(ROOT, '../uipkge-ui/apps/astro-site/public/r/vue/registry.json')

export interface SnapshotItem {
  name: string
  title: string
  type: 'registry:ui' | 'registry:block' | 'registry:page'
  description: string
  categories: string[]
}

export interface RegistrySnapshot {
  source: string
  items: SnapshotItem[]
}

export interface UsageData {
  /** installed ui component name -> sorted route keys ('/dashboard', 'layout:dashboard', 'app:error') */
  ui: Record<string, string[]>
  /** local block name (kebab) -> file (relative to app/components/blocks) and route keys */
  blocks: Record<string, { file: string, routes: string[] }>
}

// ---------------------------------------------------------------- helpers

const toPosix = (p: string) => p.split(sep).join('/')

export function kebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter(d => statSync(join(dir, d)).isDirectory()).sort()
}

// ---------------------------------------------------------------- installed set

/** Top-level `app/components/ui/<name>` dirs. */
export function installedUi(root = ROOT): string[] {
  return listDirs(join(root, 'app/components/ui'))
}

/** Chart primitives vendored inside `ui/charts/<name>` (each is its own registry item). */
export function installedChartParts(root = ROOT): string[] {
  return listDirs(join(root, 'app/components/ui/charts'))
}

/** Local blocks: `blocks/*.vue` files plus block directories (e.g. `sidebar-02`). */
export function localBlocks(root = ROOT): { name: string, file: string, files: string[] }[] {
  const dir = join(root, 'app/components/blocks')
  if (!existsSync(dir)) return []
  const out: { name: string, file: string, files: string[] }[] = []
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      const files = walk(full).filter(f => f.endsWith('.vue'))
      const main = files.find(f => kebab(basename(f, '.vue')) === entry) ?? files[0]
      if (main) out.push({ name: entry, file: toPosix(relative(dir, main)), files })
    }
    else if (entry.endsWith('.vue')) {
      out.push({ name: kebab(basename(entry, '.vue')), file: entry, files: [full] })
    }
  }
  return out
}

// ---------------------------------------------------------------- sync-registry

export function trimRegistry(index: { items: any[] }, blockNames: string[]): RegistrySnapshot['items'] {
  const blocks = new Set(blockNames)
  return index.items
    .filter(i => i.type === 'registry:ui' || ((i.type === 'registry:block' || i.type === 'registry:page') && blocks.has(i.name)))
    .map(i => ({
      name: String(i.name),
      title: String(i.title ?? i.name),
      type: i.type,
      description: String(i.description ?? ''),
      categories: Array.isArray(i.categories) ? i.categories.map(String) : [],
    }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
}

async function syncRegistry(): Promise<void> {
  let index: { items: any[] }
  let source: string
  const override = process.env.UI_CATALOG_REGISTRY
  const localPath = override && !override.startsWith('http') ? resolve(override) : LOCAL_REGISTRY
  if (existsSync(localPath) && !(override && override.startsWith('http'))) {
    index = JSON.parse(readFileSync(localPath, 'utf8'))
    source = 'uipkge-ui/apps/astro-site/public/r/vue/registry.json'
  }
  else {
    const url = override && override.startsWith('http') ? override : REGISTRY_URL
    const res = await fetch(url)
    if (!res.ok) throw new Error(`registry fetch failed: ${res.status} ${url}`)
    index = await res.json() as { items: any[] }
    source = url
  }
  const items = trimRegistry(index, localBlocks().map(b => b.name))
  const snapshot: RegistrySnapshot = { source, items }
  writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2) + '\n')
  const ui = items.filter(i => i.type === 'registry:ui').length
  console.log(`catalog:sync  ${ui} ui + ${items.length - ui} block items  (${source})`)
}

// ---------------------------------------------------------------- scan-usage

type Unit = string // 'ui:button' | 'block:stat-tile'

const EXCLUDE = [
  /^app\/components\/ui\//,
  /^app\/components\/ui-kit\//,
  /^app\/pages\/dashboard\/ui-kit\.vue$/,
  /^app\/data\/ui-catalog\//,
  /\.(test|spec)\.ts$/,
]

function templateOf(src: string): string {
  const start = src.indexOf('<template')
  const end = src.lastIndexOf('</template>')
  return start === -1 || end === -1 ? '' : src.slice(start, end)
}

/** Route key for a consumer file, or null when it's a component (follow it up). */
export function routeKey(rel: string): string | null {
  if (rel.startsWith('app/pages/')) {
    const path = rel.slice('app/pages'.length).replace(/\.vue$/, '').replace(/\/index$/, '')
    return path === '' ? '/' : path
  }
  if (rel.startsWith('app/layouts/')) return `layout:${basename(rel, '.vue')}`
  if (rel === 'app/app.vue') return 'app:root'
  if (rel === 'app/error.vue') return 'app:error'
  return null
}

export function scanUsage(root = ROOT): UsageData {
  const uiDirs = installedUi(root)
  const chartParts = installedChartParts(root)
  const blocks = localBlocks(root)

  // Pascal component basename -> units it stands for.
  const uiTags = new Map<string, Unit[]>()
  for (const dir of uiDirs) {
    for (const f of walk(join(root, 'app/components/ui', dir))) {
      if (!f.endsWith('.vue')) continue
      const rel = toPosix(relative(join(root, 'app/components/ui', dir), f))
      const units: Unit[] = [`ui:${dir}`]
      const part = dir === 'charts' ? rel.split('/')[0] : undefined
      if (part && chartParts.includes(part)) units.push(`ui:${part}`)
      uiTags.set(basename(f, '.vue'), units)
    }
  }

  // Non-ui component files (blocks, kanban, brand): basename -> file, and block membership.
  const componentFiles = new Map<string, string>() // basename -> rel path
  const blockOfFile = new Map<string, string>() // rel path -> block name
  for (const f of walk(join(root, 'app/components'))) {
    const rel = toPosix(relative(root, f))
    if (!f.endsWith('.vue') || EXCLUDE.some(r => r.test(rel))) continue
    componentFiles.set(basename(f, '.vue'), rel)
  }
  for (const b of blocks) for (const f of b.files) blockOfFile.set(toPosix(relative(root, f)), b.name)

  // Direct references per consumer file.
  const files = walk(join(root, 'app'))
    .map(f => toPosix(relative(root, f)))
    .filter(rel => /\.(vue|ts)$/.test(rel) && !EXCLUDE.some(r => r.test(rel)))

  const refs = new Map<string, Set<string>>() // file -> units ('ui:x') or component files ('file:rel')
  for (const rel of files) {
    const src = readFileSync(join(root, rel), 'utf8')
    const set = new Set<string>()
    for (const m of src.matchAll(/[@~]\/components\/ui\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?/g)) {
      const dir = m[1]!
      if (!uiDirs.includes(dir)) continue
      set.add(`ui:${dir}`)
      if (dir === 'charts' && m[2] && chartParts.includes(m[2])) set.add(`ui:${m[2]}`)
    }
    for (const m of src.matchAll(/[@~]\/components\/((?:blocks|kanban|brand)\/[\w/-]+?)(?:\.vue)?['"]/g)) {
      const target = `app/components/${m[1]}.vue`
      if (target !== rel && existsSync(join(root, target))) set.add(`file:${target}`)
    }
    if (rel.endsWith('.vue')) {
      const tpl = templateOf(src)
      for (const m of tpl.matchAll(/<(?:Lazy)?([A-Z][A-Za-z0-9]*)[\s/>]/g)) {
        const name = m[1]!
        for (const u of uiTags.get(name) ?? []) set.add(u)
        const file = componentFiles.get(name)
        if (file && file !== rel) set.add(`file:${file}`)
      }
    }
    refs.set(rel, set)
  }

  // Reverse edges: unit/file -> consumer files.
  const consumers = new Map<string, Set<string>>()
  for (const [rel, set] of refs) {
    for (const target of set) {
      if (!consumers.has(target)) consumers.set(target, new Set())
      consumers.get(target)!.add(rel)
    }
  }

  function resolveRoutes(targets: string[], skipBlock?: string): string[] {
    const routes = new Set<string>()
    const seen = new Set<string>()
    const queue = [...targets]
    while (queue.length) {
      const target = queue.shift()!
      for (const rel of consumers.get(target) ?? []) {
        if (seen.has(rel)) continue
        seen.add(rel)
        if (skipBlock && blockOfFile.get(rel) === skipBlock) continue
        const key = routeKey(rel)
        if (key) routes.add(key)
        else if (rel.startsWith('app/components/')) queue.push(`file:${rel}`)
      }
    }
    return [...routes].sort()
  }

  const ui: UsageData['ui'] = {}
  for (const name of [...uiDirs, ...chartParts.filter(p => !uiDirs.includes(p))].sort()) {
    ui[name] = resolveRoutes([`ui:${name}`])
  }
  const blockUsage: UsageData['blocks'] = {}
  for (const b of blocks) {
    const targets = b.files.map(f => `file:${toPosix(relative(root, f))}`)
    blockUsage[b.name] = { file: b.file, routes: resolveRoutes(targets, b.name) }
  }
  return { ui, blocks: blockUsage }
}

// ---------------------------------------------------------------- CLI

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const cmd = process.argv[2]
  if (cmd === 'sync-registry') {
    await syncRegistry()
  }
  else if (cmd === 'scan-usage') {
    const usage = scanUsage()
    writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2) + '\n')
    const unused = Object.entries(usage.ui).filter(([, r]) => r.length === 0).map(([n]) => n)
    console.log(`catalog:scan  ${Object.keys(usage.ui).length} ui, ${Object.keys(usage.blocks).length} blocks; demo-only: ${unused.join(', ') || 'none'}`)
  }
  else {
    console.error('usage: node scripts/ui-catalog.ts <sync-registry|scan-usage>')
    process.exit(1)
  }
}
