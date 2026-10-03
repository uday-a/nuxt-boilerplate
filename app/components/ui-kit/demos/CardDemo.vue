<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
</script>

<template>
  <Card class="max-w-sm">
    <CardHeader>
      <CardTitle class="text-base">
        Deploy to production
      </CardTitle>
      <CardDescription>web-app · main · 3 commits ahead</CardDescription>
    </CardHeader>
    <CardContent class="text-sm">
      The last deploy finished 2 hours ago with no errors.
    </CardContent>
    <CardFooter class="gap-2">
      <Button size="sm">
        Deploy
      </Button>
      <Button
        size="sm"
        variant="outline"
      >
        View diff
      </Button>
    </CardFooter>
  </Card>
</template>
