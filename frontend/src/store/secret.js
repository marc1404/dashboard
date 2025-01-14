//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import {
  defineStore,
  acceptHMRUpdate,
} from 'pinia'
import {
  ref,
  computed,
} from 'vue'

import { useApi } from '@/composables/useApi'

import { isOwnSecret } from '@/utils'

import { useAuthzStore } from './authz'
import { useAppStore } from './app'
import { useGardenerExtensionStore } from './gardenerExtension'
import { useCloudProfileStore } from './cloudProfile'

import findIndex from 'lodash/findIndex'
import find from 'lodash/find'
import filter from 'lodash/filter'
import matches from 'lodash/matches'

function eqlNameAndNamespace ({ namespace, name }) {
  return matches({ metadata: { namespace, name } })
}

export const useSecretStore = defineStore('secret', () => {
  const api = useApi()
  const appStore = useAppStore()
  const authzStore = useAuthzStore()
  const gardenerExtensionStore = useGardenerExtensionStore()
  const cloudProfileStore = useCloudProfileStore()

  const list = ref(null)

  const isInitial = computed(() => {
    return list.value === null
  })

  function $reset () {
    list.value = null
  }

  async function fetchSecrets () {
    const namespace = authzStore.namespace
    try {
      const response = await api.getCloudProviderSecrets({ namespace })
      list.value = response.data
    } catch (err) {
      $reset()
      throw err
    }
  }

  function getSecret ({ namespace, name }) {
    return find(list.value, eqlNameAndNamespace({ namespace, name }))
  }

  async function createSecret (obj) {
    const {
      namespace = authzStore.namespace,
    } = obj.metadata
    const response = await api.createCloudProviderSecret({ namespace, data: obj })

    appStore.setSuccess('Cloud Provider secret created')
    replace(response.data)
  }

  async function updateSecret (obj) {
    const {
      namespace = authzStore.namespace,
      name,
    } = obj.metadata
    const response = await api.updateCloudProviderSecret({ namespace, name, data: obj })
    appStore.setSuccess('Cloud Provider secret updated')
    replace(response.data)
  }

  async function deleteSecret (name) {
    const namespace = authzStore.namespace
    const response = await api.deleteCloudProviderSecret({ namespace, name })
    appStore.setSuccess('Cloud Provider secret deleted')
    remove(response.data)
  }

  const infrastructureSecretList = computed(() => {
    return filter(list.value, secret => {
      return cloudProfileStore.sortedProviderTypeList.includes(secret.metadata.provider?.type)
    })
  })

  const dnsSecretList = computed(() => {
    return filter(list.value, secret => {
      return gardenerExtensionStore.dnsProviderTypes.includes(secret.metadata.provider?.type) && isOwnSecret(secret) // secret binding not supported
    })
  })

  function getCloudProviderSecretByName ({ namespace, name }) {
    return find(list.value, eqlNameAndNamespace({ name, namespace }))
  }

  function replace (obj) {
    const index = findIndex(list.value, eqlNameAndNamespace(obj.metadata))
    if (index !== -1) {
      list.value.splice(index, 1, {
        ...list.value[index], // eslint-disable-line security/detect-object-injection
        ...obj,
      })
    } else {
      list.value.push(obj)
    }
  }

  function remove (obj) {
    const index = findIndex(list.value, eqlNameAndNamespace(obj.metadata))
    if (index !== -1) {
      list.value.splice(index, 1)
    }
  }

  return {
    list,
    isInitial,
    fetchSecrets,
    getSecret,
    updateSecret,
    createSecret,
    deleteSecret,
    infrastructureSecretList,
    dnsSecretList,
    getCloudProviderSecretByName,
    $reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSecretStore, import.meta.hot))
}
