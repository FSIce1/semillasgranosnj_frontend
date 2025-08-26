<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CTableWrapper>
          <template #header>
            <CIcon name="cil-grid"/> Caja
          </template>
        </CTableWrapper>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CTableWrapper from './TableDetails.vue'

export default {
  name: 'Details',
  components: { CTableWrapper },
}
</script>