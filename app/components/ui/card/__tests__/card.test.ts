import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '../Card.vue'
import CardHeader from '../CardHeader.vue'
import CardTitle from '../CardTitle.vue'
import CardContent from '../CardContent.vue'

describe('Card component suite (Vue)', () => {
  it('renders a composed card structure', () => {
    const w = mount(
      {
        components: { Card, CardHeader, CardTitle, CardContent },
        template: `
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Main content area</p>
            </CardContent>
          </Card>
        `,
      },
      { attachTo: document.body },
    )

    expect(w.find('[data-slot="card"]').exists()).toBe(true)
    expect(w.find('[data-slot="card-header"]').exists()).toBe(true)
    expect(w.find('[data-slot="card-title"]').text()).toBe('Project Overview')
    expect(w.find('[data-slot="card-content"]').text()).toBe('Main content area')
    w.unmount()
  })
})
