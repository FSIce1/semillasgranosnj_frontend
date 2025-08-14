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
            <CInput type="text" label="Nombre" v-model="filters.name" />
          </CCol>
          <CCol md="3">
            <CInput type="text" label="Núcleo" v-model="filters.nucleo" />
          </CCol>
          <CCol md="3">
            <CInput type="text" label="Unidad de Medida" v-model="filters.unit_measure" />
          </CCol>
        </CRow>
        <CRow>
          <CCol md="6" class="d-flex align-items-center">
            <CButton color="primary" @click="getFormulas" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Buscar
            </CButton>
            <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Limpiar filtros
            </CButton>
            <CButton color="success" @click="downloadExcelFormulas" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Generar Excel
            </CButton>
          </CCol>
        </CRow>
        <br />

        <CDataTable
          :items="formulas"
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

          <template #total="{ item }">
            <td>{{ item.total }}</td>
          </template>

          <template #cost_total="{ item }">
            <td>S/. {{ item.cost_total }}</td>
          </template>

          <template #unit_measure="">
            <td>Kg</td>
          </template>

          <template #buttonDownload="{item}">
            <td>
              <a 
                href="#" 
                class="btn btn-sm btn-success ml-1" 
                @click="downloadFormula(item.id)"
              >
                <CIcon size="sm" name="cil-share"/>
              </a>
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
                @click="goToReceiver(item)"
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
                @click="deleteFormula(item.id, item.name)"
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
  import {list, destroy, report} from '../../../assets/js/methods/functions.js'

  export default {
    name: 'TableFormula',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'name', label: 'Nombre' },
            { key: 'total', label: 'Total' },
            { key: 'cost_total', label: 'Costo Total' },
            { key: 'unit_measure', label: 'Unidad de Medida' },
            { key: 'buttonDownload', label: 'Descargar', _style:'min-width:20%;' },
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
      dark: Boolean,
    },
    mounted() {
      this.getFormulas();
    },
    data () {
      return {
        prefix_list: "formulas",
        prefix: "formula",
        formulas: [],
        loading: true,
        filters: {
          id            : "",
          name          : "",
          nucleo        : "",
          unit_measure  : "",
        },
      }
    },
    methods: {
      async getFormulas(){
        
        this.loading = true;

        try {
          
          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) {            
            this.formulas = response.data.data;
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
      async deleteFormula(id, name){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará la fórmula '${name}'.`,
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

                el.getFormulas();
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
      downloadExcelFormulas() {
    
        let data = [];
        let formulas = this.formulas;
        
        formulas.forEach(formula => {
            data.push({
                'Nombre'            : formula.name,
                'Unidad de Medida'  : formula.unit_measure,
                'Núcleo'            : formula.nucleo,
                'Total'             : formula.total
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
        link.setAttribute('download', 'reporte_formulas.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      },
      async downloadFormula(id){

        this.loading = true;

        try {

          this.filters.id = id;
          const url = this.$store.state.url;
          await report(url+"formula_excel", this.filters, "reporte fórmula.xlsx");

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
          date        : "",
          start_date  : "",
          end_date    : "",
          product     : "",
        };
      },
      goToReceiver(item) {        
        this.$router.push({ 
          name: 'Agregar Fórmula', 
          query: { data: JSON.stringify(item) }
        });
      }
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
