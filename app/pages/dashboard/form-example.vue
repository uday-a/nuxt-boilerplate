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

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Validated form · Example' })

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
  <div class="mx-auto max-w-xl space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        Validated form
      </h1>
      <p class="text-muted-foreground text-sm">
        Reference pattern. zod schema + TanStack Form + registry <code>&lt;Form&gt;</code> components.
      </p>
    </header>

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
          Submitted value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre class="bg-muted rounded-md p-3 text-xs"><code>{{ JSON.stringify(submitted, null, 2) }}</code></pre>
      </CardContent>
    </Card>
  </div>
</template>
