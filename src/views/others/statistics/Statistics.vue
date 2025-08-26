<template>
  <div>
    <!-- LOADING -->
    <template v-if="loading">
      <CRow class="justify-content-center align-items-center" style="min-height: 220px;">
        <CCol sm="12" class="text-center">
          <div class="mb-2 text-muted">Cargando información...</div>
          <CSpinner color="info" size="lg"/>
        </CCol>
      </CRow>
    </template>

    <!-- CONTENT -->
    <template v-else>
      <CCard class="mb-3 shadow-sm">
        <CCardHeader class="bg-light">
          <CRow class="align-items-end">
            <CCol md="6">
              <CInputGroup>
                <CInput
                  type="text"
                  label="Fecha (Año)"
                  v-model.trim="filters.year"
                  placeholder="YYYY"
                  maxlength="4"
                  inputmode="numeric"
                  pattern="\\d{4}"
                  :is-valid="touched ? isYearValid : null"
                  :is-invalid="touched && !isYearValid"
                  @input="onYearInput"
                  @keyup.enter="searchStatistics"
                  @blur="touched = true"
                />
                  <CButton
                    color="primary"
                    class="mr-2"
                    style="width:auto;"
                    :disabled="!isYearValid || busy"
                    title="Buscar"
                    @click="searchStatistics"
                  >
                    <CIcon name="cil-magnifying-glass" class="mr-1"/> Buscar
                  </CButton>
                  <CButton
                    color="info"
                    variant="outline"
                    style="width:auto;"
                    :disabled="busy && !filters.year"
                    title="Limpiar filtros"
                    @click="cleanFilters"
                  >
                    <CIcon name="cil-x-circle" class="mr-1"/> Limpiar
                  </CButton>
              </CInputGroup>
              <small v-if="touched && !isYearValid" class="text-danger d-block mt-1">
                El año debe tener 4 dígitos numéricos (YYYY).
              </small>
            </CCol>
          </CRow>
        </CCardHeader>
      </CCard>

      <!-- DASHBOARD -->
      <CCardGroup columns class="card-columns cols-2">
        <CCard>
          <CCardHeader class="d-flex align-items-center">
            <CIcon name="cil-chart-line" class="mr-2"/> Ventas por mes
          </CCardHeader>
          <CCardBody>
            <CChartSalesPerMonth :sales_per_month="sales_per_month"/>
          </CCardBody>
        </CCard>

        <CCard>
          <CCardHeader class="d-flex align-items-center">
            <CIcon name="cil-chart-line" class="mr-2"/> Compras por mes
          </CCardHeader>
          <CCardBody>
            <CChartPurchasesPerMonth :purchases_per_month="purchases_per_month"/>
          </CCardBody>
        </CCard>

        <CCard>
          <CCardHeader class="d-flex align-items-center">
            <CIcon name="cil-user" class="mr-2"/> Ventas por cliente
          </CCardHeader>
          <CCardBody>
            <CChartSalesPerClient :sales_per_client="sales_per_client"/>
          </CCardBody>
        </CCard>

        <CCard>
          <CCardHeader class="d-flex align-items-center">
            <CIcon name="cil-factory" class="mr-2"/> Compras por proveedor
          </CCardHeader>
          <CCardBody>
            <!-- Mantengo tu prop para no romper: -->
            <CChartPurchasesPerProvider :purchases_per_client="purchases_per_client"/>
          </CCardBody>
        </CCard>
      </CCardGroup>
    </template>
  </div>
</template>

<script>
import * as Statistics from './index.js'
import { list } from '../../../assets/js/methods/functions.js'
import Swal from 'sweetalert2'

export default {
  name: 'Statistics',
  components: { ...Statistics },
  data () {
    return {
      prefix: 'reports',
      sales_per_month: [],
      purchases_per_month: [],
      sales_per_client: [],
      purchases_per_client: [],
      loading: true,
      busy: false,
      touched: false,
      filters: {
        year: '2025'
      }
    }
  },
  computed: {
    isYearValid () {
      return this.filters.year === '' || /^[0-9]{4}$/.test(this.filters.year)
    }
  },
  mounted () {
    this.filters.year = String(new Date().getFullYear())
    this.getStatistics()
  },
  methods: {
    onYearInput (e) {
      // Solo números, máximo 4 dígitos
      this.filters.year = (e.target.value || '').replace(/\D/g, '').slice(0, 4)
    },
    async getStatistics () {
      this.busy = true
      try {
        const url = this.$store.state.url
        const response = await list(url + this.prefix, this.filters)
        if (response.status === 200) {
          const data = response?.data?.data || {}
          this.sales_per_month     = data.sales_per_month || []
          this.purchases_per_month = data.purchases_per_month || []
          this.sales_per_client    = data.sales_per_client || []
          this.purchases_per_client= data.purchases_per_client || []
        }
      } catch (errors) {
        if (errors?.length > 0) Swal.fire('Alerta', errors[0], 'warning')
        else Swal.fire('Alerta', 'Ocurrió un error desconocido', 'error')
      } finally {
        this.loading = false
        this.busy = false
      }
    },
    searchStatistics () {
      this.touched = true
      if (!this.isYearValid) {
        Swal.fire('Alerta', 'El año debe tener 4 dígitos', 'warning')
        return
      }
      this.getStatistics()
    },
    cleanFilters () {
      this.filters.year = ''
      this.touched = false
      this.getStatistics()
    }
  }
}
</script>

<style scoped>
.card-columns .card { overflow: hidden; }
</style>
