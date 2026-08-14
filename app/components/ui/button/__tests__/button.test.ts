import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button component (Vue)', () => {
  it('renders standard button element with slot text', () => {
    const w = mount(Button, { slots: { default: 'Click me' } })
    expect(w.find('[data-slot="button"]').exists()).toBe(true)
    expect(w.find('[data-slot="button"]').text()).toBe('Click me')
    expect(w.find('[data-uipkge]').exists()).toBe(true)
  })

  it('applies variant and size data attributes', () => {
    const w = mount(Button, {
      props: { variant: 'destructive', size: 'sm' },
      slots: { default: 'Delete' },
    })
    expect(w.find('[data-slot="button"]').attributes('data-variant')).toBe('destructive')
    expect(w.find('[data-slot="button"]').attributes('data-size')).toBe('sm')
  })

  it('emits click events when clicked', async () => {
    const w = mount(Button, { slots: { default: 'Action' } })
    await w.find('button').trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })

  it('renders asChild with custom element', () => {
    const w = mount(Button, {
      props: { asChild: true },
      slots: { default: '<a href="/login">Link</a>' },
    })
    expect(w.find('a[data-slot="button"]').exists()).toBe(true)
    expect(w.find('a').attributes('href')).toBe('/login')
  })
})
