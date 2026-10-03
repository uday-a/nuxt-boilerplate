<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { FormActions, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// FormLabel (the `label` prop) needs a TanStack FormField around it, so this
// static preview passes labels through the #label slot. Real forms bind
// fields with <Form :form> + <FormField>; see /dashboard/form-example.
</script>

<template>
  <div class="max-w-md space-y-4">
    <FormItem
      description="Shown in invites and on invoices."
      required
    >
      <template #label>
        <Label for="ui-kit-form-name">Workspace name</Label>
      </template>
      <Input
        id="ui-kit-form-name"
        model-value="Acme Inc"
      />
    </FormItem>
    <FormItem
      status="error"
      help="Enter a valid email address."
    >
      <template #label>
        <Label for="ui-kit-form-email">Billing email</Label>
      </template>
      <Input
        id="ui-kit-form-email"
        model-value="billing@acme"
        status="error"
      />
    </FormItem>
    <FormActions>
      <Button
        variant="outline"
        size="sm"
      >
        Cancel
      </Button>
      <Button size="sm">
        Save
      </Button>
    </FormActions>
  </div>
</template>
