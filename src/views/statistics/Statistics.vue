<template>
  <div>
    <template v-if="loading">
      <CRow class="justify-content-center align-items-center" style="min-height: 200px;">
        <CCol sm="12" class="text-center">
          <div class="mb-2">Cargando información...</div>
          <CSpinner color="info" size="lg"/>
        </CCol>
      </CRow>
    </template>
    <template v-else>
      <CRow>
        <CCol md="3">
          <CInput 
            type="text" 
            label="Fecha (Año)" 
            v-model="filters.year" 
            placeholder="YYYY"
            @keydown="preventInvalidDecimal"
            maxlength="4" 
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol md="6" class="d-flex align-items-center">
          <CButton color="primary" @click="searchStatistics" class="mr-2" style="width: auto;">
            <CIcon name="cil-share" /> Buscar
          </CButton>
        </CCol>
      </CRow>
      <br />

      <CCardGroup columns class="card-columns cols-2">
        <CCard>
          <CCardHeader>Ventas por mes</CCardHeader>
          <CCardBody><CChartSalesPerMonth :sales_per_month="sales_per_month" /></CCardBody>
        </CCard>
        <CCard>
          <CCardHeader>Compras por mes</CCardHeader>
          <CCardBody><CChartPurchasesPerMonth :purchases_per_month="purchases_per_month" /></CCardBody>
        </CCard>
        <CCard>
          <CCardHeader>Ventas por cliente</CCardHeader>
          <CCardBody><CChartSalesPerClient :sales_per_client="sales_per_client" /></CCardBody>
        </CCard>
        <CCard>
          <CCardHeader>Compras por proveedor</CCardHeader>
          <CCardBody><CChartPurchasesPerProvider :purchases_per_client="purchases_per_client" /></CCardBody>
        </CCard>
      </CCardGroup>
    </template>
  </div>
</template>

<script>
  import * as Statistics from './index.js'
  import {list} from '../../assets/js/methods/functions.js'
  import Swal from "sweetalert2"

  export default {
    name: 'Statistics',
    components: {
      ...Statistics
    },
    mounted() {
      this.filters.year = new Date().getFullYear();
      this.getStatistics();
    },
    data () {
      return { 
        prefix: "reports",
        sales_per_month: [],
        purchases_per_month: [],
        sales_per_client: [],
        purchases_per_client: [],
        loading: true,
        filters: {
          year: "",
        },
      }
    },
    methods: {
      async getStatistics(){

        try {
          
          const url = this.$store.state.url;
          const response = await list(url + this.prefix, this.filters);
                    
          if (response.status === 200) {
                        
            let data = response?.data?.data;
            
            this.sales_per_month      = data.sales_per_month;
            this.purchases_per_month  = data.purchases_per_month;
            this.sales_per_client     = data.sales_per_client;
            this.purchases_per_client = data.purchases_per_client;
            
          }

        } catch (errors) {
          
          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        }

        this.loading = false;

      },
      searchStatistics(){

        if(this.filters.year.length != 0 && this.filters.year.length != 4){
          this.loading = false;
          Swal.fire("Alerta", "El año debe tener 4 dígitos", "warning");
          return
        }

        this.getStatistics();

      },
      cleanFilters() {
        this.filters = {
          year: "",
        };
      },
      preventInvalidDecimal(event) {
        const key = event.key;
        const value = event.target.value;
        const selectionStart = event.target.selectionStart;
        const selectionEnd = event.target.selectionEnd;

        // Permitir sobrescribir el contenido seleccionado sin bloquear por largo de la cadena
        const isReplacing = selectionStart !== selectionEnd;

        // Permite solo números, un solo punto decimal, y teclas útiles como Retroceso, Suprimir, etc.
        if (!/^[0-9]$/.test(key) && key !== '.' && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
          event.preventDefault();
          return;
        }

        // Permitir borrar (Backspace, Delete) y escribir nuevamente en la parte entera
        if (['Backspace', 'Delete'].includes(key)) {
          return; // Permite borrar sin restricciones
        }

        // Asegura que solo se permita un punto decimal
        if (key === '.' && value.includes('.')) {
          event.preventDefault();
          return;
        }

        // Si estamos reemplazando texto, permite que se complete la sobrescritura
        if (isReplacing) {
          return;
        }

        // Limitar la parte entera a 8 dígitos si ya hay un punto decimal
        const [integerPart, decimalPart] = value.split('.');

        // Si no hay parte entera, permite seguir escribiendo (por si se borró todo)
        if (!integerPart && key !== '.') {
          return;
        }

        // Limitar la parte entera a 8 dígitos si ya hay un punto decimal o aún no se ha ingresado
        if (integerPart && integerPart.length >= 8 && key !== '.' && !value.includes('.')) {
          event.preventDefault();
          return;
        }

        // Limitar la parte decimal a 2 dígitos
        if (decimalPart && decimalPart.length >= 2 && value.includes('.')) {
          event.preventDefault();
        }
      },
    },
  }

</script>
