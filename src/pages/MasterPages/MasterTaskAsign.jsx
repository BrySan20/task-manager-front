import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import { Table, Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import useAxiosInterceptor from '../../interceptors/useAxiosInterceptor';

const MasterTaskAsign = () => {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  useAxiosInterceptor();

  useEffect(() => {
      const role = localStorage.getItem('userRole');
      if (!role || role !== 'master') {
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
  }, []);

  // Obtener los grupos con usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/groups');
        setGroups(response.data.groups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        notification.error({
          message: 'Error al obtener los grupos',
          description: error.response?.data?.error || 'Hubo un problema conectando con el servidor',
        });
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
        <Button onClick={() => handleSelectGroup(record)} type="primary">
          Asignar Tareas
        </Button>
      ),
    },
  ];

  // Manejar la selección de un grupo
  const handleSelectGroup = (group) => {
    // Redirigir a la página de asignar tareas, pasando la información del grupo
    navigate(`/mastertaskgroups/${group.id}`, { state: { group } });
  };

  return (
    <MasterLayout>
      <h1>Asignar tareas</h1>

      <Table
        columns={columns}
        dataSource={groups}
        rowKey="id"
      />
    </MasterLayout>
  );
};

export default MasterTaskAsign;
