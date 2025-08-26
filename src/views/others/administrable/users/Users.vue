<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CTableWrapper>
          <template #header>
            <CIcon name="cil-grid"/> Listado de Usuarios
          </template>
        </CTableWrapper>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import CTableWrapper from './TableUsers.vue'

export default {
  name: 'Users',
  components: { CTableWrapper },
}
</script>