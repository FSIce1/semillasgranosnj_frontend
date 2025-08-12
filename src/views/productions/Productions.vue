<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CTableWrapper>
          <template #header>
            <CIcon name="cil-grid"/> Listado de Producciones
          </template>
        </CTableWrapper>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import CTableWrapper from './TableProductions.vue'

export default {
  name: 'Productions',
  components: { CTableWrapper },
}
</script>