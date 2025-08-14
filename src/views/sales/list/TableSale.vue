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
            <CInput label="Consecutivo" v-model="filters.consecutive" />
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
            <CSelect
              :value.sync="filters.type"
              :options=types
              label="Tipo de Venta"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md="12" class="d-flex align-items-center">
            <CButton color="primary" @click="getSalesWithFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Buscar
            </CButton>
            <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Limpiar filtros
            </CButton>
            <CButton color="success" @click="downloadExcelSale" class="mr-2" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Reporte General
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
        
          <template #client="{ item }">
            <td>{{ item.client.name }}</td>
          </template>
  
          <template #user_creator="{ item }">
            <td>{{ item.user.name }}</td>
          </template>
          
          <template #type="{ item }">
            <td>{{ item.type == "credito" ? "Crédito" : "Contado" }}</td>
          </template>

          <!-- <template #subtotal="{ item }">
            <td>S/. {{ item.subtotal }}</td>
          </template>

          <template #deposit="{ item }">
            <td>S/. {{ item.deposit }}</td>
          </template>

          <template #consumption="{ item }">
            <td>S/. {{ item.consumption }}</td>
          </template>

          <template #total="{ item }">
            <td>S/. {{ item.total }}</td>
          </template> -->
  
          <!-- BUTTON TICKET -->
          <template #buttonTicket="{item}">
            <td>
              <a 
                href="#" 
                class="btn btn-sm btn-youtube ml-1" 
                @click="downloadReport('sale_pdf', 'ticket', '.pdf', item)"
              >
                <CIcon size="sm" name="cil-print"/>
              </a>
            </td>
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

          <!-- BUTTON EDIT -->
          <template #buttonEdit="{item}">
            <td>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="facebook"
                @click="sendEditSale(item)"
              >
                <CIcon size="sm" name="cil-comment-square"/>
              </CButton>
            </td>
          </template>

          <!-- BUTTON DELETE -->
          <template #buttonDelete="{item}">
            <td>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="youtube"
                @click="deleteSale(item.id, item.consecutive)"
              >
                <CIcon size="sm" name="cil-ban"/>
              </CButton>
            </td>
          </template>

        </CDataTable>

        <div class="totals">
          <br>
          <p><b>Subtotal:</b> S/. {{ totalSubtotal.toFixed(2) }}</p>
          <p><b>Total:</b> S/. {{ totalFinal.toFixed(2) }}</p>
        </div>

      </div>

    </CCardBody>
  </CCard>
</template>

<script>

  import Swal from "sweetalert2"
  import {list, report, ticket, destroy} from '../../../assets/js/methods/functions.js'

  export default {
    name: 'TableSale',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'consecutive', label: 'Número de Venta' },
            { key: 'date', label: 'Día de creación' },
            { key: 'client', label: 'Cliente' },
            { key: 'user_creator', label: 'Usuario Creador' },
            { key: 'type', label: 'Modo' },
            { key: 'boleta_factura', label: 'Tipo' },
            { key: 'subtotal', label: 'Subtotal (S/.)' },
            { key: 'deposit', label: 'Depositó (S/.)' },
            // { key: 'consumption', label: 'Consumo' },
            { key: 'total', label: 'Total (S/.)' },
            { key: 'buttonTicket', label: 'Ticket', _style:'min-width:20%;' },
            { key: 'buttonView', label: 'Ver', _style:'min-width:20%;' },
            { key: 'buttonEdit', label: 'Editar', _style:'min-width:20%;' },
            { key: 'buttonDelete', label: 'Eliminar', _style:'min-width:20%;' },
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
      this.getSalesWithFilters();
    },
    data () {
      return {
        prefix_list: "sales",
        prefix: "sale",
        sales: [],
        loading: true,
        types: ['ambas', 'contado', 'credito'],
        totalSubtotal: 0,
        totalFinal: 0,
        filters: {
          consecutive : "",
          date        : "",
          type        : "ambas",
          start_date  : "",
          end_date    : "",
          client      : "",
          user        : "",
        },
      }
    },
    watch: {
      sales: {
        immediate: true,
        handler(newSales) {
          this.totalSubtotal = newSales.reduce((sum, sale) => sum + parseFloat(sale.subtotal || 0), 0);
          this.totalFinal = newSales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
        }
      }
    },
    methods: {
      async getSalesWithFilters(){
        
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
      async deleteSale(id, consecutive){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará la venta '${consecutive}'.`,
          icon: "warning",
          confirmButtonText: "Sí, eliminar",
          closeOnConfirm: false,
          showCancelButton: true,
          cancelButtonText: "Cancelar"
        })
        .then(async function(result) {

          if(result.value) {

            try {

              const url = el.$store.state.url;
              const response = await destroy(url+el.prefix+`/${id}`);
              
              if (response.status === 200) {

                el.getSalesWithFilters();
                Swal.fire("Alerta", response.data.message, "success");
                
              }

            } catch (errors) {
              
              if (errors.length > 0) {
                Swal.fire("Alerta", errors[0], "warning");
              } else {
                Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
              }

            }

          }

        });

      },
      async downloadExcelSale(){
        
        this.loading = true;

        try {

          const url = this.$store.state.url;
          await report(url+"sales_excel", this.filters, "reporte ventas.xlsx");

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
      async downloadReport(method, type, extention, sale) {

        this.loading = true;

        try {

          const url = this.$store.state.url;

          if(type == "excel"){
            await report(url+method, sale, "reporte N°"+sale.consecutive+extention);
          } else {
            await ticket(url+method, sale, "reporte N°"+sale.consecutive+extention);
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
      cleanFilters() {
        this.filters = {
          consecutive : "",
          date        : "",
          type        : "ambas",
          start_date  : "",
          end_date    : "",
          client      : "",
          user        : "",
        };
      },
      sendEditSale(item) {
        this.$router.push({ 
          name: 'Agregar venta', 
          query: { data: JSON.stringify(item) }
        });
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
