<template>
  <div>
    <CRow>
      <CCol lg="12">
        <CCard>
          <CCardHeader>
            <slot name="header">
              <CIcon name="cil-grid"/>
            </slot>
          </CCardHeader>
          <CCardBody>

            <!-- FILTROS -->
            <CRow>
              <CCol md="3">
                <CInput label="Consecutivo" v-model="filters.consecutive" />
              </CCol>
              <CCol md="3">
                <CInput type="date" label="Fecha de creación" v-model="filters.date" />
              </CCol>
              <CCol md="3">
                <CInput type="date" label="Fecha inicio" v-model="filters.start_date" @change="validateDates" />
              </CCol>
              <CCol md="3">
                <CInput type="date" label="Fecha fin" v-model="filters.end_date" @change="validateDates" />
              </CCol>
              <CCol md="3">
                <CInput label="Cliente" v-model="filters.client" />
              </CCol>
              <CCol md="3">
                <CInput label="Usuario Creador" v-model="filters.user" />
              </CCol>
              <CCol md="3">
                <CSelect
                  :value.sync="filters.type"
                  :options=types
                  label="Tipo de Venta"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="12" class="d-flex align-items-center">
                <CButton color="primary" @click="getSales" class="mr-2" style="width: auto;">
                  <CIcon name="cil-magnifying-glass" /> Buscar
                </CButton>

                <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-share" /> Limpiar filtros
                </CButton>

                <CButton color="success" @click="downloadExcelSale" class="mr-2" style="width: auto;">
                  <CIcon name="cil-spreadsheet" /> Generar Excel
                </CButton>
              </CCol>
            </CRow>
            <br />

            <TableCustom :items="tableItems" :fields="fields" :loading="loading">

              <template #client="{ item }">
                <td class="text-center">{{ item.client.name || '-' }}</td>
              </template>

              <template #user_creator="{ item }">
                <td class="text-center">{{ item.user.name || '-' }}</td>
              </template>

              <template #type="{ item }">
                <td class="text-center">
                  <CBadge :color="item.type === 'credito' ? 'warning' : 'success'">
                    {{ item.type === 'credito' ? 'Crédito' : 'Contado' }}
                  </CBadge>
                </td>
              </template>

              <template #boleta_factura="{ item }">
                <td class="text-center">
                  <CBadge color="info">{{ item.boleta_factura }}</CBadge>
                </td>
              </template>

              <!-- BUTTON TICKET -->
              <template #buttonTicket="{item}">
                <BaseButton :modo="'file'" @click="downloadReport('sale_pdf', 'ticket', '.pdf', item)" />
              </template>

              <!-- BUTTON VIEW -->
              <template #buttonView="{item}">
                <BaseButton :modo="'ver'" @click="sendViewSale(item)" />
              </template>

              <!-- BUTTON EDIT -->
              <template #buttonEdit="{item}">
                <BaseButton :modo="'editar'" @click="sendEditSale(item)"></BaseButton>
              </template>

              <!-- BUTTON DELETE -->
              <template #buttonDelete="{item}">
                <BaseButton :modo="'eliminar'" @click="deleteSale(item.id, item.consecutive)"></BaseButton>
              </template>

            </TableCustom>

            <!-- Totales -->
            <CRow class="mt-3">
              <CCol md="6" lg="4">
                <CCard class="shadow-sm">
                  <CCardBody class="py-3">
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Subtotal</span>
                      <strong>S/. {{ totalSubtotal.toFixed(2) }}</strong>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Total</span>
                      <strong>S/. {{ totalFinal.toFixed(2) }}</strong>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>

  import Swal from "sweetalert2"
  import {list, report, ticket, destroy, request} from '@/utils/functions.js'

  export default {
    name: 'Sales',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',          label: '#',                 _classes: 'text-center' },
            { key: 'consecutive',    label: 'Nº de Compra',      _classes: 'text-center' },
            { key: 'dateCast',       label: 'Fecha',             _classes: 'text-center' },
            { key: 'client',         label: 'Cliente',           _classes: 'text-center', _style: 'min-width:120px;' },
            { key: 'user_creator',   label: 'Usuario Creador',   _classes: 'text-center', _style: 'min-width:140px;' },
            { key: 'type',           label: 'Modo',              _classes: 'text-center' },
            { key: 'boleta_factura', label: 'Tipo',              _classes: 'text-center' },
            { key: 'subtotal',       label: 'Subtotal (S/.)',    _classes: 'text-center' },
            { key: 'deposit',        label: 'Depositó (S/.)',    _classes: 'text-center' },
            { key: 'total',          label: 'Total (S/.)',       _classes: 'text-center' },

            // Botones de acción
            { key: 'buttonTicket',   label: 'Ticket',   _classes: 'text-center', _style:'min-width:20%;' }, 
            { key: 'buttonView',     label: 'Ver',      _classes: 'text-center', _style:'min-width:20%;' }, 
            { key: 'buttonEdit',     label: 'Editar',   _classes: 'text-center', _style:'min-width:20%;' }, 
            { key: 'buttonDelete',   label: 'Eliminar', _classes: 'text-center', _style:'min-width:20%;' },
          ]
        }
      },
    },
    mounted() {
      this.getSales();
    },
    computed: {
      tableItems () {
        return this.loading ? [] : this.sales
      }
    },
    data () {
      return {
        prefix_list: "sales",
        prefix: "sale",
        sales: [],
        loading: true,
        types: ['ambas', 'contado', 'credito'],
        totalSubtotal: 0,
        totalFinal: 0,
        filters: {
          consecutive : "",
          date        : "",
          type        : "ambas",
          start_date  : "",
          end_date    : "",
          client      : "",
          user        : "",
        },
      }
    },
    watch: {
      sales: {
        immediate: true,
        handler(newSales) {
          this.totalSubtotal = newSales.reduce((sum, sale) => sum + parseFloat(sale.subtotal || 0), 0);
          this.totalFinal = newSales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
        }
      }
    },
    methods: {

      //* Main Functions
        async getSales(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list, this.filters)
            if (resp.status === 200) this.sales = resp.data.data || []
            else this.purchases = []
          }, { loadingKey: "loading" })

        },
        async deleteSale(id, consecutive){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará la venta '${consecutive}'.`,
            icon: "warning",
            confirmButtonText: "Sí, eliminar",
            closeOnConfirm: false,
            showCancelButton: true,
            cancelButtonText: "Cancelar"
          })

          if (!res.value) return

          await this.request(async () => {

            const url = this.$store.state.url
            const resp = await destroy(url + this.prefix + `/${id}`)

            if (resp.status === 200) {
              this.getSales();
              Swal.fire("Alerta", resp.data.message, "success");
            }

          })

        },
        async downloadExcelSale(){

          await this.request(async () => {
            const url = this.$store.state.url
            await report(url+"sales_excel", this.filters, "reporte ventas.xlsx");
          }, { loadingKey: "loading" })

        },
        async downloadReport(method, type, extention, sale) {

          await this.request(async () => {
            const url = this.$store.state.url
            if(type == "excel"){
              await report(url+method, sale, "reporte N°"+sale.consecutive+extention);
            } else {
              await ticket(url+method, sale, "reporte N°"+sale.consecutive+extention);
            }
          }, { loadingKey: "loading" })

        },

      //* Secondary Functions
        request,
        sendEditSale(item) {
          this.$router.push({ 
            name: 'Agregar venta', 
            query: { data: JSON.stringify(item) }
          });
        },
        sendViewSale(item) {
          this.$router.push({ 
            name: 'Detalle venta', 
            query: { data: JSON.stringify(item) }
          });
        },
        validateDates() {
          if (this.filters.start_date && this.filters.end_date) {
            if (this.filters.end_date < this.filters.start_date) {
              Swal.fire("Alerta", "La fecha fin debe ser mayor o igual a la fecha inicio.", "warning");
              this.filters.end_date = '';
            }
          }
        },
        cleanFilters() {
          this.filters = {
            consecutive : "",
            date        : "",
            type        : "ambas",
            start_date  : "",
            end_date    : "",
            client      : "",
            user        : "",
          };
        },

    }
  }

</script>