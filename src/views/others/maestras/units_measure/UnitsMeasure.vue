<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CTableWrapper>
          <template #header>
            <CIcon name="cil-grid"/> Listado de Unidades de Medida
          </template>
        </CTableWrapper>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import CTableWrapper from './TableUnitsMeasure.vue'

export default {
  name: 'UnitsMeasure',
  components: { CTableWrapper },
}
</script>