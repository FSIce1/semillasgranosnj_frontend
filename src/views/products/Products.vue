<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CTableWrapper>
          <template #header>
            <CIcon name="cil-grid"/> Listado de Productos
          </template>
        </CTableWrapper>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import CTableWrapper from './TableProducts.vue'

export default {
  name: 'Products',
  components: { CTableWrapper },
}
</script>