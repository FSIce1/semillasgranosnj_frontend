
<template>
  <CModal title="Listado de Insumos" size="lg" :show="isVisible">

    <slot name="header">
      <CIcon name="cil-grid"/> Listado de Productos 
    </slot>

    <template>
      <CCardBody>

        <!-- FILTROS -->
        <CRow class="align-items-end">
          <CCol md="4">
            <CInput label="Código" v-model="filters.cod_product" />
          </CCol>
          <CCol md="4">
            <CInput label="Nombre" v-model="filters.name" />
          </CCol>
          <CCol md="4">
            <CButton color="primary" @click="searchProducts" class="mr-1 mb-3">
              <CIcon name="cil-magnifying-glass" /> Buscar
            </CButton>
          </CCol>
        </CRow>

        <!-- LISTADO -->
        <CDataTable
          :items="tableItems"
          :fields="fields"
          :items-per-page="5"
          :no-items-view="{
            noItems: 'No hay registros',
            noResults: 'No se encontraron resultados'
          }"
          hover
          striped
          border
          small
          fixed
          pagination
          :loading="loadingProducts"
        >

          <template #loading>
            <div class="text-center p-4">
              <CSpinner color="primary" />
              <p>Cargando...</p>
            </div>
          </template>

          <template #index="{ index }">
            <td>{{ index + 1 }}</td>
          </template>

          <template #buttonSelect="{ item }">
            <td style="text-align: center">
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="facebook"
                @click="selectProduct(item)"
              >
                <CIcon size="sm" name="cil-magnifying-glass" />
              </CButton>
            </td>
          </template>

        </CDataTable>
      </CCardBody>
    </template>
    
    <template #header>
      <CButtonClose @click="closeModal" class="text-black"/>
    </template>
    <template #footer>
      <CButton @click="closeModal" color="danger">Cerrar</CButton>
    </template>
    
  </CModal>
</template>

<script>

import {list} from '../../assets/js/methods/functions.js'

export default {
  name: 'ModalProducts',
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    unitMeasure: {
      type: Number,
      required: false,
      default: null
    },
    type: {
      type: String,
      required: false,
      default: null
    },
    details: {
      type: Array,
      required: false,
    },
    fields: {
      type: Array,
      default() {
        return [
            { key: "index", label: "#" },
            { key: "cod_product", label: "Código" },
            { key: "name", label: "Nombre" },
            { key: "price", label: "Precio de venta (S/.)" },
            { key: "price_purchase", label: "Precio de compra (S/.)" },
            { key: 'stock', label: 'Stock' },
            { key: "unit_measure", label: "UM" },
            {
                key: "buttonSelect",
                label: "Seleccionar",
                _style: "min-width:20%;",
            },
        ];
      },
    },
  },
  data() {
    return {
      prefix_list_products: "products",
      products: [],
      filters: {
        cod_product   : "",
        name          : "",
        type          : "",
        unit_measure  : "",
        ids_products  : "",
      },
      loadingProducts: false,
    };
  },
  async mounted() {
    this.filters.unit_measure = this.unitMeasure;
    this.filters.type         = this.type;
    await this.getProducts();
  },
  computed: {
    tableItems () {
      return this.loading ? [] : this.products
    }
  },
  watch: {
    async isVisible(newValue) {
      if (newValue) {

        await this.cleanFilters();

        const productIds = this.details ? this.details.map(item => item.product.id) : [];

        this.filters.ids_products = productIds;
        this.filters.unit_measure = this.unitMeasure;
        this.filters.type         = this.type;
        await this.getProducts();

      }
    },
  },
  methods: {
    async getProducts(){
      
      this.loadingProducts = true;

      try {
        
        const url = this.$store.state.url;

        const response = await list(url + this.prefix_list_products, this.filters);

        if (response.status === 200) {
          this.products = response.data.data;
        }

      } catch (errors) {

        this.products = [];

      } finally {
        
        this.loadingProducts = false;

      }

    },
    async cleanFilters(){
      this.filters = {
        cod_product   : "",
        name          : "",
        unit_measure  : "",
        ids_products  : "",
      }
    },
    searchProducts() {
      this.getProducts();
    },
    selectProduct(item) {
      this.$emit("select-product", item);
    },
    closeModal(){
      this.$emit("close-modal-products");
    }
  },
};
</script>
