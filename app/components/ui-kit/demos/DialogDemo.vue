<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const dialogOpen = ref(false)
</script>

<template>
  <Dialog v-model:open="dialogOpen">
    <DialogTrigger as-child>
      <Button
        variant="outline"
        size="sm"
      >
        Open dialog
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm action</DialogTitle>
        <DialogDescription>This will permanently delete the selected item. This action cannot be undone.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          variant="outline"
          size="sm"
          @click="dialogOpen = false"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          @click="dialogOpen = false"
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
