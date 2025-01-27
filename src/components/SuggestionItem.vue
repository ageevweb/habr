<template>
  <div class="suggestion-item">
    <img :src="item.avatar || placeholder" alt="Avatar" class="avatar" />
    <div>
      <div class="name">
        {{ item.type === 'user' ? item.name || item.alias : item.name || item.alias }}
      </div>
      <div class="alias">
        {{ item.type === 'company' ? 'Компания' : '@' + item.alias }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ISuggestion } from '@/types';
import placeholder from '@/assets/user.svg';

defineProps<{
  item: ISuggestion;
}>();
</script>

<style scoped>
.suggestion-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 8px;
}

.name {
  font-weight: bold;
}

.alias {
  font-size: 12px;
  color: gray;
}
</style>
