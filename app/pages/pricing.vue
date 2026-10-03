<script setup lang="ts">
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ auth: false, layout: false })

useHead({
  title: 'Pricing',
  meta: [
    { name: 'description', content: 'Simple, transparent pricing for teams of every size.' },
  ],
})

type Plan = 'pro' | 'team' | 'enterprise'

const { loggedIn } = useUserSession()

async function onSubscribe(plan: Plan, _cycle: 'monthly' | 'yearly') {
  // Not signed in? Bounce to /login with a return URL — the user
  // lands back on /pricing after auth and can click the plan again.
  // (Could also stash the plan in the session to auto-resume — leave
  // that polish to the consumer.)
  if (!loggedIn.value) {
    await navigateTo(`/login?next=${encodeURIComponent('/pricing')}`)
    return
  }

  const res = await $fetch<ApiResponse<{ url: string }>>('/api/billing/checkout', {
    method: 'POST',
    body: { plan },
  }).catch((err) => {
    const data = (err as { data?: { error?: { message?: string } } }).data
    return { ok: false, error: { code: 'INTERNAL', message: data?.error?.message ?? 'Checkout failed' } } as const
  })

  if (!res.ok) {
    alert(res.error.message)
    return
  }
  // Polar's hosted checkout — full-page redirect.
  window.location.href = res.data.url
}

function onContactSales() {
  window.location.href = 'mailto:sales@example.com?subject=Enterprise%20plan%20inquiry'
}
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <Header01 />
    <main>
      <!-- Reuse the landing pricing block so plans live in one place;
           `page` makes its heading the page H1. -->
      <section>
        <Pricing01
          page
          @subscribe="onSubscribe"
          @contact-sales="onContactSales"
        />
      </section>
      <section><Faq01 /></section>
    </main>
    <Footer01 />
  </div>
</template>
