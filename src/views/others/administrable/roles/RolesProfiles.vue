<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CTableWrapper>
          <template #header>
            <CIcon name="cil-grid"/> Listado de roles y perfiles
          </template>
        </CTableWrapper>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import CTableWrapper from './TableRolesPerfiles.vue'

export default {
  name: 'RolesProfiles',
  components: { CTableWrapper },
}
</script>