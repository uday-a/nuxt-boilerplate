<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const invoices = [
  { id: 'INV-1042', customer: 'Northwind Labs', amount: '$1,280.00', status: 'Paid' },
  { id: 'INV-1041', customer: 'Brightline Co', amount: '$640.00', status: 'Due' },
  { id: 'INV-1040', customer: 'Harbor Analytics', amount: '$2,150.00', status: 'Paid' },
]
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Status</TableHead>
        <TableHead class="text-right">
          Amount
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow
        v-for="inv in invoices"
        :key="inv.id"
      >
        <TableCell class="font-mono text-xs">
          {{ inv.id }}
        </TableCell>
        <TableCell>{{ inv.customer }}</TableCell>
        <TableCell>
          <Badge :variant="inv.status === 'Paid' ? 'success' : 'warning'">
            {{ inv.status }}
          </Badge>
        </TableCell>
        <TableCell class="text-right tabular-nums">
          {{ inv.amount }}
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
