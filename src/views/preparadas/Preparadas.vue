<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CTableWrapper>
          <template #header>
            <CIcon name="cil-grid"/> Listado de Preparadas del Cliente
          </template>
        </CTableWrapper>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import CTableWrapper from './TablePreparadas.vue'

export default {
  name: 'Preparadas',
  components: { CTableWrapper },
}
</script>