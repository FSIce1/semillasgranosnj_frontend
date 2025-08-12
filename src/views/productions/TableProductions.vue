<template>
  <CCard>
    <CCardHeader class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <CIcon name="cil-grid"/> Listado de producciones
      </div>
      <div>
        <CButton color="primary" @click="openModal()">
          Nuevo
        </CButton>
      </div>
    </CCardHeader>
    <CCardBody>

      <!-- MODAL -->
      <ModalProduction
        :id="idProduction"
        :isVisibleProduction="flagModal"
        @close-modal-production="closeModalProduction"
        @get-productions="getProductions"
      />

      <!-- LIST -->
      <div v-if="loading" class="text-center">
        
        <CSpinner color="primary" />
        <p>Cargando...</p>
      
      </div>
      <div v-else>

        <!-- FILTROS -->
        <CRow>
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
            <CInput label="Fórmula" v-model="filters.formula" />
          </CCol>
        </CRow>
        <CRow>
          <CCol md="12" class="d-flex align-items-center">
            <CButton color="primary" @click="getProductions" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Buscar
            </CButton>
            <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Limpiar filtros
            </CButton>
            <CButton color="success" @click="downloadExcelProductions('productions_excel', 'producciones')" class="mr-2" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Producciones
            </CButton>
            <CButton color="success" @click="downloadExcelProductions('productions_details_excel', 'insumos_producciones')" class="mr-2" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Insumos de Producciones
            </CButton>
            <CButton color="success" @click="downloadExcelProductions('productions_products_excel', 'producciones_x_productos')" class="mr-2" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Pro x Producto
            </CButton>
            <CButton color="success" @click="downloadExcelProductions('productions_shifts_excel', 'producciones_x_turnos')" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Pro x Turno
            </CButton>
            <!-- <CButton color="success" @click="downloadExcelProductions('productions_processes_excel', 'producciones_x_procesos')" class="mr-2" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Pro x Proceso
            </CButton> -->
          </CCol>
        </CRow>
        <br />

        <CDataTable
          :items="productions"
          :fields="fields"
          :items-per-page="10"
          :hover="hover"
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

          <template #anno="{ item }">
            <td>{{ getYear(item.date) }}</td>
          </template>

          <template #date="{ item }">
            <td>{{ item.date }}</td>
          </template>

          <template #month="{ item }">
            <td>{{ getMonth(item.date) }}</td>
          </template>

          <!-- BUTTON EDIT -->
          <template #buttonEdit="{item}">
            <td>
              <template v-if="!loadingButtonEdit">
                <CCardBody>
                  <div class="sk-chase">
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                    <div class="sk-chase-dot"></div>
                  </div>
                </CCardBody>
              </template>
              <template v-else>
                <CButton
                  :name="item.id"
                  size="sm"
                  :key="item.id"
                  color="facebook"
                  @click="editModal(item.id)"
                >
                  <CIcon size="sm" name="cil-comment-square"/>
                </CButton>
              </template>

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
                @click="deleteProduction(item.id)"
              >
                <CIcon size="sm" name="cil-ban"/>
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
  import ModalProduction from './ModalProduction.vue';
  import {list, report, destroy} from '../../assets/js/methods/functions.js'

  export default {
    name: 'TableProductions',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'consecutive', label: 'N. de Producción' },
            { key: 'anno', label: 'Año' },
            { key: 'date', label: 'Fecha' },
            { key: 'month', label: 'Mes' },
            { key: 'tons_produced', label: 'TN' },
            { key: 'shift', label: 'Turno' },
            { key: 'machine', label: 'Máquina' },
            { key: 'formula', label: 'Fórmula' },
            { key: 'observations', label: 'Observaciones' },
            { key: 'buttonEdit', label: 'Editar', _style:'min-width:20%;' },
            { key: 'buttonDelete', label: 'Eliminar', _style:'min-width:20%;' },
          ]
        }
      },
      caption: {
        type: String,
        default: 'TableProductions'
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean,
    },
    mounted() {
      this.getProductions();
    },
    data () {
      return {
        prefix_list: "productions",
        prefix: "production",
        idProduction: 0,
        productions: [],
        products: [],
        loading: true,
        production: {
          id: "",
          product: {
            "name"          : "",
            "code"          : "",
            "presentation"  : "",
            "process"       : "",
          },
          tons_produced: 0,
          shift: "",
          machine: "",
          observation: "",
        },
        filters: {
          date        : "",
          start_date  : "",
          end_date    : "",
          formula     : "",
          type        : "production",
        },
        selectedProduct: "",

        // Modal
        titleModal: "Nueva Producción",
        textButton: "Guardar",
        flagModal: false,
        loadingModal: false,
        loadingButtonEdit: true,
      }
    },
    components: {
      ModalProduction
    },
    methods: {
      async getProductions(){

        this.loading = true;

        try {

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) {            
            this.productions = response.data.data;
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
      async deleteProduction(id){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará la producción.`,
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

                el.getProductions();
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
      async downloadExcelProductions(prefix, name){

        this.loading = true;

        try {

          const url = this.$store.state.url;
          await report(url+prefix, this.filters, "reporte "+ name +".xlsx");

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
      async openModal(){
        this.idProduction = 0;
        this.flagModal    = true;
      },
      closeModalProduction(){        
        this.flagModal = false;
      },
      async editModal(id){
        this.idProduction = id;
        this.flagModal    = true;
      },
      cleanFilters() {
        this.filters = {
          date        : "",
          start_date  : "",
          end_date    : "",
          formula     : "",
        };
      },
      getYear(dateString) {
        return dateString.split('-')[0];
      },
      getDate(dateString) {
        return dateString.split('-')[2]+"-"+this.getMonth(dateString);
      },
      getMonth(dateString) {
        
        const monthNumber = dateString.split('-')[1];
        
        const months = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        return months[parseInt(monthNumber, 10) - 1];

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

<style src="spinkit/spinkit.min.css"></style>
