<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const sheetOpen = ref(false)
</script>

<template>
  <Sheet v-model:open="sheetOpen">
    <SheetTrigger as-child>
      <Button
        variant="outline"
        size="sm"
      >
        Open sheet
      </Button>
    </SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Details</SheetTitle>
        <SheetDescription>View and edit item details.</SheetDescription>
      </SheetHeader>
      <SheetBody class="space-y-4">
        <div class="space-y-2">
          <Label for="ui-kit-sheet-name">Name</Label>
          <Input
            id="ui-kit-sheet-name"
            model-value="Acme Inc"
          />
        </div>
        <div class="space-y-2">
          <Label for="ui-kit-sheet-email">Email</Label>
          <Input
            id="ui-kit-sheet-email"
            model-value="hello@acme.com"
          />
        </div>
      </SheetBody>
      <SheetFooter>
        <Button
          size="sm"
          @click="sheetOpen = false"
        >
          Save
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
