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
        <CDataTable
          :items="items"
          :fields="fields"
          :hover="hover"
          :no-items-view="{
            noItems: 'No hay registros',
            noResults: 'No se encontraron resultados'
          }"
          :striped="striped"
          :border="border"
          :small="small"
          :fixed="fixed"
          :dark="dark"
        >
          <template #index="{ index }">
            <td>{{ index + 1 }}</td>
          </template>

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
            <td>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="youtube"
                @click="deleteDetail(index, item.id, item.product.name)"
              >
                <CIcon size="sm" name="cil-ban"/>
              </CButton>
            </td>
          </template>

        </CDataTable>
      </template>

    </CCardBody>
  </CCard>
</template>

<script>

  import Swal from "sweetalert2"
  import {destroy} from '../../../assets/js/methods/functions.js'

  export default {
    name: 'TableListProductsSelected',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index', label: '#' },
            { key: 'product', label: 'Producto' },
            { key: 'name_unit_measure', label: 'Unidad de Medida' },
            { key: 'amount', label: 'Cantidad' },
            // { key: 'amount_kg', label: 'KG/UND' },
            // { key: 'amount_saco', label: 'SACO/UND' },
            { key: 'price', label: 'Precio' },
            { key: 'total', label: 'Total' },
            { key: 'buttonDelete', label: 'Acciones' },
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
        prefix: "sale_details",
        loadingButtonEdit: false,
        loadingProducts: true,
        filters: [],
      }
    },
    methods: {
      async deleteDetail(index, id, name) {

        let el = this;

        if(id == null || id == "" ||id == undefined){
          id = null;
        }

        Swal.fire({
          title: "¿Está seguro?",
          html: `Se eliminará el detalle '${name}'.`,
          icon: "warning",
          confirmButtonText: "Sí, eliminar",
          closeOnConfirm: false,
          showCancelButton: true,
          cancelButtonText: "Cancelar"
        })
        .then(async function(result) {

          if(result.value) {

            try {

              if (id !== null) {

                const url = el.$store.state.url;
                const response = await destroy(url+el.prefix+`/${id}`);

                if (response.status === 200) {

                  el.items.splice(index, 1);
                  el.$emit('get-total-general', index);
                  Swal.fire("Alerta", response.data.message, "success");

                }

              } else {

                el.items.splice(index, 1);
                Swal.fire("Alerta", "El detalle fue eliminado correctamente", "success");

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
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
