<script setup lang="ts">
import { useTransactionStore } from '@/stores/transaction.store';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, DataTable, Column, ProgressSpinner } from 'primevue';

const route = useRoute();
const router = useRouter();
const transactionStore = useTransactionStore();
const { currentTransaction, loading } = storeToRefs(transactionStore);

onMounted(() => {
    const id = Number(route.params.id);
    if (id) {
        transactionStore.fetchDetail(id);
    }
});

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(value);
};

const goBack = () => {
    router.push({ name: 'transactions' });
};
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900 p-4 md:p-8">
    
    <div class="mb-6 flex items-center gap-4">
      <Button icon="pi pi-arrow-left" text rounded severity="secondary" @click="goBack" />
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Transaction Detail</h1>
        <p class="text-surface-600 text-sm">View complete information of the transaction</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-20">
      <ProgressSpinner />
    </div>

    <div v-else-if="currentTransaction" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Summary Card -->
      <div class="col-span-1">
        <div class="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
          <h2 class="text-lg font-bold text-surface-900 mb-4 border-b border-surface-100 pb-2">Summary</h2>
          
          <div class="flex flex-col gap-4">
            <div>
              <span class="text-sm text-surface-500 block mb-1">Transaction Code</span>
              <span class="font-semibold text-surface-900">{{ currentTransaction.code }}</span>
            </div>
            
            <div>
              <span class="text-sm text-surface-500 block mb-1">Customer</span>
              <span class="font-semibold text-surface-900">{{ currentTransaction.customer?.name || 'Walk-in Customer' }}</span>
              <span v-if="currentTransaction.customer?.phone" class="text-xs text-surface-400 block mt-0.5">{{ currentTransaction.customer.phone }}</span>
            </div>

            <div class="border-t border-surface-100 pt-4 mt-2">
              <div class="flex justify-between items-center mb-2">
                <span class="text-surface-600">Subtotal</span>
                <span class="font-semibold">{{ formatCurrency(currentTransaction.subtotal) }}</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-surface-600">Tax</span>
                <span class="font-semibold">{{ formatCurrency(currentTransaction.tax) }}</span>
              </div>
              <div class="flex justify-between items-center mt-4 pt-2 border-t border-surface-100">
                <span class="text-lg font-bold text-surface-900">Total</span>
                <span class="text-xl font-bold text-primary-600">{{ formatCurrency(currentTransaction.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items List -->
      <div class="col-span-1 lg:col-span-2">
        <div class="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
          <h2 class="text-lg font-bold text-surface-900 mb-4 border-b border-surface-100 pb-2">Items Purchased</h2>
          
          <DataTable :value="currentTransaction.items" dataKey="id" class="clean-table" :rowHover="true">
            <Column field="product.name" header="Product">
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <div v-if="data.product?.image" class="w-10 h-10 rounded-md overflow-hidden bg-surface-100 flex-shrink-0">
                    <img :src="data.product.image" :alt="data.product.name" class="w-full h-full object-cover" />
                  </div>
                  <span class="font-medium text-surface-900">{{ data.product?.name || 'Unknown Product' }}</span>
                </div>
              </template>
            </Column>
            
            <Column field="price" header="Price">
              <template #body="{ data }">
                <span>{{ formatCurrency(data.price) }}</span>
              </template>
            </Column>

            <Column field="quantity" header="Qty" class="w-20 text-center">
              <template #body="{ data }">
                <span>{{ data.quantity }}</span>
              </template>
            </Column>

            <Column field="subtotal" header="Subtotal" class="text-right">
              <template #body="{ data }">
                <span class="font-semibold">{{ formatCurrency(data.subtotal) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

    </div>

    <div v-else class="text-center py-20 text-surface-500">
      Transaction not found.
    </div>

  </div>
</template>
