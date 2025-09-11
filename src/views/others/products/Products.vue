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
              <CButton color="primary" @click="openModalProduct()">Nuevo</CButton>
            </div>
          </CCardHeader>

          <CCardBody>

            <ModalProduct
              :isVisibleModalProduct="flagModalProduct"
              :selectedProduct="selectedProduct"
              @get-products="getProductsWithFilters"
              @close-modal-product="closeModalProduct"
            />

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
                <td class="text-center">{{ item.warehouse?.name }}</td>
              </template>

              <template #lot="{ item }">
                <td class="text-center">{{ item.lot?.name }}</td>
              </template>

              <template #unit_measure="{ item }">
                <td class="text-center">{{ item.unit_measure?.name }}</td>
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
                <BaseButton :modo="'editar'" :loading="loadingButtonEdit[item.id]" @click="openModalProduct(item)"></BaseButton>
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
  import {list, destroy, request} from '@/utils/functions.js'

  import ModalProduct from './ModalProduct.vue';
  import ModalTransfer from './ModalTransfer.vue';
  import ModalStock from './ModalStock.vue';
  import ModalStockHistory from './ModalStockHistory.vue';

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
            { key: 'warehouse',       label: 'Almacén',           _classes: 'text-center' },
            { key: 'lot',             label: 'Lote',              _classes: 'text-center' },
            { key: 'price',           label: 'Precio de venta',   _classes: 'text-center' },
            { key: 'price_purchase',  label: 'Precio de compra',  _classes: 'text-center' },
            { key: 'stock',           label: 'Stock',             _classes: 'text-center' },
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
      await this.getProductsWithFilters();
    },
    computed: {
      tableItems () { return this.loading ? [] : this.products }
    },
    data () {
      return {
        prefix_list: "products",
        prefix: "product",
        products: [],

        loading: true,
        selectedProduct: null,
        productStock: null,
        filters: {
          cod_product : "",
          name        : "",
          process     : "",
          type        : "",
        },

        //? Modal
        flagModalProduct: false,
        flagModalDetail: false,
        flagModalStock: false,
        flagModalHistory: false,
        loadingButtonEdit: {},
      }
    },
    components: {
      ModalProduct,
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

          const data = (this.products || []).map(c => ({
            'Código': c.cod_product || '',
            'Nombre': c?.name || '',
            'Precio de venta': c.price || '',
            'Precio de compra': c.price_purchase || '',
            'Stock': c.stock || '',
            'Unidad de Medida': c.unit_measure?.name || '',
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

        //? Modal
        openModalProduct(product = null){
          this.selectedProduct = product;
          this.flagModalProduct = true;
        },
        closeModalProduct(){
          this.selectedProduct = null;
          this.flagModalProduct = false;
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
        cleanFilters() {
          this.filters = { cod_product:"", name:"", process:"", type:"" }
          this.getProducts()
        },

    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>