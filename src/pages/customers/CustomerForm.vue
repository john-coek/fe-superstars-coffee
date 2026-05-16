<script setup lang="ts">
import { createCustomer, getCustomer, updateCustomer } from '@/api/customers.api';
import router from '@/router';
import { Button, InputText, Message, useToast } from 'primevue';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const toast = useToast()

const loading = ref(false)
const errors = ref<Record<string, string[]>>({})

const form = ref({
  id: 0,
  name: "",
  phone: ""
})

const isEdit = computed(() => !!customerId.value)


const submit = async () => {
  loading.value = true
  errors.value = {}

  try {
    if (isEdit.value) {
      await updateCustomer(form.value.id, form.value)
    } else {
      const res = await createCustomer(form.value)
      form.value.id = res.data.data.id
    }

    toast.add({
      severity: "success",
      summary: "Success",
      detail: isEdit.value ? "Customer updated succesfully" : "Customer created successfully",
      life: 3000,
    })

    router.push("/customers")
  } catch (error: any) {
    if (error.response?.status === 422) {
      errors.value = error.response?.data.errors ?? {}
      return
    }
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message,
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const customerId = computed<number | null>(() =>
  route.params.id ? Number(route.params.id) : null
)

onMounted(async () => {
  if (!isEdit.value) return

  loading.value = true

  try {
    const res = await getCustomer(customerId.value!)
    const data = res.data.data

    form.value.id = data.id
    form.value.name = data.name
    form.value.phone = data.phone ?? ""
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load customer",
      life: 3000
    })
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-600">
    <div class="flex justify-between items-center mb-8 p-4">

      <Button asChild v-slot="slotProps" size="small" rounded text severity="secondary">
        <RouterLink :to="{ name: 'customers' }" :class="[
          slotProps.class,
          'flex items-center gap-2 px-3! transition-colors duration-200 hover:text-[#42b883]!'
        ]">
          <i class="pi pi-arrow-left text-xs"></i>
          <span class="text-sm font-medium">Back</span>
        </RouterLink>
      </Button>

      <div class="text-right">
        <h1 class="text-2xl font-bold text-surface-900 mb-1">
          <span v-if="isEdit">Edit Customer</span>
          <span v-else>Create Customer</span>
        </h1>
        <p class="text-surface-640 text-sm">
          <span v-if="isEdit">Update Customer Detail</span>
          <span v-else>Add a new Customer</span>
        </p>
      </div>

    </div>

    <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden mx-4">
      <form @submit.prevent="submit">
        <div class="p-6 md:p-8 grid grid-cols-1 gap-8">
          <!-- FORM -->
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <label for="name" class="font-medium text-surface-900">
                Name <span class="text-red-600">*</span>
              </label>

              <InputText id="name" v-model="form.name" type="text" placeholder="John Doe..." fluid
                class="bg-surface-50! focus:bg-white! border-surface-200" :invalid="!!errors.name" />
              <Message v-if="errors.name" severity="error" size="small" variant="simple">
                {{ errors.name[0] }}
              </Message>
            </div>
            
            <div class="flex flex-col gap-2">
              <label for="phone" class="font-medium text-surface-900">
                Phone <span class="text-red-600">*</span>
              </label>

              <InputText id="phone" v-model="form.phone" type="text" placeholder="08123456789..." fluid
                class="bg-surface-50! focus:bg-white! border-surface-200" :invalid="!!errors.phone" />
              <Message v-if="errors.phone" severity="error" size="small" variant="simple">
                {{ errors.phone[0] }}
              </Message>
            </div>

            <div class="flex justify-end pt-4 mt-auto border-t border-surface-100">
              <div class="flex gap-3">
                <Button label="Cancel" severity="secondary" text @click="router.back()"></Button>
                <Button type="submit" label="Save Customer"></Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
