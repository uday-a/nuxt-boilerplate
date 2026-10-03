<script setup lang="ts">
import { ref } from 'vue'
import { FileUpload, FileUploadContent, FileUploadItem } from '@/components/ui/file-upload'

const files = ref<File[]>([])

function setFile(i: number, file: File) {
  files.value = files.value.map((f, idx) => (idx === i ? file : f))
}
function removeFile(i: number) {
  files.value = files.value.filter((_, idx) => idx !== i)
}
</script>

<template>
  <FileUpload
    v-model="files"
    accept="image/*"
    multiple
  >
    <template #content>
      <FileUploadContent v-if="files.length">
        <FileUploadItem
          v-for="(f, i) in files"
          :key="`${f.name}-${f.size}`"
          :model-value="f"
          @update:model-value="setFile(i, $event)"
          @remove="removeFile(i)"
        />
      </FileUploadContent>
    </template>
  </FileUpload>
</template>
