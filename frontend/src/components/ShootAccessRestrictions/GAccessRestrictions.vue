<!--
SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div
    v-if="!isEmpty(accessRestrictionDefinitions)"
    class="alternate-row-background"
  >
    <v-row
      v-for="{ key, input, options } in accessRestrictionDefinitions"
      :key="key"
      class="my-0"
    >
      <div
        class="d-flex ma-3"
      >
        <div class="action-select">
          <v-switch
            :model-value="getAccessRestrictionValue(key)"
            color="primary"
            density="compact"
            @update:model-value="value => setAccessRestrictionValue(key, value)"
          />
        </div>
        <div>
          <span class="wrap-text text-subtitle-2">{{ input.title }}</span>
          <!-- eslint-disable vue/no-v-html -->
          <span
            v-if="input.description"
            class="wrap-text pt-1 text-body-2"
            v-html="transformHtml(input.description)"
          />
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </div>
      <div
        v-for="{ key: optionKey, input: optionInput } in options"
        :key="optionKey"
        class="d-flex ma-3"
      >
        <div class="action-select">
          <v-checkbox
            :model-value="getAccessRestrictionOptionValue(key, optionKey) "
            :disabled="getDisabled(key)"
            color="primary"
            density="compact"
            @update:model-value="value => setAccessRestrictionOptionValue(key, optionKey, value)"
          />
        </div>
        <div
          class="wrap-text"
          :class="getTextClass(key)"
        >
          <span
            class="text-subtitle-2"
          >
            {{ optionInput.title }}
          </span>
          <!-- eslint-disable vue/no-v-html -->
          <span
            v-if="optionInput.description"
            class="pt-1 text-body-2"
            v-html="transformHtml(optionInput.description)"
          />
          <!-- eslint-enable vue/no-v-html -->
        </div>
      </div>
    </v-row>
  </div>
  <div
    v-else
    class="pt-4"
  >
    {{ accessRestrictionNoItemsText }}
  </div>
</template>

<script setup>

import { useShootContext } from '@/composables/useShootContext'

import { transformHtml } from '@/utils'

import isEmpty from 'lodash/isEmpty'

const {
  accessRestrictionDefinitions,
  accessRestrictionNoItemsText,
  getAccessRestrictionValue,
  setAccessRestrictionValue,
  getAccessRestrictionOptionValue,
  setAccessRestrictionOptionValue,
} = useShootContext()

function getDisabled (key) {
  return !getAccessRestrictionValue(key)
}

function getTextClass (key) {
  return getDisabled(key)
    ? 'text-disabled'
    : 'text-medium-emphasis'
}
</script>

<style lang="scss" scoped>
.action-select {
  min-width: 68px;
}
</style>
