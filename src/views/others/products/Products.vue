<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CCard>
          <CCardHeader class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <CIcon name="cil-grid"/> Listado de productos
            </div>
            <div>
              <CButton color="primary" @click="openModal()">Nuevo</CButton>
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
                    <CCol md="4">
                      <CInput
                        label="Código"
                        :value.sync="product.cod_product"
                        :disabled="loadingModal"
                        @keyup.enter="saveProduct()"
                        description="Por favor ingresa un código del producto."
                      />
                    </CCol>
                    <CCol md="4">
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
                    <CCol md="4">
                      <CSelect
                        label="Almacén"
                        :value.sync="product.id_warehouse"
                        :disabled="loadingModal"
                        :options=warehouses
                        @keyup.enter="saveProduct()"
                        description="Por favor seleccione un almacén."
                        placeholder="Seleccione un almacen"
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

            <!-- FILTROS -->
            <CRow>
              <CCol md="3">
                <CInput label="Nombre" v-model="filters.name" />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6" class="d-flex align-items-center">
                <CButton color="primary" @click="getProductsWithFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-magnifying-glass" /> Buscar
                </CButton>
                <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-share" /> Limpiar filtros
                </CButton>
                <CButton color="success" @click="downloadProducts" style="width: auto;">
                  <CIcon name="cil-spreadsheet" /> Generar Excel
                </CButton>
              </CCol>
            </CRow>
            <br />

            <!-- LISTADO -->
            <TableCustom :items="tableItems" :fields="fields" :loading="loading">

              <template #cod_product="{ item }">
                <td>{{ item.cod_product }}</td>
              </template>

              <template #name="{ item }">
                <td class="text-center">{{ item.name }}</td>
              </template>

              <template #price="{ item }">
                <td class="text-center">S/. {{ item.price }}</td>
              </template>

              <template #price_purchase="{ item }">
                <td class="text-center">S/. {{ item.price_purchase }}</td>
              </template>

              <template #warehouse="{ item }">
                <td class="text-center">{{ item.warehouse.name }}</td>
              </template>

              <template #unit_measure="{ item }">
                <td class="text-center">{{ item.unit_measure.name }}</td>
              </template>

              <!-- BUTTON STOCK -->
              <template #buttonStock="{item}">
                <BaseButton :modo="'stock'" @click="openModalStock(item)" />
              </template>

              <!-- BUTTON HISTORIAL -->
              <template #buttonHistory="{item}">
                <BaseButton :modo="'ver'" @click="openModalStockHistory(item)" />
              </template>
              
              <!-- BUTTON EDIT -->
              <template #buttonEdit="{item}">
                <BaseButton :modo="'editar'" :loading="loadingButtonEdit[item.id]" @click="editModal(item.id)"></BaseButton>
              </template>

              <!-- BUTTON DELETE -->
              <template #buttonDelete="{item}">
                <BaseButton :modo="'eliminar'" @click="deleteProduct(item.id, item.name)"></BaseButton>
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
  import {list, save, show, destroy, request} from '@/utils/functions.js'
  import { validateNumber, preventInvalidDecimal } from '@/utils/validators.js'

  import ModalTransfer from './ModalTransfer.vue';
  import ModalStock from './ModalStock.vue';
  import ModalStockHistory from './ModalStockHistory.vue';

  import 'vue-select/dist/vue-select.css'
  import 'vue-multiselect/dist/vue-multiselect.min.css'

  export default {
    name: 'Products',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',           label: '#' },
            { key: 'name',            label: 'Nombre',            _classes: 'text-center' },
            { key: 'price',           label: 'Precio de venta',   _classes: 'text-center' },
            { key: 'price_purchase',  label: 'Precio de compra',  _classes: 'text-center' },
            { key: 'stock',           label: 'Stock',             _classes: 'text-center' },
            { key: 'warehouse',       label: 'Almacén',           _classes: 'text-center' },
            { key: 'unit_measure',    label: 'UM',                _classes: 'text-center' },

            // Botones de acción
            { key: 'buttonStock',     label: 'Stock',     _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonHistory',   label: 'Historial', _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonEdit',      label: 'Editar',    _classes: 'text-center', _style:'min-width:20%;' },
            { key: 'buttonDelete',    label: 'Eliminar',  _classes: 'text-center', _style:'min-width:20%;' },
          ]
        }
      },
    },
    async mounted() {
      await this.getWarehouses();
      await this.getUnitsMeasure();
      await this.getProductsWithFilters();
    },
    computed: {
      permissionStock (id) {
        return id && (sessionStorage.getItem("slug_role") == "admin");
      },
      tableItems () { return this.loading ? [] : this.products }
    },
    data () {
      return {
        prefix_list: "products",
        prefix_units_measure: "units_measure",
        prefix_warehouses: "warehouses",
        prefix: "product",
        products: [],
        processes: [],
        units_measure: [],
        warehouses: [],

        loading: true,
        loadingModal: false,

        types: ['ambas', 'insumo', 'nutrivan'],
        product: {
          id                : "",
          cod_product       : "",
          name              : "",
          id_warehouse      : "",
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

        //? Modal
        titleModal: "Nuevo Producto",
        textButton: "Guardar",
        flagModal: false,
        flagModalDetail: false,
        flagModalStock: false,
        flagModalHistory: false,
        loadingButtonEdit: {},
      }
    },
    components: {
      ModalTransfer,
      ModalStock,
      ModalStockHistory,
    },
    methods: {

      //* Main Functions
        async getProductsWithFilters(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list, this.filters)
            if (resp.status === 200) this.products = resp.data.data || []
            else this.products = []
          }, { loadingKey: "loading" })

        },
        async getWarehouses(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_warehouses)
            const setWarehouses = (resp.data.data).map(role => ({ value: role.id, label: role.name }));
            if (resp.status === 200) this.warehouses = setWarehouses || []
            else this.warehouses = []
          }, { loadingKey: "loadingModal" })

        },
        async getUnitsMeasure(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_units_measure)
            const setUnitsMeasure = (resp.data.data).map(role => ({ value: role.id, label: role.name }));
            if (resp.status === 200) this.units_measure = setUnitsMeasure || []
            else this.units_measure = []
          }, { loadingKey: "loadingModal" })

        },
        async saveProduct(){

          await this.request(async () => {

            const url = this.$store.state.url
            const data = this.getSetData(this.product);
            const resp = await save(url + this.prefix, data, this.product.id)

            if (resp.status === 200) {
              await this.getProductsWithFilters()
              Swal.fire("Alerta", resp.data.message, "success")
              this.flagModal = false
            }

          }, { loadingKey: "loadingModal" })

        },
        async editModal(id){

          this.flagModal = true
          this.titleModal = "Modificar Producto"
          this.textButton = "Modificar"
          this.loadingModal = true

          try {
            const url = this.$store.state.url
            const resp = await show(url + this.prefix + `/${id}`)
            if (resp.status === 200) {
              const d = resp?.data?.data || {}
              this.product = {
                id: d.id || "",
                cod_product: d.cod_product || "",
                name: d.name || "",
                id_warehouse: d.id_warehouse || "",
                id_unit_measure: d.id_unit_measure || "",
                price: d.price || "",
                price_purchase: d.price_purchase || "",
                converted_price: d.converted_price || "",
                stock: d.stock || "",
                converted_stock: d.converted_stock || "",
                equivalent: d.equivalent || "",
                minimum_quantity: d.minimum_quantity || "",
              }
              this.$set(this.loadingButtonEdit, id, false)
            }
          } catch (e) {
            // ya maneja Swal arriba
          } finally {
            this.loadingModal = false
          }

        },
        async deleteProduct(id, name){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará el producto '${name}'.`,
            icon: "warning",
            confirmButtonText: "Sí, eliminar",
            showCancelButton: true,
            cancelButtonText: "Cancelar"
          })

          if (!res.value) return

          await this.request(async () => {

            const url = this.$store.state.url
            const resp = await destroy(url + this.prefix + `/${id}`)

            if (resp.status === 200) {
              await this.getProductsWithFilters()
              Swal.fire("Alerta", resp.data.message, "success")
            }

          })

        },
        downloadProducts() {

          const data = (this.warehouses || []).map(c => ({
            'Código': c.cod_product || '',
            'Nombre': c.name || '',
            'Precio de venta': c.price || '',
            'Precio de compra': c.price_purchase || '',
            'Stock': c.stock || '',
            'Unidad de Medida': c.unit_measure || '',
          }))

          const ws = XLSX.utils.json_to_sheet(data)
          const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1')

          for (let c = range.s.c; c <= range.e.c; c++) {
            const addr = XLSX.utils.encode_cell({ r: 0, c })
            if (ws[addr]) {
              ws[addr].s = {
                font: { bold: true },
                alignment: { horizontal: "center" }
              }
            }
          }

          const wb = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, 'Productos')
          XLSX.writeFile(wb, 'reporte_productos.xlsx')

        },

      //* Secondary Functions
        request,
        validateNumber,
        preventInvalidDecimal,
        getSetData(data){

          let formData = new FormData();

          formData.append('slug', sessionStorage.getItem("slug_role"));
          formData.append('cod_product', data.cod_product);
          formData.append('name', data.name);
          formData.append('id_warehouse', data.id_warehouse);
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

        //? Modal
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
          this.product    = { id:"", cod_product:"", name:"", id_warehouse:"", id_unit_measure:"", price:"", price_purchase:"", converted_price:"", stock:"", converted_stock:"", equivalent:"", minimum_quantity:"" }
          this.titleModal = "Nuevo Producto";
          this.textButton = "Guardar";
        },
        cleanModalTransfer(){
          this.tranfer  = { id_product:"", id_product_2:"", amount:"" }
        },
        cleanFilters() {
          this.filters = { cod_product:"", name:"", process:"", type:"" }
          this.getProducts()
        },

    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>