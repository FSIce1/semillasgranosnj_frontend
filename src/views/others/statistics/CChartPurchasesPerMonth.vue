<template>
  <div>
    <CChartBar
      :datasets="getDataPurchases"
      :labels="months"
    />
  </div>
</template>

<script>
  
  import { CChartBar } from '@coreui/vue-chartjs'

  export default {
    name: 'CChartPurchasesPerMonth',
    props: {
      purchases_per_month: Array,
    },
    components: { CChartBar },
    computed: {
      getDataPurchases () {
        return [
          {
            label: 'Compras',
            backgroundColor: '#f87979',
            data: this.purchases_per_month
          }
        ]
      },
      months() {
        return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      }
    },
  }

</script>
