// Nitro server plugin -- injects an inline <script> into the SSR HTML
// head so the dark class lands on <html> BEFORE the browser paints.
//
// Why not a regular Nuxt plugin with useHead? In testing, useHead({
// script: [...] }) from inside defineNuxtPlugin didn't make it into
// the SSR-rendered HTML in some setups -- the head entry was applied
// only after client hydration, which is exactly when the white flash
// happens. The Nitro `render:html` hook runs at the final SSR HTML
// assembly step, so the script tag is guaranteed to be in the bytes
// sent to the browser.
//
// 'system' theme readers still need matchMedia (client-only). That's
// fine -- the script runs synchronously, so the dark class is set
// before <body> paints either way.
import { defineNitroPlugin } from 'nitropack/runtime'

const SCRIPT
  = 'try{var t=localStorage.getItem("uipkge-theme")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head.push(`<script>${SCRIPT}</script>`)
  })
})
