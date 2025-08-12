<template>
  <CDropdown 
    placement="bottom-end"
    :caret="false"
    in-nav
    class="c-header-nav-item d-md-down-none mx-2"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        <CIcon name="cil-bell"/>
        <CBadge shape="pill" color="danger">{{itemsCount}}</CBadge>
      </CHeaderNavLink>
    </template>
    <CDropdownHeader 
      tag="div" 
      class="text-center bg-light"
    >
      <strong>Tienes {{itemsCount}} notificaciones</strong>
    </CDropdownHeader>
    <CDropdownItem v-for="(notification, index) in notifications" :key="index">
      <CIcon name="cil-warning" class="text-warning" />
        <b> {{ notification }}</b>
    </CDropdownItem>
  </CDropdown>
</template>
<script>
  
  import Swal from "sweetalert2"
  import {get} from '../assets/js/methods/functions.js'

  export default {
    name: 'TheHeaderDropdownNotif',
    data () {
      return {
        prefix: "notifications",
        notifications: [],
        itemsCount: 0
      }
    },
    async mounted() {
      await this.getNotifications();
    },
    methods: {
      async getNotifications(){
  
        try {
          
          const url = this.$store.state.url;
          
          const response = await get(url + this.prefix);

          if (response.status === 200) {
            
            this.notifications = response.data.data; 
            this.itemsCount = this.notifications.length;

          }

        } catch (errors) {

          if (errors.length > 0) {
            Swal.fire("Alerta", errors[0], "warning");
          } else {
            Swal.fire("Alerta", "Ocurrió un error desconocido", "error");
          }

        }

      },
    },
  }

</script>

<style scoped>
  .c-icon {
    margin-right: 0.3rem;
  }
</style>