
<template>
  <div>

    <CModal title="Listado de Insumos" size="lg" :show="isVisibleModalHistory && !!product">

      <slot name="header">
        <CIcon name="cil-grid"/> Historial de {{name}}
      </slot>

      <template>
        <CCardBody>
          <TableCustom :items="tableItems" :fields="fields" :loading="loading" :items-per-page="5"></TableCustom>
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

import {list, request} from '@/utils/functions.js'

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
            { key: "index",       label: "#",           _classes: 'text-center' },
            { key: "date",        label: "Día",         _classes: 'text-center' },
            { key: 'stock',       label: 'Stock',       _classes: 'text-center' },
            { key: "type",        label: "Tipo",        _classes: 'text-center' },
            { key: "description", label: "Descripción", _classes: 'text-center' },
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
    request,
    async getProductStockHistory(){

      if (!this.product || !this.product.id) return

      await this.request(async () => {

        const url = this.$store.state.url
        const resp = await list(url + this.prefix, { product_id: this.product.id })
        if (resp.status === 200) this.history = resp.data.data || []
        else this.history = []

      }, { loadingKey: "loading" })

    },
    closeModal(){
      this.$emit("close-modal-stock-history");
    },
  },
};
</script>