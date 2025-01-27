<template>
  <div class="selected-tag">
    <span>@{{ item.alias }}</span>
    <button @click="$emit('remove')" aria-label="Удалить выбранный элемент">×</button>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  item: {
    alias: string;
  };
}>();

const emit = defineEmits(['remove']);
</script>

<style scoped>
.selected-tag {
  border-radius: 5px;
  padding: 0px 5px 0 15px;
  width: fit-content;
  background-color: oklch(.424 .199 265.638);
  position: absolute;
  top: 50%;
  transform: translate(4px, -50%);
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
}

.selected-tag button {
  border: none;
  color: white;
  font-size: 25px;
  background: none;
  cursor: pointer;
}
</style>
