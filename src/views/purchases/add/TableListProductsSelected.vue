<template>
  <CCard>
    <CCardBody>

      <template v-if="!loadingProducts">
          <div class="sk-chase" style="margin-top: 10px; text-align: center">
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
            <div class="sk-chase-dot"></div>
          </div>
      </template>
      <template v-else>
        <TableCustom :items="items" :fields="fields" :loading="false">

          <template #product="{ item }">
            <td>{{ item.product.name }}</td>
          </template>

          <template #price="{ item }">
            <td>S/. {{ item.price }}</td>
          </template>
          
          <template #total="{ item }">
            <td>S/. {{ item.total }}</td>
          </template>

          <!-- BUTTON DELETE -->
          <template #buttonDelete="{index, item}">
            <BaseButton :modo="'eliminar'" @click="deleteDetail(index, item.id, item.product.name)"></BaseButton>
          </template>

        </TableCustom>
      </template>

    </CCardBody>
  </CCard>
</template>

<script>

  import Swal from "sweetalert2"
  import {destroy, request} from '@/utils/functions.js'

  export default {
    name: 'TableListProductsSelected',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',             label: '#',                _classes: 'text-center' },
            { key: 'product',           label: 'Producto',         _classes: 'text-center' },
            { key: 'name_unit_measure', label: 'Unidad de Medida', _classes: 'text-center' },
            { key: 'amount',            label: 'Cantidad',         _classes: 'text-center' },
            { key: 'price',             label: 'Precio',           _classes: 'text-center' },
            { key: 'total',             label: 'Total',            _classes: 'text-center' },
            { key: 'buttonDelete',      label: 'Acciones',         _classes: 'text-center' },
          ]
        }
      },
      hover: Boolean,
      striped: Boolean,
      border: Boolean,
      small: Boolean,
      fixed: Boolean,
      dark: Boolean
    },
    data () {
      return {
        prefix: "purchase_details",
        loadingButtonEdit: false,
        loadingProducts: true,
        filters: [],
      }
    },
    methods: {

      //* Main Functions
        async deleteDetail(index, id, name) {

          if(id == null || id == "" ||id == undefined){
            id = null;
          }

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará el detalle '${name}'.`,
            icon: "warning",
            confirmButtonText: "Sí, eliminar",
            closeOnConfirm: false,
            showCancelButton: true,
            cancelButtonText: "Cancelar"
          })

          if (!res.value) return

          await this.request(async () => {

            if (id !== null) {

              const url = this.$store.state.url
              const resp = await destroy(url + this.prefix + `/${id}`)

              if (resp.status === 200) {
                this.items.splice(index, 1);
                this.$emit('get-total-general', index);
                Swal.fire("Alerta", resp.data.message, "success");
              }

            } else {

              this.items.splice(index, 1);
              Swal.fire("Alerta", "El detalle fue eliminado correctamente", "success");

            }

          })

        },

      //* Secondary Functions
        request,

    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
