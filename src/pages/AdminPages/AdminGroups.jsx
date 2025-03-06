import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Table, Button, Modal, Form, Input, Select, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import useAxiosInterceptor from '../../interceptors/useAxiosInterceptor';

const { Option } = Select;

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('userRole');
  useAxiosInterceptor();

  const fetchData = async () => {
    try {
      const [groupsResponse, usersResponse] = await Promise.all([
        axios.get('https://task-manager-back-2xgi.onrender.com/api/groups'),
        axios.get('https://task-manager-back-2xgi.onrender.com/api/groups/users')
      ]);
      setGroups(groupsResponse.data.groups);
      setUsers(usersResponse.data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
      notification.error({
        message: 'Error al obtener datos',
        description: error.response?.data?.error || 'Hubo un problema conectando con el servidor'
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const showModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    form.resetFields();
  };

  const handleSaveGroup = async (values) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        notification.error({ message: 'No se encontró ID de usuario, por favor inicie sesión nuevamente' });
        return;
      }

      const groupData = {
        ...values,
        createdBy: userId,
      };

      if (editingGroup) {
        await axios.put(`https://task-manager-back-2xgi.onrender.com/api/groups/edit/${editingGroup.id}`, groupData);
      } else {
        await axios.post('https://task-manager-back-2xgi.onrender.com/api/groups/create', groupData);
      }
      fetchData(); // Actualiza los datos después de guardar el grupo
      notification.success({
        message: editingGroup ? 'Grupo actualizado con éxito' : 'Grupo creado con éxito'
      });
      handleCancel();
    } catch (error) {
      console.error('Error saving group:', error);
      notification.error({
        message: 'Error al guardar el grupo',
        description: error.response?.data?.error || 'Hubo un problema conectando con el servidor'
      });
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    form.setFieldsValue({
      groupName: group.groupName,
      users: group.users || [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`https://task-manager-back-2xgi.onrender.com/api/groups/delete/${groupId}`);
      fetchData(); // Actualiza los datos después de eliminar el grupo
      notification.success({ message: 'Grupo eliminado con éxito' });
    } catch (error) {
      console.error('Error deleting group:', error);
      notification.error({
        message: 'Error al eliminar el grupo',
        description: error.response?.data?.error || 'Hubo un problema conectando con el servidor'
      });
    }
  };

  const columns = [
    {
      title: 'Nombre del Grupo',
      dataIndex: 'groupName',
    },
    {
      title: 'Creador / Último editor',
      dataIndex: 'createdByUsername',
    },
    {
      title: 'Usuarios involucrados',
      dataIndex: 'usersInfo',
      render: (usersInfo) => (
        <span>
          {usersInfo?.map(user => user.username).join(', ')}
        </span>
      ),
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <div>
          {record.createdByUsername === username ? (
            <>
              <Button onClick={() => handleEditGroup(record)} style={{ marginRight: '10px' }}>Editar</Button>
              <Button onClick={() => handleDeleteGroup(record.id)} danger style={{ marginRight: '10px' }}>Eliminar</Button>
            </>
          ) : (
            <span>Solo el creador puede modificar</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1>Grupos</h1>
      <h2>Hola {username}, aquí puedes editar o eliminar los grupos</h2>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showModal}
        size="large"
        style={{
          position: 'fixed',
          bottom: 70,
          right: 70,
          borderRadius: '50%',
          padding: '15px',
          fontSize: '20px',
          zIndex: 1000
        }}
      />

      <Table
        columns={columns}
        dataSource={groups}
        rowKey="id"
      />

      <Modal
        title={editingGroup ? 'Editar Grupo' : 'Crear Grupo'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          initialValues={{}}
          onFinish={handleSaveGroup}
        >
          <Form.Item
            label="Nombre del Grupo"
            name="groupName"
            rules={[{ required: true, message: 'Por favor ingresa el nombre del grupo' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Usuarios"
            name="users"
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar usuarios"
              style={{ width: '100%' }}
            >
              {users
                .filter(user => !['admin', 'master'].includes(user.role)) // Filtrar usuarios con rol admin y master
                .map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.username}
                  </Option>
                ))}
            </Select>
          </Form.Item>


          <Form.Item
            wrapperCol={{ span: 24, offset: 16 }}
          >
            <Button type="primary" htmlType="submit">
              {editingGroup ? 'Actualizar Grupo' : 'Crear Grupo'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AdminGroups;
