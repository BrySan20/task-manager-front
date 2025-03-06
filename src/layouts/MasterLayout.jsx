import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardOutlined, FileTextOutlined, SettingOutlined, AppstoreAddOutlined, LogoutOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import axios from 'axios';
import './mainlayout.css';

const { Sider, Content, Header } = Layout;

const MasterLayout = ({ children }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Eliminar token y userId
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        
        // Limpiar encabezados de axios
        delete axios.defaults.headers.common['Authorization'];
        
        Swal.fire({
          title: '¡Sesión cerrada!',
          text: 'Has cerrado sesión correctamente',
          icon: 'success',
          timer: 1500
        }).then(() => {
          navigate('/login');
        });
      }
    });
  };

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: <Link to="/masterdashboard">Dashboard</Link>,
    },
    {
      key: '2',
      icon: <FileTextOutlined />,
      label: <Link to="/mastergroups">Crear grupo</Link>,
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: <Link to="/masterusers">Usuarios</Link>,
    },
    {
      key: '4',
      icon: <SettingOutlined />,
      label: <Link to="/mastertaskasign">Asignar tareas</Link>,
    },
  ];

  return (
    <Layout className="master-layout">
        <Sider width={180} className="admin-sider">
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                items={menuItems}
                className="admin-menu"
            />
        </Sider>
        <Layout className="admin-content-layout">
            <Header className="admin-header">
                <div className="admin-header-title">To Do</div>
                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    className="admin-logout-button"
                >
                    Cerrar Sesión
                </Button>
            </Header>
            <Content className="admin-content">
                {children}
            </Content>
        </Layout>
    </Layout>
);
};

export default MasterLayout;
