<template>
  <div>
    <CChartBar
      :datasets="getDataSales"
      :labels="months"
    />
  </div>
</template>

<script>
  
  import { CChartBar } from '@coreui/vue-chartjs'

  export default {
    name: 'CChartSalesPerMonth',
    props: {
      sales_per_month: Array,
    },
    components: { CChartBar },
    computed: {
      getDataSales () {
        return [
          {
            label: 'Ventas',
            backgroundColor: '#f87979',
            data: this.sales_per_month
          }
        ]
      },
      months() {
        return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      }
    },
  }

</script>
