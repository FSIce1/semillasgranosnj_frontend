<template>
  <CCard>
    <CCardHeader class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <CIcon name="cil-grid"/> Listado de proveedores
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
              :value.sync="provider.name"
              :disabled="loadingModal"
              @keyup.enter="saveProvider()"
              description="Por favor ingresa un nombre."
              label="Nombre"
              placeholder="Ingresa un nombre..."
              required
              was-validated
            />

            <CInput
              :value.sync="provider.document"
              :disabled="loadingModal"
              @keydown="validateNumber"
              @keyup.enter="saveProvider()"
              description="Por favor ingresa el ruc."
              label="RUC"
              maxlength="11"
              placeholder="Ingresa el ruc..."
            />

            <!-- <CInput
              :value.sync="provider.email"
              :disabled="loadingModal"
              @keyup.enter="saveProvider()"
              description="Por favor ingresa un email."
              label="Email"
              placeholder="Ingresa un email..."
              required
              was-validated
            /> -->

            <CInput
              :value.sync="provider.phone"
              :disabled="loadingModal"
              @keydown="validateNumber"
              @keyup.enter="saveProvider()"
              description="Por favor ingresa un teléfono."
              label="Teléfono"
              placeholder="Ingresa un teléfono..."
              required
              was-validated
            />

            <CInput
              :value.sync="provider.address"
              :disabled="loadingModal"
              @keyup.enter="saveProvider()"
              description="Por favor ingresa una dirección."
              label="Dirección"
              placeholder="Ingresa una dirección..."
              required
              was-validated
            />

            <CInput
              :value.sync="provider.description"
              :disabled="loadingModal"
              @keyup.enter="saveProvider()"
              description="Por favor ingresa una descripción."
              label="Descripción"
              placeholder="Ingresa una descripción..."
              was-validated
            />

          </CCardBody>
        </CForm>

        <template #footer>

          <div v-if="!loadingModal">
            <CButton color="primary" @click="saveProvider()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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

      <!-- MODAL: LISTADO DE COMPRAS POR PROVEEDOR -->
      <CModalPurchasesByProvider
        :isVisible="flagModalPurchasesByProvider"
        :provider="providerData"
        @close-modal-purchases-by-provider="closeModalPurchasesByProvider"
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
            <CInput type="text" label="RUC" v-model="filters.document" />
          </CCol>
          <CCol md="3">
            <CInput type="text" label="Nombre" v-model="filters.name" />
          </CCol>
          <CCol md="3">
            <CSelect
              :value.sync="filters.type"
              :options=types
              label="Tipo Compra"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md="6" class="d-flex align-items-center">
            <CButton color="primary" @click="getProviders" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Buscar
            </CButton>
            <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Limpiar filtros
            </CButton>
            <CButton color="success" @click="downloadExcelProviders" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Generar Excel
            </CButton>
          </CCol>
        </CRow>
        <br />

        <CDataTable
          :items="providers"
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

          <!-- BUTTON VIEW -->
          <template #buttonViewSales="{item}">
            <td>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="twitter"
                @click="openModalPurchasesByProvider(item)"
              >
                <CIcon size="sm" name="cil-share"/>
              </CButton>
            </td>
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
                @click="deleteProvider(item.id, item.name)"
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
  import CModalPurchasesByProvider from "./ModalPurchasesByProvider.vue";

  export default {
    name: 'TableProviders',
    components: {
      CModalPurchasesByProvider,
    },
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'document', label: 'RUC' },
            { key: 'name', label: 'Nombre' },
            { key: 'phone', label: 'Teléfono' },
            { key: 'address', label: 'Dirección' },
            { key: 'description', label: 'Descripción' },
            { key: 'buttonViewSales', label: 'Ver', _style:'min-width:20%;' },
            { key: 'buttonEdit', label: 'Editar', _style:'min-width:20%;' },
            { key: 'buttonDelete', label: 'Eliminar', _style:'min-width:20%;' },
          ]
        }
      },
      caption: {
        type: String,
        default: 'TableProviders'
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean,
    },
    mounted() {
      this.getProviders();
    },
    data () {
      return {
        prefix_list: "providers",
        prefix: "provider",
        providers: [],
        providerData: null,
        loading: true,
        types: ['ambas', 'contado', 'credito'],
        provider: {
          id          : "",
          document    : "",
          name        : "",
          phone       : "",
          address     : "",
          description : "",
        },
        filters: {
          document  : "",
          name      : "",
          type      : "",
        },

        // Modal
        titleModal: "Nuevo Proveedor",
        textButton: "Guardar",
        flagModal: false,
        flagModalPurchasesByProvider: false,
        loadingModal: false,
        loadingButtonEdit: true,
      }
    },
    methods: {
      async getProviders(){
        
        this.loading = true;

        try {
          
          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) {
            this.providers = response.data.data;
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
      async saveProvider(){
        
        this.loadingModal = true;
        
        try {
          
          const url = this.$store.state.url;
          const data = this.getSetData(this.provider);
          const response = await save(url + this.prefix, data, this.provider.id);

          if (response.status === 200) {
            
            this.getProviders();
            
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
            
            this.provider.id          = data?.id;
            this.provider.document    = data?.document;
            this.provider.name        = data?.name;
            this.provider.phone       = data?.phone;
            this.provider.address     = data?.address;
            this.provider.description = data?.description;
            this.titleModal           = "Modificar Proveedor";
            this.textButton           = "Modificar";

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
      async openModalPurchasesByProvider(item){
        this.providerData = item;
        this.flagModalPurchasesByProvider = true;
      },
      closeModalPurchasesByProvider() {
        this.getProviders();
        this.flagModalPurchasesByProvider = false;
      },
      async deleteProvider(id, name){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará el proveedor '${name}'.`,
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

                el.getProviders();
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
      downloadExcelProviders() {

        let data = [];
        let providers = this.providers;
        
        providers.forEach(provider => {
            data.push({
                'RUC'         : provider.document,
                'Nombre'      : provider.name,
                'Teléfono'    : provider.phone,
                'Dirección'   : provider.address,
                'Descripción' : provider.description,
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
        link.setAttribute('download', 'reporte_proveedores.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      },
      openModal(){
        this.cleanModal();
        this.flagModal = true;
      },
      cleanModal(){
        this.provider.id          = "";
        this.provider.document    = "";
        this.provider.name        = "";
        this.provider.phone       = "";
        this.provider.address     = "";
        this.provider.description = "";
        this.titleModal           = "Nuevo Proveedor";
        this.textButton           = "Guardar";
      },
      getSetData(data){

        let formData = new FormData();

        formData.append('document', data.document);
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('address', data.address);
        formData.append('description', data.description);
        
        return formData;

      },
      validateNumber(event) {

        const key = event.key;

        if (!/^[0-9]$/.test(key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
          event.preventDefault();
          return;
        }

        // Permitir borrar (Backspace, Delete) y escribir nuevamente en la parte entera
        if (['Backspace', 'Delete'].includes(key)) {
          return; // Permite borrar sin restricciones
        }

      },
      cleanFilters() {
        this.filters = {
          document  : "",
          name      : "",
          type      : "",
        };
      },
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
