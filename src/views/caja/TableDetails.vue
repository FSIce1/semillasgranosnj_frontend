<template>
  <CCard>
    <CCardHeader>
      <slot name="header">
        <CIcon name="cil-grid"/>
      </slot>
    </CCardHeader>
    <CCardBody>

      <!-- LIST -->
      <div v-if="loading" class="text-center">
        
        <CSpinner color="primary" />
        <p>Cargando...</p>
      
      </div>
      <div v-else>

        <!-- FILTROS -->
        <CRow>
          <CCol md="3">
            <CInput label="Venta/Compra" v-model="filters.consecutive" />
          </CCol>
          <CCol md="3">
            <CInput type="date" label="Fecha de creación" v-model="filters.date" />
          </CCol>
          <CCol md="3">
            <CInput type="date" label="Fecha inicio" v-model="filters.start_date" @change="validateDates" />
          </CCol>
          <CCol md="3">
            <CInput type="date" label="Fecha fin" v-model="filters.end_date" @change="validateDates" />
          </CCol>
          <CCol md="3">
            <CInput label="Cliente" v-model="filters.client" />
          </CCol>
          <CCol md="3">
            <CInput label="Usuario Creador" v-model="filters.user" />
          </CCol>
          <CCol md="3">
            <CInput label="Producto" v-model="filters.product" />
          </CCol>
          <!-- <CCol md="3">
            <CSelect
              :value.sync="filters.typeProduct"
              :options=typesProducts
              label="Tipo Producto"
            />
          </CCol> -->
          <CCol md="3">
            <CSelect
              :value.sync="filters.type"
              :options=types
              label="Tipo Compra / Venta"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md="6" class="d-flex align-items-center">
            <CButton color="primary" @click="getDetailsSales" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Buscar
            </CButton>
            <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Limpiar filtros
            </CButton>
            <CButton color="success" @click="downloadExcelSale" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Generar Excel
            </CButton>
          </CCol>
        </CRow>
        <br />

        <CDataTable
          :items="sales"
          :fields="fields"
          :items-per-page="10"
          :no-items-view="{
            noItems: 'No hay registros',
            noResults: 'No se encontraron resultados'
          }"
          hover
          :striped="striped"
          :border="border"
          :small="small"
          :fixed="fixed"
          :dark="dark"
          pagination
        >

          <template #index="{ index }">
            <td>{{ index + 1 }}</td>
          </template>

          <!-- <template #consecutive="{ item }">
            <td>{{ item.consecutive }}</td>
          </template> -->

          <template #date="{ item }">
            <td>{{ item.date }}</td>
          </template>

          <template #client="{ item }">
            <td>{{ item.client_provider }}</td>
          </template>

          <template #user_creator="{ item }">
            <td>{{ item.user }}</td>
          </template>

          <template #amount="{ item }">
            <td>{{ item.amount }}</td>
          </template>

          <template #product="{ item }">
            <td>{{ item.product.name }}</td>
          </template>

          <template #type="{ item }">
            <td>{{ item.product.type }}</td>
          </template>

          <template #price="{ item }">
            <td>{{ item.price }}</td>
          </template>

          <template #total="{ item }">
            <td>{{ item.total }}</td>
          </template>

          <!-- BUTTON VIEW -->
          <template #buttonView="{item}">
            <td>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="twitter"
                @click="sendViewSale(item)"
              >
                <CIcon size="sm" name="cil-share"/>
              </CButton>
            </td>
          </template>

        </CDataTable>

      </div>

    </CCardBody>
  </CCard>
</template>

<script>

  import Swal from "sweetalert2"
  import {list, report} from '../../assets/js/methods/functions.js'

  export default {
    name: 'TableDetails',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'consecutive', label: 'Número de Venta/Compra' },
            { key: 'typeItemCast', label: 'Tipo' },
            { key: 'date', label: 'Día de creación' },
            { key: 'client', label: 'Cliente/Proveedor' },
            { key: 'user_creator', label: 'Usuario Creador' },
            { key: 'product', label: 'Producto' },
            // { key: 'type', label: 'Tipo' },
            { key: 'amount', label: 'Cantidad' },
            { key: 'price', label: 'Precio' },
            { key: 'total', label: 'Total' },
          ]
        }
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean
    },
    mounted() {
      this.getDetailsSales();
    },
    data () {
      return {
        prefix_list: "sales_details",
        prefix: "sale",
        sales: [],
        loading: true,
        types: ['ambas', 'contado', 'credito'],
        typesProducts: ['ambas', 'insumo', 'nutrivan'],
        filters: {
          consecutive : "",
          date        : "",
          start_date  : "",
          end_date    : "",
          client      : "",
          user        : "",
          product     : "",
          typeProduct : "ambas",
          type        : "ambas",
        },
      }
    },
    methods: {
      async getDetailsSales(){

        this.loading = true;

        try {

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) { 
            this.sales = response.data.data;
          }

        } catch (errors) {

          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {

          this.loading = false;

        }

      },
      async downloadExcelSale(){
        
        this.loading = true;

        try {

          const url = this.$store.state.url;
          await report(url+"sales_details_excel", this.filters, "reporte caja.xlsx");

        } catch (errors) {
          
          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {
          
          this.loading = false;
        
        }

      },
      cleanFilters() {
        this.filters = {
          consecutive : "",
          date        : "",
          start_date  : "",
          end_date    : "",
          client      : "",
          user        : "",
          product     : "",
          typeProduct : "ambas",
          type        : "ambas",
        };
      },
      sendViewSale(item) {
        this.$router.push({ 
          name: 'Detalle venta', 
          query: { data: JSON.stringify(item) }
        });
      },
      validateDates() {
        if (this.filters.start_date && this.filters.end_date) {
          if (this.filters.end_date < this.filters.start_date) {
            Swal.fire("Alerta", "La fecha fin debe ser mayor o igual a la fecha inicio.", "warning");
            this.filters.end_date = '';
          }
        }
      }
    }
  }

</script>
