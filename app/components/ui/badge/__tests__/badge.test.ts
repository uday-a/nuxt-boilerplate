import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '../Badge.vue'

describe('Badge component (Vue)', () => {
  it('renders with data-slot="badge"', () => {
    const w = mount(Badge, { slots: { default: 'Active' } })
    expect(w.find('[data-slot="badge"]').exists()).toBe(true)
    expect(w.find('[data-slot="badge"]').text()).toBe('Active')
    expect(w.find('[data-uipkge]').exists()).toBe(true)
  })

  it('applies variant classes correctly', () => {
    const w = mount(Badge, { props: { variant: 'secondary' }, slots: { default: 'Pro' } })
    expect(w.find('[data-slot="badge"]').classes()).toContain('bg-secondary')

    const w2 = mount(Badge, { props: { variant: 'destructive' }, slots: { default: 'Error' } })
    expect(w2.find('[data-slot="badge"]').classes()).toContain('bg-destructive')
  })
})
