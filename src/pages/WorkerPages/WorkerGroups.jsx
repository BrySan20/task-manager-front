import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayouts';
import { Table, Button, Space, Tag, notification } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import useAxiosInterceptor from '../../interceptors/useAxiosInterceptor';

const WorkerGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  useAxiosInterceptor();

  useEffect(() => {
          const role = localStorage.getItem('userRole');
          if (!role || role !== 'worker') {
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
      loadGroups();
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

  // Cargar los grupos del usuario
  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://task-manager-back-2xgi.onrender.com/api/workerGroups/userGroups');
      setGroups(response.data.groups);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los grupos:', error);
      notification.error({
        message: 'Error',
        description: 'No se pudieron cargar los grupos. Por favor, intente nuevamente.',
      });
      setLoading(false);
    }
  };

  // Navegar a la vista de tareas del grupo
  const goToGroupTasks = (groupId) => {
    const selectedGroup = groups.find(group => group.id === groupId);
    navigate('/workertasks', { state: { group: selectedGroup } });
  };

  // Definir las columnas de la tabla
  const columns = [
    {
      title: 'Grupo',
      dataIndex: 'groupName',
      key: 'groupName',
      sorter: (a, b) => a.groupName.localeCompare(b.groupName),
    },
    {
      title: 'Creado/Modificado por',
      dataIndex: 'createdByUsername',
      key: 'createdByUsername',
      render: (text, record) => (
        <span>{record.createdByUsername || 'Desconocido'}</span>
      ),
    },
    {
      title: 'Usuarios involucrados',
      dataIndex: 'usersInfo',
      key: 'usersInfo',
      render: (users) => (
        <>
          {users && users.map(user => (
            <Tag color="blue" key={user.id}>
              {user.username}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Acciones',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<RightOutlined />} 
            onClick={() => goToGroupTasks(record.id)}
          >
            Ver Tareas
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <h1 style={{ marginBottom: '24px' }}>Tus grupos de tareas</h1>
        
        <Table
          columns={columns}
          dataSource={groups}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
          style={{ backgroundColor: 'white', borderRadius: '8px' }}
        />
      </div>
    </MainLayout>
  );
};

export default WorkerGroups;