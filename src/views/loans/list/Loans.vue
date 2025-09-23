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
                <CInput type="date" label="Fecha de creación" v-model="filters.start_date" />
              </CCol>
              <CCol md="3">
                <CInput label="Cliente" v-model="filters.client" />
              </CCol>
              <CCol md="3">
                <CInput label="Usuario Creador" v-model="filters.user" />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="12" class="d-flex align-items-center">
                <CButton color="primary" @click="getLoans" class="mr-2" style="width: auto;">
                  <CIcon name="cil-magnifying-glass" /> Buscar
                </CButton>

                <CButton color="info" @click="cleanFilters" class="mr-2" style="width: auto;">
                  <CIcon name="cil-share" /> Limpiar filtros
                </CButton>

                <CButton color="success" @click="downloadExcelLoan" class="mr-2" style="width: auto;">
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

              <template #status="{ item }">
                <td class="text-center">
                  <CBadge :color="item.status === 'activo' ? 'success' : 'danger'">
                    {{ item.status }}
                  </CBadge>
                </td>
              </template>

              <template #warehouse="{ item }">
                <td class="text-center">{{ item.warehouse.name || '-' }}</td>
              </template>

              <!-- BUTTON TICKET -->
              <template #buttonTicket="{item}">
                <BaseButton :modo="'file'" @click="downloadReport('loan_pdf', 'ticket', '.pdf', item)" />
              </template>

              <!-- BUTTON VIEW -->
              <template #buttonView="{item}">
                <BaseButton :modo="'ver'" @click.stop.prevent="sendViewLoan(item)" />
              </template>

              <!-- BUTTON EDIT -->
              <template #buttonEdit="{item}">
                <BaseButton :isVisible="item.status == 'activo'" :modo="'editar'" @click="sendEditLoan(item)"></BaseButton>
              </template>

              <!-- BUTTON DELETE -->
              <template #buttonDelete="{item}">
                <BaseButton :modo="'eliminar'" @click="deleteLoan(item.id, item.consecutive)"></BaseButton>
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
  import {list, report, ticket, destroy, request} from '@/utils/functions.js'

  export default {
    name: 'Loans',
    props: {
      items: Array,
      fields: {
        type: Array,
        default () {
          return [
            { key: 'index',                   label: '#',                         _classes: 'text-center' },
            { key: 'consecutive',             label: 'Nº de Compra',              _classes: 'text-center' },
            { key: 'start_date_cast',         label: 'Fecha',                     _classes: 'text-center' },
            { key: 'client',                  label: 'Cliente',                   _classes: 'text-center', _style: 'min-width:120px;' },
            { key: 'user_creator',            label: 'Usuario Creador',           _classes: 'text-center', _style: 'min-width:140px;' },
            { key: 'warehouse',               label: 'Almacén',                   _classes: 'text-center' },
            { key: 'expected_end_date_cast',  label: 'Fecha devolución esperada', _classes: 'text-center' },
            { key: 'actual_end_date_cast',    label: 'Fecha devolución real',     _classes: 'text-center' },
            { key: 'status',                  label: 'Estado',                    _classes: 'text-center' },
            
            // Botones de acción
            { key: 'buttonTicket',  label: 'Ticket',    _classes: 'text-center',  _style:'min-width:20%;' }, 
            { key: 'buttonView',    label: 'Ver',       _classes: 'text-center',  _style:'min-width:20%;' }, 
            { key: 'buttonEdit',    label: 'Editar',    _classes: 'text-center',  _style:'min-width:20%;' }, 
            { key: 'buttonDelete',  label: 'Eliminar',  _classes: 'text-center',  _style:'min-width:20%;' },
          ]
        }
      },
    },
    mounted() {
      this.getLoans();
    },
    computed: {
      tableItems () {
        return this.loading ? [] : this.loans
      }
    },
    data () {
      return {
        prefix_list: "loans",
        prefix: "loan",
        loans: [],
        loading: true,
        filters: {
          consecutive : "",
          start_date  : "",
          client      : "",
          user        : "",
        },
      }
    },
    methods: {

      //* Main Functions
        async getLoans(){

          await this.request(async () => {
            const url = this.$store.state.url
            const resp = await list(url + this.prefix_list, this.filters)
            if (resp.status === 200) this.loans = resp.data.data || []
            else this.purchases = []
          }, { loadingKey: "loading" })

        },
        async deleteLoan(id, consecutive){

          const res = await Swal.fire({
            title: "¿Está seguro?",
            html: `Se eliminará el préstamo '${consecutive}'.`,
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
              this.getLoans();
              Swal.fire("Alerta", resp.data.message, "success");
            }

          })

        },
        async downloadExcelLoan(){

          await this.request(async () => {
            const url = this.$store.state.url
            await report(url+"loans_excel", this.filters, "reporte préstamos.xlsx");
          }, { loadingKey: "loading" })

        },
        async downloadReport(method, type, extention, loan) {

          await this.request(async () => {
            const url = this.$store.state.url
            if(type == "excel"){
              await report(url+method, loan, "reporte N°"+loan.consecutive+extention);
            } else {
              await ticket(url+method, loan, "reporte N°"+loan.consecutive+extention);
            }
          }, { loadingKey: "loading" })

        },

      //* Secondary Functions
        request,
        sendEditLoan(item) {
          this.$router.push({ 
            name: 'Agregar préstamo', 
            query: { data: JSON.stringify(item) }
          });
        },
        sendViewLoan(item) {
          this.$router.push({ 
            name: 'Detalle préstamo', 
            query: { id: String(item.id) }
          });
        },
        cleanFilters() {
          this.filters = {
            consecutive : "",
            start_date  : "",
            client      : "",
            user        : "",
          };
        },

    }
  }

</script>