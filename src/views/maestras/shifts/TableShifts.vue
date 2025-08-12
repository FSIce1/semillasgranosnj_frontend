<template>
  <CCard>
    <CCardHeader class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <CIcon name="cil-grid"/> Listado de turnos
      </div>
      <div>
        <CButton color="primary" @click="openModal()">
          Nuevo
        </CButton>
      </div>
    </CCardHeader>
    <CCardBody>

      <!-- MODAL -->
      <CModal
        :title="titleModal"
        size="lg"
        :show.sync="flagModal"
      >

        <CForm novalidate>
          <CCardBody>

            <CInput
              :value.sync="shift.name"
              :disabled="loadingModal"
              @keyup.enter="saveShift()"
              description="Por favor ingresa un nombre."
              label="Nombre"
              placeholder="Ingresa un nombre..."
              required
              was-validated
            />

          </CCardBody>
        </CForm>

        <template #footer>

          <div v-if="!loadingModal">
            <CButton color="primary" @click="saveShift()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
          </div>
          <div v-else>
            <CCol xl="3" lg="4" md="6">
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
            </CCol>
          </div>

        </template>

      </CModal>

      <!-- LIST -->
      <div v-if="loading" class="text-center">
        
        <CSpinner color="primary" />
        <p>Cargando...</p>
      
      </div>
      <div v-else>
        
        <!-- FILTROS -->
        <CRow>
          <CCol md="3">
            <CInput type="text" label="Nombre" v-model="filters.name" />
          </CCol>
        </CRow>
        <CRow>
          <CCol md="6" class="d-flex align-items-center">
            <CButton color="primary" @click="getShifts" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Buscar
            </CButton>
            <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Limpiar filtros
            </CButton>
            <CButton color="success" @click="downloadExcelShifts" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Generar Excel
            </CButton>
          </CCol>
        </CRow>
        <br />

        <CDataTable
          :items="shifts"
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
                @click="deleteShift(item.id, item.name)"
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
  import * as XLSX from 'xlsx';
  import {list, save, show, destroy} from '../../../assets/js/methods/functions.js'

  export default {
    name: 'TableShifts',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'name', label: 'Nombre' },
            { key: 'buttonEdit', label: 'Editar', _style:'min-width:20%;' },
            { key: 'buttonDelete', label: 'Eliminar', _style:'min-width:20%;' },
          ]
        }
      },
      caption: {
        type: String,
        default: 'TableShifts'
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean,
    },
    mounted() {
      this.getShifts();
    },
    data () {
      return {
        prefix_list: "shifts",
        prefix: "shift",
        shifts: [],
        loading: true,
        shift: {
          id: "",
          name: "",
        },
        filters: {
          name  : "",
        },
        
        // Modal
        titleModal: "Nuevo turno",
        textButton: "Guardar",
        flagModal: false,
        loadingModal: false,
        loadingButtonEdit: true,
      }
    },
    methods: {
      async getShifts(){
        
        this.loading = true;

        try {
          
          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) {
            this.shifts = response.data.data;
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
      async saveShift(){
        
        this.loadingModal = true;
        
        try {
        
          const url = this.$store.state.url;
          const data = this.getSetData(this.shift);
          const response = await save(url + this.prefix, data, this.shift.id);
                    
          if (response.status === 200) {
            
            this.getShifts();
            
            Swal.fire("Alerta", response.data.message, "success");
            this.flagModal = false;

          }

        } catch (errors) {
          
          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {
 
          this.loadingModal = false;
        
        }

      },
      async editModal(id){

        try {
        
          this.flagModal = true;
          this.loadingModal = true;

          const url = this.$store.state.url;
          const response = await show(url+ this.prefix +`/${id}`);

          if (response.status === 200) {
              
            let data = response?.data?.data;

            this.shift.id   = data?.id;
            this.shift.name = data?.name;
            this.titleModal = "Modificar Turno";
            this.textButton = "Modificar";

          }
          
        } catch (errors) {
          
          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        } finally {

          this.loadingModal = false;
        
        }

      },
      async deleteShift(id, name){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará el turno '${name}'.`,
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

                el.getShifts();
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
      downloadExcelShifts() {

        let data = [];
        let shifts = this.shifts;
        
        shifts.forEach(shift => {
            data.push({
                'Nombre': shift.name,
            });
        });

        // Convertir los datos a una hoja de trabajo de Excel
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Obtener las cabeceras (letras de las columnas) y aplicar estilos
        const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!worksheet[cellAddress]) continue;

            worksheet[cellAddress].s = {
                fill: {
                    fgColor: { rgb: "FFFF00" } // Fondo amarillo (RGB hex)
                },
                font: {
                    bold: true,
                    color: { rgb: "000000" } // Texto negro
                },
                alignment: {
                    horizontal: "center"
                }
            };
        }

        // Crear un nuevo libro y agregar la hoja de trabajo
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

        // Generar el archivo de Excel
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            cellStyles: true
        });

        // Crear un blob y desencadenar la descarga
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'reporte_turnos.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      },
      openModal(){
        this.cleanModal();
        this.flagModal = true;
      },
      cleanModal(){
        this.shift.id   = "";
        this.shift.name = "";
        this.titleModal = "Nuevo Turno";
        this.textButton = "Guardar";
      },
      getSetData(data){
          
        let formData = new FormData();
        
        formData.append('name', data.name);
        
        return formData;

      },
      cleanFilters() {
        this.filters = {
          name  : "",
        };
      },
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
