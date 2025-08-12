<script>

  import {getRolePermission} from '../assets/js/methods/functions.js'

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
            to: '/compras/add-compra',
            icon: 'cil-list',
          },
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
            to: '/ventas/add-venta',
            icon: 'cil-list',
          },
          {
            _name: 'CSidebarNavTitle',
            name: 'Producción',
            _children: ['Producción']
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Listado producciones',
            to: '/produccion/listado',
            icon: 'cil-list',
          },
          {
            _name: 'CSidebarNavItem',
            name: 'Preparadas del Cliente',
            to: '/preparadas/listado',
            icon: 'cil-list',
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
            name: 'Formulas',
            route: '/formulas',
            icon: 'cil-list',
            items: [
              {
                _name: 'ListFormulas',
                name: 'Listado Fórmulas',
                to: '/formulas/listado',
                icon: 'cil-list',
              },
              {
                name: 'Agregar Fórmula',
                to: '/formulas/add-formula',
                icon: 'cil-list',
              },
            ]
          },
          {
            _name: 'CSidebarNavDropdown',
            name: 'Maestras',
            route: '/maestras',
            icon: 'cil-list',
            items: [
              {
                name: 'Listado Presentaciones',
                to: '/maestras/presentaciones',
                icon: 'cil-list',
              },
              {
                name: 'Listado Procesos',
                to: '/maestras/procesos',
                icon: 'cil-list',
              },
              {
                name: 'Listado Turnos',
                to: '/maestras/turnos',
                icon: 'cil-list',
              },
              {
                name: 'Listado Máquinas',
                to: '/maestras/maquinas',
                icon: 'cil-list',
              },
              {
                name: 'Listado Unidades de Medida',
                to: '/maestras/unidades',
                icon: 'cil-list',
              }
            ]
          },
          {
            _name: 'CSidebarNavDropdown',
            name: 'Administrable',
            route: '/administrable',
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
              } else if(item.name == "Compras" && (permissionsArray.includes("Listado Compras") || permissionsArray.includes("Agregar Compra"))){
                return item
              } else if(item.name == "Producción" && permissionsArray.includes("Listado producciones")){
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
