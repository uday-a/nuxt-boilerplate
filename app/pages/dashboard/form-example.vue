<script setup lang="ts">
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

// Canonical form pattern: zod schema defines shape + validation, TanStack
// Form drives state, and the registry's <FormField> wires error messages
// into <FormMessage>.
//
// zod 4 implements Standard Schema, so per-field zod expressions plug
// straight into TanStack's `validators` slot without an adapter package.

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email'),
  bio: z.string().max(280, 'Bio must be 280 characters or fewer'),
})

const submitted = ref<typeof profileSchema._output | null>(null)

const form = useForm({
  defaultValues: {
    name: '',
    email: '',
    bio: '',
  },
  validators: {
    onSubmit: profileSchema,
  },
  onSubmit({ value }) {
    submitted.value = value
  },
})
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="A profile form that checks every field before it saves."
      />
    </PageHeader>

    <PageBody class="max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Profile
          </CardTitle>
          <CardDescription>Validates on submit. Edit and click Save.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            :form="form"
            class="space-y-4"
          >
            <FormField name="name">
              <template #default="{ componentField, error }">
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="(componentField as any)"
                      :aria-invalid="!!error"
                    />
                  </FormControl>
                  <FormDescription>Shown to other workspace members.</FormDescription>
                  <FormMessage />
                </FormItem>
              </template>
            </FormField>

            <FormField name="email">
              <template #default="{ componentField, error }">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="(componentField as any)"
                      type="email"
                      :aria-invalid="!!error"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </template>
            </FormField>

            <FormField name="bio">
              <template #default="{ componentField, error }">
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      v-bind="(componentField as any)"
                      rows="3"
                      :aria-invalid="!!error"
                    />
                  </FormControl>
                  <FormDescription>280 characters max.</FormDescription>
                  <FormMessage />
                </FormItem>
              </template>
            </FormField>

            <div class="flex justify-end">
              <Button type="submit">
                Save
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>

      <Card v-if="submitted">
        <CardHeader>
          <CardTitle class="text-base">
            Saved profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-muted-foreground">
              Name
            </dt>
            <dd>{{ submitted.name }}</dd>
            <dt class="text-muted-foreground">
              Email
            </dt>
            <dd>{{ submitted.email }}</dd>
            <dt class="text-muted-foreground">
              Bio
            </dt>
            <dd>{{ submitted.bio || '—' }}</dd>
          </dl>
        </CardContent>
      </Card>
    </PageBody>
  </Page>
</template>
