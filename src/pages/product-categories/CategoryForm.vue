<script setup lang="ts">
import { event } from '@primeuix/themes/aura/timeline';
import { Button, FileUpload, InputText, Textarea } from 'primevue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()

const isEdit = computed(() => !!categoryId.value)

const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const form = ref({
  name: "",
  descriptions: ""
})

const onFileSelect = (event: { files: File[] }) => {
  const file = event.files[0]

  if (!file) return

  selectedFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

const categoryId = computed<number | null>(() =>
  route.params.id ? Number(route.params.id) : null
)


</script>

<template>
  <div class="min-h-screen bg-surface-50 font-sans text-surface-600">
    <div class="flex justify-between items-center mb-8 p-4">

      <Button asChild v-slot="slotProps" size="small" rounded text severity="secondary">
        <RouterLink :to="{ name: 'product-categories' }" :class="[
          slotProps.class,
          'flex items-center gap-2 px-3! transition-colors duration-200 hover:text-[#42b883]!'
        ]">
          <i class="pi pi-arrow-left text-xs"></i>
          <span class="text-sm font-medium">Back</span>
        </RouterLink>
      </Button>

      <div class="text-right">
        <h1 class="text-2xl font-bold text-surface-900 mb-1">
          <span v-if="isEdit">Edit Category</span>
          <span v-else>Create Category</span>
        </h1>
        <p class="text-surface-640 text-sm">
          <span v-if="isEdit">Update Category Detail</span>
          <span v-else>Add a new Product Category</span>
        </p>
      </div>

    </div>

    <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden mx-4">
      <form>
        <div class="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">

          <!-- IMAGE -->
          <div class="md:col-span-4 flex flex-col gap-4">
            <label class="text-sm font-semibold text-surface-900">
              Category Image
            </label>

            <div
              class="w-full aspect-square rounded-xl bg-surface-50 border-2 border-dashed border-surface-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary-500 transition-colors">

              <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover">

              <div v-else class="flex flex-col items-center gap-2 text-surface-400">
                <i class="pi pi-image text-4xl opacity-100"></i>
                <span class="text-md">No Image Selected</span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <FileUpload mode="basic" @select="onFileSelect" :auto="false" accept="image/*" :maxFileSize="2000000"
                chooseLabel="Choose Image" class="w-full" />

              <small class="text-surface-500 text-xs text-center">
                Max size: 2mb. Formats: jpg, png
              </small>
            </div>
          </div>

          <!-- FORM -->
          <div class="md:col-span-8 flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <label for="name" class="font-medium text-surface-900">
                Name <span class="text-red-600">*</span>
              </label>

              <InputText id="name" v-model="form.name" type="text" placeholder="Signature Coffee..." fluid
                class="bg-surface-50! focus:bg-white! border-surface-200" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="name" class="font-medium text-surface-900">
                Description <span class="text-red-600">*</span>
              </label>

              <Textarea id="name" v-model="form.descriptions" type="text" placeholder="Signature Coffee..." fluid
                class="bg-surface-50! focus:bg-white! border-surface-200" rows="6" />
            </div>
          </div>

        </div>
      </form>
    </div>
  </div>
</template>
