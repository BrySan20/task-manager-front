import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import { Table, Button, Modal, Input, Form, Select, notification, Tag, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import useAxiosInterceptor from '../../interceptors/useAxiosInterceptor';

const MasterUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
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

  // Obtener la lista de usuarios al cargar
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para obtener usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://task-manager-back-2xgi.onrender.com/api/users/getusers');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      notification.error({ message: 'Error al obtener usuarios' });
    } finally {
      setLoading(false);
    }
  };

  // Función para agregar o editar usuario
  const handleSubmit = async (values) => {
    try {
      const { email, username, password, role } = values;

      if (isEditing) {
        // Editar usuario
        await axios.put(`https://task-manager-back-2xgi.onrender.com/api/users/edit/${editingUser.id}`, { email, username, password, role });
        notification.success({ message: 'Usuario actualizado con éxito' });
      } else {
        // Crear nuevo usuario
        await axios.post('https://task-manager-back-2xgi.onrender.com/api/users/create', { email, username, password, role });
        notification.success({ message: 'Usuario creado con éxito' });
      }

      // Cerrar modal y actualizar la lista
      setVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      notification.error({ message: 'Error al guardar usuario' });
    }
  };

  // Función para abrir el modal en modo editar
  const handleEdit = (user) => {
    setIsEditing(true);
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      username: user.username,
      password: user.password,
      role: user.role,
    });
    setVisible(true);
  };

  // Función para eliminar usuario
  const handleDelete = (userId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este usuario será eliminado de manera permanente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://task-manager-back-2xgi.onrender.com/api/users/delete/${userId}`);
          notification.success({ message: 'Usuario eliminado con éxito' });
          fetchUsers();
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          notification.error({ message: 'Error al eliminar usuario' });
        }
      }
    });
  };

  // Función para mostrar el modal para crear usuario
  const showAddModal = () => {
    setIsEditing(false);
    setEditingUser(null);
    form.resetFields();
    setVisible(true);
  };

  // Definir las columnas de la tabla
  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nombre de Usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        // Definir colores para cada rol
        const roleColors = {
          admin: 'blue',
          master: 'purple',
          worker: 'green'
        };
    
        return <Tag color={roleColors[role] || 'default'}>{role}</Tag>;
      },
    },
    
    {
      title: 'Acciones',
      key: 'actions',
      render: (text, user) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(user)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(user.id)} danger />
        </Space>
      ),
    },
  ];

  return (
    <MasterLayout>
      <h1>Gestión de usuarios</h1>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showAddModal}
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
      {/*<Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} style={{ marginBottom: 16 }}>
        Agregar Usuario
      </Button>*/}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* Modal para agregar o editar usuario */}
      <Modal
        title={isEditing ? 'Editar Usuario' : 'Agregar Usuario'}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Por favor ingresa el email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Nombre de Usuario"
            name="username"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de usuario' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Por favor ingresa la contraseña' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Rol"
            name="role"
            rules={[{ required: true, message: 'Por favor selecciona un rol' }]}
          >
            <Select>
              <Select.Option value="admin">Administrador</Select.Option>
              <Select.Option value="worker">Trabajador</Select.Option>
              <Select.Option value="master">Master</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {isEditing ? 'Actualizar Usuario' : 'Agregar Usuario'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MasterLayout>
  );
};

export default MasterUsers;
