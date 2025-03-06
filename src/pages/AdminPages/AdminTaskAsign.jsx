import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Table, Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import useAxiosInterceptor from '../../interceptors/useAxiosInterceptor';

const AdminTaskAsign = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  useAxiosInterceptor();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role || role !== 'admin') {
      navigate('/login');
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permiso para acceder a esta página.',
        timer: 1500,
      });
    }
  }, [navigate]);

  // Configurar axios con el token de autenticación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Sesión Expirada',
        text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        timer: 1500,
      }).then(() => {
        navigate('/login');
      });
    }
  }, [navigate]);

  // Obtener todos los datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener los datos de grupos y usuarios en paralelo
        const [groupsResponse, usersResponse] = await Promise.all([
          axios.get('https://task-manager-back-2xgi.onrender.com/api/groups'),
          axios.get('https://task-manager-back-2xgi.onrender.com/api/groups/users')
        ]);
        
        // Asegurarse de que los datos estén completos antes de actualizar el estado
        if (groupsResponse.data && groupsResponse.data.groups) {
          setGroups(groupsResponse.data.groups);
        }
        
        if (usersResponse.data && usersResponse.data.users) {
          setUsers(usersResponse.data.users);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        notification.error({
          message: 'Error al obtener datos',
          description: error.response?.data?.error || 'Hubo un problema conectando con el servidor'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Nombre del Grupo',
      dataIndex: 'groupName',
      render: (groupName) => <strong>{groupName}</strong>,
    },
    {
      title: 'Creador/ Último editor',
      dataIndex: 'createdByUsername',
    },
    {
      title: 'Usuarios involucrados',
      dataIndex: 'usersInfo',
      render: (usersInfo) => (
        <span>
          {usersInfo?.map((user) => user.username).join(', ')}
        </span>
      ),
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <div>
          {record.createdByUsername === username ? (
            <Button onClick={() => handleSelectGroup(record)} type="primary">
              Asignar Tareas
            </Button>
          ) : (
            <span style={{ color: '#999' }}>Solo el creador puede asignar tareas</span>
          )}
        </div>
      ),
    },
  ];

  // Manejar la selección de un grupo
  const handleSelectGroup = (group) => {
    // Redirigir a la página de asignar tareas, pasando la información del grupo
    navigate(`/taskgroups/${group.id}`, { state: { group } });
  };

  return (
    <AdminLayout>
      <h1>Asignar tareas</h1>
      <h2>Hola {username}, puedes asignar tareas en los grupos que creaste</h2>
      <Table
        columns={columns}
        dataSource={groups}
        rowKey="id"
        loading={loading}
      />
    </AdminLayout>
  );
};

export default AdminTaskAsign;