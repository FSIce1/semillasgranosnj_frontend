<template>
  <CCard>
    <CCardHeader>
      Préstamo <strong># {{ loan.consecutive }}</strong>
      <div class="float-right">
        <a 
          href="#" 
          class="btn btn-sm btn-youtube ml-1" 
          @click="downloadReport('loan_pdf', 'ticket', '.pdf')"
        >
          <CIcon name="cil-spreadsheet" class="mr-1"/> Imprimir ticket
        </a>
      </div>
    </CCardHeader>

    <CCardBody>
      <!-- Datos generales -->
      <CRow class="mb-4">
        <CCol sm="4"><b>Cliente:</b> {{ loan.client ? loan.client.name : 'Sin Cliente' }}</CCol>
        <CCol sm="4"><b>Almacén:</b> {{ loan.warehouse ? loan.warehouse.name : 'No encontrado' }}</CCol>
        <CCol sm="4"><b>Estado:</b> {{ castStatus(loan.status) }}</CCol>
      </CRow>
      <CRow class="mb-4">
        <CCol sm="4"><b>Fecha:</b> {{ loan.start_date }}</CCol>
        <CCol sm="4"><b>Fecha devolución esperada:</b> {{ loan.expected_end_date }}</CCol>
        <CCol sm="4"><b>Fecha devolución real:</b> {{ loan.actual_end_date }}</CCol>
      </CRow>

      <!-- NAV TABS -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'detalles' }" href="#" @click.prevent="activeTab = 'detalles'">
            Detalles
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'devoluciones' }" href="#" @click.prevent="switchToReturnsTab()">
            Devoluciones
          </a>
        </li>
      </ul>

      <!-- TAB: DETALLES -->
      <div v-show="activeTab === 'detalles'">
        <div class="table-responsive-sm">
          <table class="table table-striped">
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th class="text-center">Descripción</th>
                <th class="text-center">Cantidad</th>
                <th class="text-center">Unidad de Medida</th>
                <th class="text-center">Lote</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in loan.details" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="text-center">{{ item.description }}</td>
                <td class="text-center">{{ item.quantity_in ?? 0 }}</td>
                <td class="text-center">{{ item.unit_measure?.name ?? '-' }}</td>
                <td class="text-center">{{ item.lot?.name ?? '-' }}</td>
              </tr>
              <tr v-if="!loan.details || loan.details.length === 0">
                <td colspan="5" class="text-center text-muted">Sin detalles.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB: DEVOLUCIONES -->
      <div v-show="activeTab === 'devoluciones'">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0">Resumen de devoluciones por ítem</h6>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <CButton v-if="loan.status != 'cerrado'" type="button" size="sm" color="primary" @click="saveReturnTotal(loan)">
            <CIcon size="sm" name="cil-credit-card" /> Devolver Todo
          </CButton>
        </div>

        <div class="table-responsive-sm">
          <table class="table table-striped">
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th class="text-center">Producto</th>
                <th class="text-center">U. Medida</th>
                <th class="text-center">Prestado</th>
                <th class="text-center">Pendiente para devolver</th>
                <th class="text-center" style="width: 140px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in loan.details" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="text-center">{{ item?.description ?? '-' }}</td>
                <td class="text-center">{{ item?.unit_measure?.name ?? '-' }}</td>
                <td class="text-center">{{ formatNumber(item?.quantity_in) }}</td>
                <td class="text-center">{{ formatNumber(item?.pending) }}</td>
                <td class="text-center">
                  <CButton type="button" size="sm" color="primary" :disabled="item.pending <= 0" @click="openReturnModal(item)">
                    <CIcon size="sm" name="cil-credit-card" /> Devolver
                  </CButton>
                </td>
              </tr>
              <tr v-if="!loan.details || loan.details.length === 0">
                <td colspan="6" class="text-center text-muted">Sin datos de devoluciones.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <div v-if="loading" class="text-center mt-3">
        <CSpinner color="primary" /> Generando archivo...
      </div>

      <CModal title="Registrar Devolución" :show="isReturnModalVisible" size="lg">

        <CForm novalidate>
          <CCardBody>
            <CRow>
              <CCol md="6">
                <label class="form-label mb-1">Producto</label>
                <CInput :value="selectedItem?.description ?? '-'" disabled />
              </CCol>
              <CCol md="6">
                <label class="form-label mb-1">U. Medida</label>
                <CInput :value="selectedItem?.unit_measure?.name ?? '-'" disabled />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6">
                <label class="form-label mb-1">Cantidad Prestada</label>
                <CInput :value="formatNumber(selectedItem?.quantity_in)" disabled />
              </CCol>
              <CCol md="6">
                <label class="form-label mb-1">Pendiente para devolver</label>
                <CInput :value="formatNumber(selectedItem?.pending)" disabled />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="6">
                <label class="form-label mb-1">Cantidad a devolver</label>
                <CInput
                  style="margin-bottom: 0px;"
                  v-model="itemForm.quantity_out"
                  @keydown="preventInvalidDecimal($event)"
                  required
                  was-validated
                />
                <small v-if="!isReturnValid && itemForm.quantity_out" class="text-danger">
                  La cantidad debe ser &gt; 0 y ≤ {{ formatNumber(selectedItem?.pending) }}.
                </small>
              </CCol>
              <CCol md="6">
                <label class="form-label mb-1">Fecha</label>
                <CInput type="date" v-model="itemForm.date" disabled />
              </CCol>
            </CRow>
            <CRow>
              <CCol md="12">
                <label class="form-label mb-1 mt-2">Descripción</label>
                <CTextarea v-model="itemForm.description" rows="2" placeholder="Opcional..." />
              </CCol>
            </CRow>
          </CCardBody>
        </CForm>

        <template #footer>
          <CButton color="secondary" @click="closeReturnModal">Cancelar</CButton>
          <CButton color="primary" :disabled="loadingReturn || !isReturnValid" @click="saveReturn">
            <CIcon name="cil-save" /> Guardar
          </CButton>
        </template>

        <template #header>
          <CButtonClose @click="closeReturnModal" class="text-black"/>
        </template>

      </CModal>

    </CCardBody>
  </CCard>
</template>

<script>

import { save, show, report, ticket, request } from '@/utils/functions.js'
import { preventInvalidDecimal } from '@/utils/validators.js'
import Swal from 'sweetalert2'

export default {
  name: 'Loan',
  data() {
    return {
      loading: false,
      loadingTotals: false,
      activeTab: 'detalles',
      prefix: 'loan',
      loan: {
        id: '',
        consecutive: '',
        client: '',
        warehouse: '',
        quantity_in: '',
        start_date: '',
        expected_end_date: '',
        actual_end_date: '',
        description: '',
        status: '',
        details: [],
      },
      itemsWithTotals: [],

      // Modal devolución
      isReturnModalVisible: false,
      selectedItem: null,
      loadingReturn: false,
      itemForm: {
        id: null,
        loan_id: '',
        quantity_in: '',
        quantity_out: '',
        pending: '',
        date: new Date().toISOString().slice(0,10),
        description: ''
      }
    }
  },
  async mounted() {
    await this.getLoan()
  },
  computed: {
    isReturnValid() {
      const qty = Number(this.itemForm.quantity_out)
      return qty > 0 && qty <= this.itemForm.pending
    }
  },
  methods: {

    //* Main Functions
      async getLoan() {

        const id = this.$route.query.id

        try {

          const url = this.$store.state.url
          const resp = await show(url + this.prefix + `/${id}`)

          if (resp.status === 200) {

            const item = resp?.data?.data || {}

            this.loan.id                = item.id
            this.loan.consecutive       = item.consecutive
            this.loan.client            = item.client
            this.loan.warehouse         = item.warehouse
            this.loan.start_date        = item.start_date_cast
            this.loan.expected_end_date = item.expected_end_date_cast
            this.loan.actual_end_date   = item.actual_end_date_cast
            this.loan.description       = item.description
            this.loan.status            = item.status
            this.loan.details           = item.details || []

          }

        } catch (e) {
          // ya maneja Swal arriba
        } finally {
          this.loadingModal = false
        }

      },
      async switchToReturnsTab() {
        this.activeTab = 'devoluciones'
      },
      async downloadReport(method, type, extention) {
        await this.request(async () => {
          const url = this.$store.state.url
          if (type === 'excel') {
            await report(url + method, this.loan, 'reporte N°' + this.loan.consecutive + extention)
          } else {
            await ticket(url + method, this.loan, 'reporte N°' + this.loan.consecutive + extention)
          }
        }, { loadingKey: 'loading' })
      },
      openReturnModal(item) {

        this.selectedItem = item
        this.itemForm = {
          id: item.id,
          loan_id: item.loan.id,
          quantity_in: item?.quantity_in ?? 0,
          quantity_out: '',
          pending: item.pending,
          date: new Date().toISOString().slice(0,10),
          description: ''
        }
        this.isReturnModalVisible = true
      },
      closeReturnModal() {
        this.isReturnModalVisible = false
      },
      async saveReturn() {

        if (!this.isReturnValid) return

        await this.request(async () => {

          const url = this.$store.state.url
          const data = this.getSetData(this.itemForm);

          const resp = await save(url + "loan_return", data)

          if (resp.status === 200) {

            let response = resp.data.data;

            this.loan.status          = response.status;
            this.loan.details         = response.details;
            this.loan.actual_end_date = response.actual_end_date ?? "";

            Swal.fire("Alerta", resp.data.message, "success");
            this.closeReturnModal();

          }

        }, { loadingKey: "loadingReturn" })

      },
      async saveReturnTotal(loan) {

        const res = await Swal.fire({
          title: "¿Está seguro?",
          html: `Se devolverán todos los items del préstamo #'${loan.consecutive}'.`,
          icon: "warning",
          confirmButtonText: "Sí, devolver todo",
          showCancelButton: true,
          cancelButtonText: "Cancelar"
        })

        if (!res.value) return

        await this.request(async () => {

          const url = this.$store.state.url
          const data = this.getSetDataReturnTotal(this.loan.id);

          const resp = await save(url + "loan_return_total", data)

          if (resp.status === 200) {

            let response = resp.data.data;

            this.loan.status          = response.status;
            this.loan.details         = response.details;
            this.loan.actual_end_date = response.actual_end_date ?? "";

            Swal.fire("Alerta", resp.data.message, "success");

          }

        }, { loadingKey: "loadingReturn" })

      },

    //* Secondary Functions
      request,
      preventInvalidDecimal,
      getSetData(data){

        let formData = new FormData();

        formData.append('id', data.id);
        formData.append('quantity_out', data.quantity_out);
        formData.append('pending', data.pending);
        formData.append('description', data.description);

        return formData;

      },
      getSetDataReturnTotal(data){

        let formData = new FormData();

        formData.append('id', data);
        formData.append('quantity_out', data.quantity_out);
        formData.append('pending', data.pending);
        formData.append('description', data.description);

        return formData;

      },
      castStatus(status) {
        switch (status) {
          case "activo":
            return "En devolución"
          case "cerrado":
            return "Cerrado"
          case "eliminado":
            return "Eliminado"
          default:
            return status
        }
      },
      formatNumber(n) { return Number(n ?? 0).toFixed(2) },

  }
}
</script>