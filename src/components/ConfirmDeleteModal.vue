<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('cancel')"
    >
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

      <div class="relative w-full max-w-sm rounded-2xl border border-stone-200 bg-white shadow-2xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2.5 rounded-xl bg-red-100">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <div>
            <h2 class="font-bold text-stone-900" style="font-family:'Fredoka',sans-serif">Remove song?</h2>
            <p class="text-xs text-stone-400 mt-0.5">This can't be undone</p>
          </div>
        </div>

        <p class="text-sm text-stone-700 mb-0.5 font-semibold">{{ title }}</p>
        <p class="text-xs text-stone-400 mb-6">{{ artist }}</p>

        <div class="flex gap-3 justify-end">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
          >Cancel</button>
          <button
            @click="$emit('confirm')"
            class="px-5 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors cursor-pointer shadow-md shadow-red-100"
          >Yes, delete</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ title: string; artist: string }>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>
