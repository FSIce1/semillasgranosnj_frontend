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
            <td>{{ item.price }}</td>
          </template>

          <!-- BUTTON EDIT -->
          <template #buttonEdit="{index, item}">
            <td>
              <CButton
                :name="item.id"
                size="sm"
                :key="item.id"
                color="facebook"
                @click="editModal(index, item)"
              >
                <CIcon size="sm" name="cil-comment-square"/>
              </CButton>
            </td>
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
          
          <template #empty>
            <td colspan="5" class="text-center">No hay productos seleccionados</td>
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
            { key: 'product', label: 'Insumo' },
            { key: 'price', label: 'Precio' },
            { key: 'cost', label: 'Costo' },
            { key: 'amount', label: 'Cantidad' },
            { key: 'buttonEdit', label: 'Editar', _style:'min-width:20%;' },
            { key: 'buttonDelete', label: 'Eliminar', _style:'min-width:20%;' },
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
        prefix: "formula_details",
        loadingButtonEdit: false,
        loadingProducts: true,
        filters: [],
      }
    },
    methods: {
      deleteDetail(index, id, name) {

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
                  el.$emit('get-total-general');
                  Swal.fire("Alerta", response.data.message, "success");
  
                }

              } else {
                
                el.items.splice(index, 1);
                el.$emit('get-total-general');
                Swal.fire("Alerta", "El detalle fue eliminado correctamente", "success");

              }

            } catch (errors) {

              el.$emit('get-total-general');

              if (errors.length > 0) {
                Swal.fire("Alerta", errors[0], "warning");
              } else {
                Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
              }

            }

          }

        });

      },
      editModal(index, item) {
        item.index = index;
        this.$emit("get-edit-detail", item);
      },
    }
  }

</script>

<style src="spinkit/spinkit.min.css"></style>
