<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CCard>
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <CIcon name="cil-grid"/> Listado de almacenes
            </div>
            <div>
              <CButton color="twitter" @click="openModal()">
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
                    :value.sync="warehouse.name"
                    :disabled="loadingModal"
                    @keyup.enter="saveWarehouse()"
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
                  <CButton color="primary" @click="saveWarehouse()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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

            <!-- FILTROS -->
            <CRow>
              <CCol md="3">
                <CInput type="text" label="Código" v-model="filters.code" />
              </CCol>
              <CCol md="3">
                <CInput type="text" label="Nombre" v-model="filters.name" />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6" class="d-flex align-items-center">
                <CButton color="primary" @click="getWarehouses" class="mr-2" style="width: auto;">
                  <CIcon name="cil-magnifying-glass" /> Buscar
                </CButton>
                <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-share" /> Limpiar filtros
                </CButton>
                <CButton color="success" @click="downloadExcelWarehouses" style="width: auto;">
                  <CIcon name="cil-spreadsheet" /> Generar Excel
                </CButton>
              </CCol>
            </CRow>
            <br />

            <TableCustom :items="tableItems" :fields="fields" :loading="loading">

              <!-- BUTTON EDIT -->
              <template #buttonEdit="{item}">
                <BaseButton :modo="'editar'" :loading="loadingButtonEdit[item.id]" @click="editModal(item.id)"></BaseButton>
              </template>

              <!-- BUTTON DELETE -->
              <template #buttonDelete="{item}">
                <BaseButton :modo="'eliminar'" @click="deleteUnitWarehouse(item.id, item.name)"></BaseButton>
              </template>

            </TableCustom>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>

  import Swal from "sweetalert2"
  import * as XLSX from 'xlsx';
  import {list, save, show, destroy} from '../../../../assets/js/methods/functions.js'

  export default {
    name: 'WareHouses',
    props: {
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',         label: '#',        _classes: 'text-center' },
            { key: 'code',          label: 'Código',   _classes: 'text-center' },
            { key: 'name',          label: 'Nombre',   _classes: 'text-center' },

            // Botones de acción
            { key: 'buttonEdit',    label: 'Editar',   _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonDelete',  label: 'Eliminar', _classes: 'text-center', _style:'min-width:20%;' },
          ]
        }
      },
    },
    mounted() {
      this.getWarehouses();
    },
    computed: {
      tableItems () {
        return this.loading ? [] : this.warehouses
      }
    },
    data () {
      return {
        prefix_list: "warehouses",
        prefix: "warehouse",
        warehouses: [],
        loading: true,
        warehouse: {
          id: "",
          name: "",
        },
        filters: {
          name  : "",
        },

        // Modal
        titleModal: "Nuevo almacén",
        textButton: "Guardar",
        flagModal: false,
        loadingModal: false,
        loadingButtonEdit: true,
      }
    },
    methods: {
      async getWarehouses(){

        this.loading = true;

        try {

          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) {
            this.warehouses = response.data.data;
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
      async saveWarehouse(){

        this.loadingModal = true;

        try {

          const url = this.$store.state.url;
          const data = this.getSetData(this.warehouse);
          const response = await save(url + this.prefix, data, this.warehouse.id);

          if (response.status === 200) {
            
            this.getWarehouses();
            
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

            this.warehouse.id    = data?.id;
            this.warehouse.name  = data?.name;
            this.titleModal         = "Modificar Almacén";
            this.textButton         = "Modificar";

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
      async deleteUnitWarehouse(id, name){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará el almacén '${name}'.`,
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

                el.getWarehouses();
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
      downloadExcelWarehouses() {

        let data = [];
        let warehouses = this.warehouses;
        
        warehouses.forEach(warehouse => {
            data.push({
                'Código': warehouse.code,
                'Nombre': warehouse.name,
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
        link.setAttribute('download', 'reporte_almacenes.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      },
      openModal(){
        this.cleanModal();
        this.flagModal = true;
      },
      cleanModal(){
        this.warehouse.id    = "";
        this.warehouse.name  = "";
        this.titleModal         = "Nuevo Almacén";
        this.textButton         = "Guardar";
      },
      getSetData(data){

        let formData = new FormData();

        formData.append('name', data.name);

        return formData;

      },
      cleanFilters() {
        this.filters = {
          code  : "",
          name  : "",
        };
      },
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
