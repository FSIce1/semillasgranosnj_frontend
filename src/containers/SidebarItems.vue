<script>

  import {getRolePermission} from '@/utils/functions.js'

  export default {
    name: 'nav',
    computed: {
      sidebarItems() {
        return [{
          _name: 'CSidebarNav',
          _children: this.getFilteredItems()
        }];
      }
    },
    data() {
      return {
        prefix_role_permission: "role_permission",
        role: [],
      };
    },
    async created() {

      let id = sessionStorage.getItem('id');

      if(!(id!= undefined && id!=null && id!= "")){
        if (this.$route.name !== 'Login') {
          this.$router.push({ name: 'Login' });
        }
      }
      
      const url = this.$store.state.url;
      const role_id = sessionStorage.getItem('role_id');

      this.role = await this.getRolePermission(url + this.prefix_role_permission, role_id);
    
    },
    methods: {
      getFilteredItems() {
        const items = [
          {
            _name: 'CSidebarNavItem',
            name: 'Perfil',
            to: '/inicio',
            icon: 'cil-speedometer',
          },

          //? COMPRAS
          {
            _name: 'CSidebarNavTitle',
            name: 'Compras',
            _children: ['Compras']
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Listado Compras',
            to: '/compras/listado',
            icon: 'cil-list',
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Agregar Compra',
            to: '/compras/agregar-compra',
            icon: 'cil-list',
          },

          //? VENTAS
          {
            _name: 'CSidebarNavTitle',
            name: 'Ventas',
            _children: ['Ventas']
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Listado Ventas',
            to: '/ventas/listado',
            icon: 'cil-list',
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Agregar Venta',
            to: '/ventas/agregar-venta',
            icon: 'cil-list',
          },

          //? OTROS
          {
            _name: 'CSidebarNavTitle',
            name: 'Otros',
            _children: ['Otros']
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Caja',
            to: '/caja/listado',
            icon: 'cil-list',
          },
          {
            _name: 'CSidebarNavTitle',
            _children: ['Productos']
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Productos',
            to: '/productos/listado',
            icon: 'cil-list',
          },
          {
            _name: 'CSidebarNavDropdown',
            name: 'Maestras',
            route: '/others',
            icon: 'cil-list',
            items: [
              {
                name: 'Unidades de Medida',
                to: '/maestras/unidades',
                icon: 'cil-list',
              },
              {
                name: 'Almacenes',
                to: '/maestras/almacenes',
                icon: 'cil-list',
              },
            ]
          },
          {
            _name: 'CSidebarNavDropdown',
            name: 'Administrable',
            route: '/others',
            icon: 'cil-list',
            items: [
              {
                name: 'Listado Usuarios',
                to: '/administrable/usuarios',
                icon: 'cil-list',
              },
              {
                name: 'Cuenta Clientes',
                to: '/administrable/clientes',
                icon: 'cil-list',
              },
              {
                name: 'Cuenta Proveedores',
                to: '/administrable/proveedores',
                icon: 'cil-list',
              },
              {
                name: 'Roles y Perfiles',
                to: '/administrable/roles',
                icon: 'cil-list',
              },
            ]
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Estadísticas',
            to: '/statistics',
            icon: 'cil-chart-pie'
          }
        ];
        
        let role = sessionStorage.getItem('slug_role');
                
        return this.filterItems(items, role);

      },
      filterItems(items, role) {

        return items
          .map(item => {

            if (item.items) {

              const filteredSubItems = this.filterItems(item.items, role);
              
              if (filteredSubItems.length > 0) {
                return { ...item, items: filteredSubItems };
              }

              return null;

            }

            let permissions = this.role.permissions;

            if(permissions != undefined && permissions!= null && permissions!=""){

              const permissionsArray = permissions.slice();
              
              if (permissionsArray.includes(item.name) || item.name == "Perfil") {
                return item;
              } else if(item.name == "Ventas" && (permissionsArray.includes("Listado Ventas") || permissionsArray.includes("Agregar Venta"))){
                return item
              } else if(item.name == "Otros"){
                return item
              }else if(item.name == "Compras" && (permissionsArray.includes("Listado Compras") || permissionsArray.includes("Agregar Compra"))){
                return item
              }

            }

            return null;

          })
          .filter(Boolean);

      },
      async getRolePermission(){
        
        try {
          
          const url = this.$store.state.url;
          const role_id = sessionStorage.getItem('role_id');
          const response = await getRolePermission(url + this.prefix_role_permission, role_id);

          if (response.status === 200) {
            
            return response.data.data;

          }

          return [];

        } catch (errors) {

          return [];

        }

      },
    }
  }

</script>
