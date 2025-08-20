<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        <div class="c-avatar">
          <img
            src="img/logo.png"
            class="c-avatar-img"
          />
        </div>
      </CHeaderNavLink>
    </template>
    
    <CDropdownHeader
      tag="div"
      class="text-center"
      color="light"
    >
      <strong>{{user.name}}</strong>
    </CDropdownHeader>

    <CDropdownItem @click="home()">
      <CIcon name="cil-user" /> <a>Perfil</a>
    </CDropdownItem>
    
    <CDropdownItem @click="logout()">
      <CIcon name="cil-lock-locked" /> <a>Cerrar Sesión</a>
    </CDropdownItem>

  </CDropdown>
</template>

<script>

  import {show} from '../assets/js/methods/functions.js'

  export default {
    name: 'TheHeaderDropdownAccnt',
    data () {
      return { 
        prefix: "logout",
        prefix_user: "get_user",
        itemsCount: 42,
        user: {
          id: '',
          name: ''
        }
      }
    },
    mounted() {
      this.getUser();
    },
    methods: {
      async home(){
        if (this.$route.name !== 'Inicio') {
          this.$router.push({ name: 'Inicio' })
        }
      },
      async logout(){
                        
        const url = this.$store.state.url;
        const response = await show(url + this.prefix);
                            
        if (response.status === 200) {
                      
          let data = response?.data;

          if(data.flag){

            sessionStorage.clear();

            this.$router.push({ 
              name: 'Login', 
            });

          }

        }

      },
      async getUser(){

        this.user.id = sessionStorage.getItem('id');
        this.user.name = sessionStorage.getItem('name') || 'Invitado';

        // const url = this.$store.state.url;
        // const response = await getUser(url + this.prefix_user);

        // if (response.status === 200) {
                      
        //   let data = response?.data;

        //   if(data.flag){
            
        //     console.log(data);
            
        //   }

        // }

      },
    }
  }
</script>

<style scoped>
  .c-icon {
    margin-right: 0.3rem;
  }
</style>