
<template>
  <div>

    <CModal title="Listado de Insumos" size="lg" :show="isVisibleModalHistory">

      <slot name="header">
        <CIcon name="cil-grid"/> Historial de {{name}}
      </slot>

      <template>
        <CCardBody>
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
            :loading="loading"
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

  </div>
</template>

<script>

import {list} from '../../assets/js/methods/functions.js'

export default {
  name: 'ModalStockHistory',
  props: {
    isVisibleModalHistory: {
      type: Boolean,
      required: true,
    },
    product: {
      type: Object,
      required: false,
      default: null
    },
    fields: {
      type: Array,
      default() {
        return [
            { key: "index",       label: "#" },
            { key: "date",        label: "Día" },
            { key: 'stock',       label: 'Stock' },
            { key: "type",        label: "Tipo" },
            { key: "description", label: "Descripción" },
        ];
      },
    },
  },
  data() {
    return {
      prefix: "history_stock",
      history: [],
      name: "",
      filters: {
        product_id: 0,
      },
      loading: false,
    };
  },
  async mounted() {
    await this.getProductStockHistory();
  },
  computed: {
    tableItems () {
      return this.loading ? [] : this.history
    }
  },
  watch: {
    async isVisibleModalHistory(newValue) {
      if (newValue) {
        this.name = this.product.name;
        await this.getProductStockHistory();
      }
    },
  },
  methods: {
    async getProductStockHistory(){

      this.loading = true;

      try {

        this.filters.product_id = this.product.id;

        const url = this.$store.state.url;
        const response = await list(url + this.prefix, this.filters);

        if (response.status === 200) {
          this.history = response.data.data;
        }

      } catch (errors) {

        this.history = [];

      } finally {

        this.loading = false;

      }

    },
    closeModal(){
      this.$emit("close-modal-stock-history");
    },
  },
};
</script>