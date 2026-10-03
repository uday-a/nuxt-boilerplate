<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'

// The <Toaster /> host is mounted once in app.vue; demos just call toast().
function withUndo() {
  toast.success('Invoice INV-2031 deleted', {
    action: { label: 'Undo', onClick: () => toast('Invoice restored') },
  })
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button
      variant="outline"
      size="sm"
      @click="toast.success('Changes saved')"
    >
      Success
    </Button>
    <Button
      variant="outline"
      size="sm"
      @click="toast.error('Couldn’t reach the server')"
    >
      Error
    </Button>
    <Button
      variant="outline"
      size="sm"
      @click="withUndo"
    >
      With undo
    </Button>
  </div>
</template>
