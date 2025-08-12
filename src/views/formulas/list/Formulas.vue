<template>
  <div>
    <CRow>
      <CCol lg="12">
        <TableFormula>
          <template #header>
            <CIcon name="cil-grid"/> Listado de Fórmulas
          </template>
        </TableFormula>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import TableFormula from './TableFormula.vue'

export default {
  name: 'TableFormulas',
  components: { TableFormula },
}
</script>