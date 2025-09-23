<template>
  <CCard>
    <CCardBody>

      <TableCustom :items="tableItems" :fields="fields" :loading="loading">

        <template #lot="{ item }">
          <td class="text-center">{{ item.lot.name }}</td>
        </template>

        <template #unit_measure="{ item }">
          <td class="text-center">{{ item.unit_measure.name }}</td>
        </template>

        <!-- BUTTON DELETE -->
        <template #buttonDelete="{index, item}">
          <BaseButton :disabled="disabled" :modo="'eliminar'" @click="deleteDetail(index, item.id, item.product.name)"></BaseButton>
        </template>

      </TableCustom>

    </CCardBody>
  </CCard>
</template>

<script>

  import Swal from "sweetalert2"
  import {destroy, request} from '@/utils/functions.js'

  export default {
    name: 'TableListProductsSelected',
    props: {
      loading: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false },
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',         label: '#',                 _classes: 'text-center' },
            { key: 'lot',           label: 'Lote',              _classes: 'text-center' },
            { key: 'quantity_in',   label: 'Cantidad',          _classes: 'text-center' },
            { key: 'unit_measure',  label: 'Unidad de Medida',  _classes: 'text-center' },
            { key: 'buttonDelete',  label: 'Acciones',          _classes: 'text-center' },
          ]
        }
      },
    },
    computed: {
      tableItems () {
        return this.loading ? [] : (this.items || [])
      }
    },
    data () {
      return {
        prefix: "sale_details",
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
