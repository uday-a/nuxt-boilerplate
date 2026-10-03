<script setup lang="ts">
import { CreditCard, Hash, Search, Settings, User } from '@/lib/icon-pack'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
</script>

<template>
  <Command class="rounded-lg border shadow-sm">
    <CommandInput placeholder="Type a command or search..." />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem value="calendar">
          <Hash class="mr-2 size-4" />Calendar
        </CommandItem>
        <CommandItem value="search">
          <Search class="mr-2 size-4" />Search Emoji
        </CommandItem>
        <CommandItem value="calculator">
          <CreditCard class="mr-2 size-4" />Calculator
        </CommandItem>
      </CommandGroup>
      <CommandGroup heading="Settings">
        <CommandItem value="profile">
          <User class="mr-2 size-4" />Profile
        </CommandItem>
        <CommandItem value="billing">
          <CreditCard class="mr-2 size-4" />Billing
        </CommandItem>
        <CommandItem value="settings">
          <Settings class="mr-2 size-4" />Settings
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</template>
