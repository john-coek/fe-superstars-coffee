<script setup lang="ts">
import { Button, Column, ConfirmDialog, DataTable, IconField, InputIcon, InputText, Select, Tag, useConfirm, useToast } from "primevue";
import { useProductStore } from "@/stores/product.store";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { useDebounceFn } from '@vueuse/core';
import { deleteProduct } from '@/api/products.api';
import { getCategories } from '@/api/product-categories.api';

const productStore = useProductStore();
const { fetch, setLimit, setPage, nextPage, prevPage } = productStore;
const { items, loading, limit, currentPage, totalPages, search } = storeToRefs(productStore);

const confirm = useConfirm();
const toast = useToast()

const onSearch = useDebounceFn(() => {
  setPage(1);
  fetch(); 
}, 400);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value)
}

const confirmDelete = (id: number) => {
    confirm.require({
        message: "Are u sure u want to delete this product?",
        header: "Confirm Delete",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
            label: "Cancel",
            severity: "secondary",
            outlined: true
        },
        acceptProps: {
            label: "Delete",
            severity: "danger"
        },
        accept: async () => {
            try {
                await deleteProduct(id)
                toast.add({
                    severity: "success",
                    summary: "Deleted",
                    detail: "Product Removed",
                    life: 3000
                })
                fetch()
            } catch (error) {
                toast.add({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to delete product",
                    life: 3000
                })
            }
        }
    })
}

const categoryFilter = ref<number | null>(null)
const categoryOptions = ref<{ label: string; value: number }[]>([])

const filteredItems = computed(() => {
  if (!categoryFilter.value) return items.value
  return items.value.filter(item => item.product_category_id === categoryFilter.value)
})

onMounted(async () => {
  fetch();

  try {
    const res = await getCategories({ limit: 100 })
    categoryOptions.value = res.data.data.items.map((cat: any) => ({
      label: cat.name,
      value: cat.id
    }))
  } catch (error) {
    console.error('Failed to fetch categories', error)
  }
});
</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
    <div class="flex justify-between items-center mb-8 p-4">
      <div>
        <h1 class="text-2xl font-bold text-surface-900 mb-1">Products</h1>
        <p class="text-surface-600 text-sm">The list below shows all products</p>
      </div>

      <Button asChild v-slot="slotProps">
        <RouterLink :to="{ name: 'products-create'}" :class="slotProps.class"> 
          Add Product</RouterLink>
      </Button>
    </div>

    <div class="bg-white rounded-2xl border border-surface-200 p-2 mx-4">
      <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
        <div class="flex flex-col md:flex-row items-center gap-4 w-full">
          <IconField iconPosition="left" class="w-full md:w-80">
            <InputIcon class="pi pi-search text-surface-400" />
            <InputText v-model="search" placeholder="Search" @input="onSearch" />
          </IconField>

          <Select
            v-model="categoryFilter"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="All Categories"
            showClear
            class="w-full md:w-56"
          />
        </div>
      </div>

      <DataTable :value="filteredItems" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
        <Column field="name" header="Name" class="min-w-[16rem]">
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <img :src="data.image" class="w-10 h-10 rounded-full object-cover bg-surface-100" />
              <span class="font-semibold text-surface-900">{{ data.name }}</span>
            </div>
          </template>
        </Column>

        <Column field="category" header="Category">
          <template #body="{ data }">
            <Tag v-if="data.category" :value="data.category.name" severity="info" />
            <span v-else class="text-surface-400">-</span>
          </template>
        </Column>

        <Column field="price" header="Price">
          <template #body="{ data }">
            <span class="font-medium">{{ formatCurrency(data.price) }}</span>
          </template>
        </Column>

        <Column field="stock" header="Stock">
          <template #body="{ data }">
            <Tag :value="data.stock.toString()" :severity="data.stock > 0 ? 'success' : 'danger'" />
          </template>
        </Column>

        <Column header="Actions" style="width: 5rem">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <RouterLink :to="{name: 'products-edit', params: { id: data.id } }">
                <Button 
                icon="pi pi-pencil" 
                text 
                rounded 
                severity="primary" 
              />
              </RouterLink>
              <Button 
                icon="pi pi-trash" 
                text 
                rounded 
                severity="danger" 
                @click="confirmDelete(data.id)" 
              />
              
            </div>
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-between items-center px-4 py-4 border-t border-surface-100 gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500">Rows per page:</span>
                    <Select :model-value="limit" :options="[5, 10, 20, 50]" @update:model-value="setLimit" />
                </div>

                <div class="flex items-center gap-4">
                    <span class="text-sm font-medium text-surface-600">
                        {{ currentPage }} of {{ totalPages }}
                    </span>

                    <div class="flex gap-1">
                        <Button icon="pi pi-chevron-left" text rounded severity="secondary"
                            :disabled="currentPage === 1"
                            class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!" @click="prevPage()" />
                        <Button icon="pi pi-chevron-right" text rounded severity="secondary"
                            :disabled="currentPage === totalPages"
                            class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!" @click="nextPage()" />
                    </div>
                </div>
            </div>

      </div>
  </div>
  <ConfirmDialog />
</template> 
