<template>
  <label for="suggest-input">
    <sup>*</sup>
    Пользователь или компания
  </label>

  <div class="input-wrapper">
    <input
      id="suggest-input"
      v-model="query"
      @input="onInput"
      @keydown.down="navigateSuggestions(1)"
      @keydown.up="navigateSuggestions(-1)"
      @keydown.enter="onEnter"
      :placeholder="!!selected ? '' : 'Введите название компании'"
      :disabled="!!selected"
      aria-autocomplete="list"
      :aria-expanded="showSuggestions"
      :aria-controls="suggestions.length > 0 ? 'suggestions-list' : ''"
      :aria-activedescendant="activeId"
    />

    <SelectedTag
      v-if="selected"
      :item="selected"
      @remove="clearSelection"
    />

    <transition name="fade">
      <ul
        v-if="suggestions.length && query.length >= 3"
        class="suggestions-list"
        ref="suggestionsList"
        id="suggestions-list"
        role="listbox"
      >
        <li
          v-for="(item, index) in suggestions"
          :key="item.id"
          :class="{ active: index === activeIndex }"
          @click="selectSuggestion(index)"
          ref="suggestionItems"
          :id="`suggestion-${index}`"
          role="option"
          :aria-selected="index === activeIndex"
        >
          <SuggestionItem :item="item" />
        </li>
      </ul>
    </transition>

    <div v-if="isLoading" class="state-message" role="status">Загрузка...</div>
    <div v-if="error" class="state-message error" role="alert">Ошибка: {{ error }}</div>
    <div v-if="noResults" class="state-message" role="status">Нет результатов</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue';
import type { ISuggestion, ISuggestionResponse } from '@/types';
import SuggestionItem from '@/components/SuggestionItem.vue';
import SelectedTag from '@/components/SelectedTag.vue';

const query = ref('');
const suggestions = ref<ISuggestion[]>([]);
const selected = ref<ISuggestion | null>(null);
const activeIndex = ref(-1);

const isLoading = ref(false);
const error = ref<string | null>(null);

const suggestionsList = ref<HTMLElement | null>(null);
const suggestionItems = ref<(HTMLElement | null)[]>([]);

const activeId = computed(() =>
  activeIndex.value >= 0 ? `suggestion-${activeIndex.value}` : 'no suggestion'
);

const noResults = computed(() =>
  !isLoading.value &&
  suggestions.value.length === 0 &&
  !error.value &&
  !selected.value &&
  query.value.length > 3
);

const showSuggestions = computed(() =>
  query.value.length >= 3 &&
  !selected.value &&
  !isLoading.value &&
  !error.value
);

const onInput = async () => {
  if (query.value.length < 3) return;

  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `https://habr.com/kek/v2/publication/suggest-mention?q=${query.value}`
    );

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Некорректный запрос. Проверьте параметры.');
      }
      if (response.status === 500) {
        throw new Error('Ошибка сервера. Попробуйте позже.');
      }
      throw new Error(`Неизвестная ошибка: ${response.status}`);
    }

    const data: ISuggestionResponse = await response.json();
    suggestions.value = Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    error.value = (err as Error).message;
    suggestions.value = [];
  } finally {
    isLoading.value = false;
  }
};

const scrollToActive = () => {
  nextTick(() => {
    const list = suggestionsList.value;
    const activeItem = suggestionItems.value[activeIndex.value];

    if (list && activeItem) {
      const listRect = list.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      if (itemRect.top < listRect.top) {
        list.scrollTop -= listRect.top - itemRect.top;
      } else if (itemRect.bottom > listRect.bottom) {
        list.scrollTop += itemRect.bottom - listRect.bottom;
      }
    }
  });
};

const navigateSuggestions = (direction: number) => {
  if (!showSuggestions.value) return;

  activeIndex.value =
    (activeIndex.value + direction + suggestions.value.length) % suggestions.value.length;

  scrollToActive();
};

const selectSuggestion = (index = activeIndex.value) => {
  if (index < 0 || index >= suggestions.value.length) return;
  selected.value = suggestions.value[index];
  query.value = '';
  suggestions.value = [];
  activeIndex.value = -1;
};

const onEnter = (event: KeyboardEvent) => {
  event.preventDefault();
  selectSuggestion(activeIndex.value);
};

const clearSelection = () => {
  selected.value = null;
};
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

label {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  display: block;
}

label sup {
  color: oklch(.645 .246 16.439);
}

.input-wrapper {
  position: relative;
  max-width: 500px;
}

input {
  padding: 10px 20px;
  width: -webkit-fill-available;
  border-radius: 5px;
  border: 1px solid oklch(.705 .015 286.067);
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border-radius: 5px;
  max-height: 282px;
  overflow-y: auto;
  border: 1px solid #ccc;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.5);
}

.suggestions-list li {
  cursor: pointer;
}

.suggestions-list li.active {
  background: oklch(.869 .005 56.366);
}

.state-message {
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
  color: oklch(.424 .199 265.638);
  position: absolute;
  left: 50%;
  top: 95%;
  transform: translateX(-50%);
}

.state-message.error {
  color: oklch(.645 .246 16.439);
}
</style>

