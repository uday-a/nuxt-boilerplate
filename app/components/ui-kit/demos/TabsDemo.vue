<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>

<template>
  <Tabs default-value="overview">
    <TabsList>
      <TabsTrigger value="overview">
        Overview
      </TabsTrigger>
      <TabsTrigger value="deploys">
        Deploys
      </TabsTrigger>
      <TabsTrigger value="settings">
        Settings
      </TabsTrigger>
    </TabsList>
    <TabsContent
      value="overview"
      class="text-muted-foreground pt-2 text-sm"
    >
      Traffic and error rates for the last 7 days.
    </TabsContent>
    <TabsContent
      value="deploys"
      class="text-muted-foreground pt-2 text-sm"
    >
      12 deploys this week, all successful.
    </TabsContent>
    <TabsContent
      value="settings"
      class="text-muted-foreground pt-2 text-sm"
    >
      Environment variables and build settings.
    </TabsContent>
  </Tabs>
</template>
