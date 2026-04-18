export { default as Button } from './Button.vue'

// Re-export variant API from the sibling file (kept separate to avoid the
// Button.vue <-> index.ts circular import that broke dev SSR for Card).
export { buttonVariants, type ButtonVariants } from './button.variants'
