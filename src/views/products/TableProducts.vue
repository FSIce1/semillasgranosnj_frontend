<template>
  <CCard>
    <CCardHeader class="d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <CIcon name="cil-grid"/> Listado de productos
      </div>

      <div>
        <CButton color="primary" @click="openModal()">
          Nuevo
        </CButton>
        <!-- <CButton color="success" @click="openModalDetail()">
          Transferir
        </CButton> -->
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

            <CRow>
              <CCol md="6">
                <CInput
                  label="Código"
                  :value.sync="product.cod_product"
                  :disabled="loadingModal"
                  @keyup.enter="saveProduct()"
                  description="Por favor ingresa un código del producto."
                />
              </CCol>
              <CCol md="6">
                <CInput
                  label="Nombre"
                  :value.sync="product.name"
                  :disabled="loadingModal"
                  @keyup.enter="saveProduct()"
                  description="Por favor ingresa el nombre del producto."
                  required
                  was-validated
                />
              </CCol>
          </CRow>

          <CRow>
            <CCol md="4">
              <CSelect
                label="Unidad de Medida"
                :value.sync="product.id_unit_measure"
                :disabled="loadingModal"
                :options=units_measure
                @keyup.enter="saveProduct()"
                description="Por favor seleccione una unidad de medida."
                placeholder="Seleccione una unidad de medida"
                required
                was-validated
              />
            </CCol>
            <CCol md="4">
              <CInput
                label="Precio de venta"
                v-model="product.price"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                @keydown="preventInvalidDecimal($event)"
                description="Por favor ingresa el precio de venta del producto."
                placeholder="Ingresa el precio de venta del producto..."
                required
                was-validated
              />
            </CCol>
            <CCol md="4">
              <CInput
                label="Precio de compra"
                v-model="product.price_purchase"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                @keydown="preventInvalidDecimal($event)"
                description="Por favor ingresa el precio de compra del producto."
                placeholder="Ingresa el precio de compra del producto..."
                required
                was-validated
              />
            </CCol>
          </CRow>
          
          <CRow>

            <CCol v-if="permissionStock" md="4">
              <CInput
                label="Stock"
                v-model="product.stock"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                @input="updateFromStockUM1"
                @keydown="preventInvalidDecimal($event)"
                description="Por favor ingresa el stock del producto."
                required
                was-validated
              />
            </CCol>

            <CCol md="4">
              <CInput
                label="Cantidad mínima"
                :value.sync="product.minimum_quantity"
                :disabled="loadingModal"
                @keyup.enter="saveProduct()"
                @keydown="preventInvalidDecimal($event)"
                placeholder="Ingresa la cantidad mínima..."
              />
            </CCol>

          </CRow>

          </CCardBody>
        </CForm>

        <template #footer>

          <div v-if="!loadingModal">
            <CButton color="primary" @click="saveProduct()" class="mr-1 mb-3"><CIcon name="cil-save"/> <span v-text="textButton"></span></CButton>
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

      <ModalTransfer
        :isVisibleModalDetail="flagModalDetail"
        @get-detail="getProductsWithFilters"
        @close-modal-detail="closeModalDetail"
      />

      <ModalStock
        :isVisibleModalDetail="flagModalStock"
        :productStock="productStock"
        @get-detail="getProductsWithFilters"
        @close-modal-stock="closeModalStock"
      />

      <ModalStockHistory
        :isVisibleModalHistory="flagModalHistory"
        :product="productStock"
        @close-modal-stock-history="closeModalStockHistory"
      />

      <!-- LIST -->
      <div v-if="loading" class="text-center">
        
        <CSpinner color="primary" />
        <p>Cargando...</p>
      
      </div>
      <div v-else>
      
        <!-- FILTROS -->
        <CRow>
          <!-- <CCol md="3">
            <CInput label="Código" v-model="filters.cod_product" />
          </CCol> -->
          <CCol md="3">
            <CInput label="Nombre" v-model="filters.name" />
          </CCol>
          <!-- <CCol md="3">
            <CInput label="Proceso" v-model="filters.process" />
          </CCol> -->
          <!-- <CCol md="3">
            <CSelect
              :value.sync="filters.type"
              :options=types
              @keyup.enter="getProductsWithFilters"
              label="Tipo"
              placeholder="Seleccione un tipo"
            />
          </CCol> -->
        </CRow>
        <CRow>
          <CCol md="6" class="d-flex align-items-center">
            <CButton color="primary" @click="getProductsWithFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Buscar
            </CButton>
            <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
              <CIcon name="cil-share" /> Limpiar filtros
            </CButton>
            <CButton color="success" @click="downloadProducts" style="width: auto;">
              <CIcon name="cil-cloud-download" /> Generar Excel
            </CButton>
          </CCol>
        </CRow>
        <br />
        
        <CDataTable
          :items="products"
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

          <template #cod_product="{ item }">
            <td>{{ item.cod_product }}</td>
          </template>

          <template #name="{ item }">
            <td>{{ item.name }}</td>
          </template>

          <template #price="{ item }">
            <td>S/. {{ item.price }}</td>
          </template>

          <template #price_purchase="{ item }">
            <td>S/. {{ item.price_purchase }}</td>
          </template>

          <!-- BUTTON STOCK -->
          <template #buttonStock="{item}">
            <td>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="success"
                @click="openModalStock(item)"
              >
                <CIcon size="sm" name="cil-pencil"/>
              </CButton>
            </td>
          </template>

          <!-- BUTTON HISTORIAL -->
          <template #buttonHistory="{item}">
            <td>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="info"
                @click="openModalStockHistory(item)"
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
                @click="deleteProduct(item.id, item.name)"
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
  import {list, save, show, destroy} from '../../assets/js/methods/functions.js'
  import ModalTransfer from './ModalTransfer.vue';
  import ModalStock from './ModalStock.vue';
  import ModalStockHistory from './ModalStockHistory.vue';

  import 'vue-select/dist/vue-select.css'
  import 'vue-multiselect/dist/vue-multiselect.min.css'

  export default {
    name: 'TableProducts',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            // { key: 'cod_product', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            // { key: 'type', label: 'Tipo' },
            // { key: 'process', label: 'Proceso' },
            { key: 'price', label: 'Precio de venta' },
            { key: 'price_purchase', label: 'Precio de compra' },
            { key: 'stock', label: 'Stock' },
            // { key: 'stock_converted', label: 'Stock (SACO)' },
            { key: 'unit_measure', label: 'UM' },
            // { key: 'presentation', label: 'Presentación' },
            { key: 'buttonStock', label: 'Stock', _style:'min-width:20%;' },
            { key: 'buttonHistory', label: 'Historial', _style:'min-width:20%;' },
            { key: 'buttonEdit', label: 'Editar', _style:'min-width:20%;' },
            { key: 'buttonDelete', label: 'Eliminar', _style:'min-width:20%;' },
          ]
        }
      },
      caption: {
        type: String,
        default: 'TableProducts'
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean,
    },
    async mounted() {
      await this.getProcesses();
      await this.getUnitsMeasure();
      await this.getProductsWithFilters();
    },
    computed: {
      permissionStock (id) {
        return id && (sessionStorage.getItem("slug_role") == "admin");
      }
    },
    data () {
      return {
        prefix_list: "products",
        prefix_list_process: "processes",
        prefix_units_measure: "units_measure",
        prefix: "product",
        products: [],
        processes: [],
        units_measure: [],
        loading: true,
        types: ['ambas', 'insumo', 'nutrivan'],
        product: {
          id                : "",
          cod_product       : "",
          name              : "",
          id_process        : "",
          id_presentation   : "",
          id_unit_measure   : "",
          price             : "",
          price_purchase    : "",
          stock             : "",
          converted_stock   : "",
          equivalent        : "",
          minimum_quantity  : "",
        },
        productStock: null,
        filters: {
          cod_product : "",
          name        : "",
          process     : "",
          type        : "",
        },

        // Modal
        titleModal: "Nuevo Producto",
        textButton: "Guardar",
        flagModal: false,
        flagModalDetail: false,
        flagModalStock: false,
        flagModalHistory: false,
        loadingModal: false,
        loadingButtonEdit: true,
      }
    },
    components: {
      ModalTransfer,
      ModalStock,
      ModalStockHistory,
    },
    methods: {
      async getProductsWithFilters(){
        
        this.loading = true;

        try {
          
          const url = this.$store.state.url;

          const response = await list(url + this.prefix_list, this.filters);

          if (response.status === 200) {
            this.products = response.data.data;
          }

        } catch (errors) {

          this.products = [];

        } finally {
          
          this.loading = false;

        }

      },
      async getProcesses(){
        
        this.loading = true;

        try {
          
          const url = this.$store.state.url;
          const response = await list(url + this.prefix_list_process);

          if (response.status === 200) {
            
            let setProcesses = (response.data.data).map(role => ({
              value: role.id, 
              label: role.name
            }));

            this.processes = setProcesses;

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
      async getUnitsMeasure(){
        
        this.loading = true;

        try {
          
          const url = this.$store.state.url;
          const response = await list(url + this.prefix_units_measure);

          if (response.status === 200) {
            
            let setUnitsMeasure = (response.data.data).map(role => ({
              value: role.id, 
              label: role.name
            }));

            this.units_measure = setUnitsMeasure;

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
      async saveProduct(){
        
        this.loadingModal = true;
        
        try {
          
          const url = this.$store.state.url;
          const data = this.getSetData(this.product);
          const response = await save(url + this.prefix, data, this.product.id);
                    
          if (response.status === 200) {
            
            this.getProductsWithFilters();
            
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

            this.product.id               = data?.id;
            this.product.cod_product      = data?.cod_product;
            this.product.name             = data?.name;
            this.product.id_process       = data?.id_process;
            this.product.id_presentation  = data?.id_presentation;
            this.product.id_unit_measure  = data?.id_unit_measure;
            this.product.price            = data?.price;
            this.product.price_purchase   = data?.price_purchase;
            this.product.converted_price  = data?.converted_price;
            this.product.stock            = data?.stock;
            this.product.converted_stock  = data?.converted_stock;
            this.product.equivalent       = data?.equivalent;
            this.product.minimum_quantity = data?.minimum_quantity;
            this.titleModal               = "Modificar Producto";
            this.textButton               = "Modificar";

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
      async deleteProduct(id, name){

        let el = this;

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará el producto '${name}'.`,
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

                el.getProductsWithFilters();
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
      downloadProducts() {

        let data = [];
        let products = this.products;

        products.forEach(product => {
            data.push({
                'Código': product.cod_product,
                'Nombre': product.name,
                // 'Tipo': product.type,
                // 'Proceso': product.process,
                'Precio de venta': product.price,
                'Precio de compra': product.price_purchase,
                'Stock': product.stock,
                'Unidad de Medida': product.unit_measure,
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
        link.setAttribute('download', 'reporte_productos.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      },
      updateFromEquivalentStock() {

        const equivalent = parseFloat(this.product.equivalent);
        const converted_stock = parseFloat(this.product.converted_stock);

        if (!isNaN(equivalent) && equivalent > 0 && !isNaN(converted_stock) && converted_stock > 0) {
          this.product.stock = converted_stock / equivalent;
        } else {
          this.product.stock = 0;
        }

      },
      updateFromStockUM1() {

        const equivalent = parseFloat(this.product.equivalent);
        const stock = parseFloat(this.product.stock);

        if (!isNaN(equivalent) && equivalent > 0 && !isNaN(stock) && stock > 0) {
          this.product.converted_stock = equivalent * stock;
        } else {
          this.product.converted_stock = 0;
        }

      },
      updateFromStockUM2() {

        const equivalent = parseFloat(this.product.equivalent);
        const converted_stock = parseFloat(this.product.converted_stock);

        if (!isNaN(equivalent) && equivalent > 0 && !isNaN(converted_stock) && converted_stock > 0) {
          this.product.stock = converted_stock / equivalent;
        } else {
          this.product.stock = 0;
        }

      },
      openModal(){
        this.cleanModal();
        this.flagModal = true;
      },
      openModalDetail(){
        this.flagModalDetail = true;
      },
      closeModalDetail(){
        this.flagModalDetail = false;
      },
      openModalStock(productStock){
        this.productStock = productStock;
        this.flagModalStock = true;
      },
      closeModalStock(){
        this.flagModalStock = false;
      },
      openModalStockHistory(productStock){
        this.productStock = productStock;
        this.flagModalHistory = true;
      },
      closeModalStockHistory(){
        this.flagModalHistory = false;
      },
      cleanModal(){
        this.product.id               = "";
        this.product.cod_product      = "";
        this.product.name             = "";
        this.product.id_process       = "";
        this.product.id_presentation  = "";
        this.product.id_unit_measure  = "";
        // this.selectedPresentation     = "";
        this.product.price            = "";
        this.product.price_purchase   = "";
        this.product.converted_price  = "";
        this.product.stock            = "";
        this.product.converted_stock  = "";
        this.product.equivalent       = "";
        this.product.minimum_quantity = "";
        this.titleModal               = "Nuevo Producto";
        this.textButton               = "Guardar";
      },
      cleanModalTransfer(){
        this.tranfer.id_product       = "";
        this.tranfer.id_product_2     = "";
        this.tranfer.amount           = "";
      },
      getSetData(data){

        let formData = new FormData();

        formData.append('slug', sessionStorage.getItem("slug_role"));
        formData.append('cod_product', data.cod_product);
        formData.append('name', data.name);
        formData.append('id_process', data.id_process);
        formData.append('id_presentation', data.id_presentation);
        formData.append('id_unit_measure', data.id_unit_measure);
        formData.append('price', data.price);
        formData.append('price_purchase', data.price_purchase);
        formData.append('converted_price', data.converted_price);
        formData.append('stock', data.stock);
        formData.append('converted_stock', data.converted_stock);
        formData.append('equivalent', data.equivalent);
        formData.append('minimum_quantity', data.minimum_quantity);

        return formData;

      },
      cleanFilters() {
        this.filters = {
          cod_product : "",
          name        : "",
          process     : "",
          type        : "",
        };
      },
      preventNumber(event) {
        
        const key = event.key;
        const value = event.target.value;

        if (!/^[0-9]$/.test(key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
          event.preventDefault();
          return;
        }

        if (value.length >= 8 && ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
          event.preventDefault();
        }

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

        // Limitar la parte decimal a 4 dígitos
        if (decimalPart && decimalPart.length >= 4 && value.includes('.')) {
          event.preventDefault();
        }
      },
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
