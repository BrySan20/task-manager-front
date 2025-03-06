import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Table, Button, Modal, Form, Input, Select, DatePicker, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import useAxiosInterceptor from '../../interceptors/useAxiosInterceptor';
import './dashboard.css';

const AdminDashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();//sdadfasdfas
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
    } else if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión Expirada',
        text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        timer: 1500,
      }).then(() => {
        navigate('/login'); // Redirige al login
      });
    }
  }, []);

  // Obtener tareas al cargar el componente
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    console.log('User ID en Dashboard:', userId);
    console.log('Token en Dashboard:', token);

    if (!userId || !token) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión Expirada',
        text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      }).then(() => {
        navigate('/login');
      });
      return; // Detiene la ejecución si no hay usuario o token
    }

    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Usar la nueva ruta para obtener tareas específicas del usuario
        const response = await axios.get('https://task-manager-back-2xgi.onrender.com/api/tasks/user');
        setTasks(response.data.tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        notification.error({
          message: 'Error al obtener tareas',
          description: error.response?.data?.error || 'Hubo un problema conectando con el servidor'
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchTasks();
    }
  }, []);

  const showModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    form.resetFields();
  };

  const handleSaveTask = async (values) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        notification.error({ message: 'No se encontró ID de usuario, por favor inicie sesión nuevamente' });
        return;
      }

      // Agregar el userId al objeto de valores
      const taskData = {
        ...values,
        userId,
        timeUntilFinish: values.timeUntilFinish ? values.timeUntilFinish.toISOString() : null,
      };

      if (editingTask) {
        // Editar tarea existente
        const response = await axios.put(`https://task-manager-back-2xgi.onrender.com/api/tasks/edit/${editingTask.id}`, taskData);
        setTasks(tasks.map(task => task.id === editingTask.id ? response.data.updatedTask : task));
        notification.success({ message: 'Tarea actualizada con éxito' });
      } else {
        // Crear nueva tarea
        const response = await axios.post('https://task-manager-back-2xgi.onrender.com/api/tasks/create', taskData);
        setTasks([...tasks, response.data.task]);
        notification.success({ message: 'Tarea creada con éxito' });
      }
      handleCancel();
    } catch (error) {
      console.error('Error saving task:', error);
      notification.error({
        message: 'Error al guardar la tarea',
        description: error.response?.data?.error || 'Hubo un problema conectando con el servidor'
      });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      timeUntilFinish: task.timeUntilFinish ? moment(task.timeUntilFinish) : null,
    });

    form.setFieldsValue({
      ...task,
      timeUntilFinish: task.timeUntilFinish ? moment(task.timeUntilFinish) : null,
    });

    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`https://task-manager-back-2xgi.onrender.com/api/tasks/delete/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      notification.success({ message: 'Tarea eliminada con éxito' });
    } catch (error) {
      console.error('Error deleting task:', error);
      notification.error({
        message: 'Error al eliminar la tarea',
        description: error.response?.data?.error || 'Hubo un problema conectando con el servidor'
      });
    }
  };

  const handleMarkCompleted = async (taskId) => {
    try {
      const response = await axios.patch(`https://task-manager-back-2xgi.onrender.com/api/tasks/complete/${taskId}`);
      setTasks(tasks.map(task => task.id === taskId ? response.data.task : task));
      notification.success({ message: 'Tarea marcada como completada' });
    } catch (error) {
      console.error('Error completing task:', error);
      notification.error({
        message: 'Error al marcar la tarea como completada',
        description: error.response?.data?.error || 'Hubo un problema conectando con el servidor'
      });
    }
  };

  const columns = [
    {
      title: 'Nombre de tarea',
      dataIndex: 'nameTask',
    },
    {
      title: 'Estatus',
      dataIndex: 'status',
      render: (text) => (
        <span style={{ color: text === 'Done' ? 'green' : 'red' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <div>
          <Button onClick={() => handleEditTask(record)} style={{ marginRight: '10px' }}>Editar</Button>
          <Button onClick={() => handleDeleteTask(record.id)} danger style={{ marginRight: '10px' }}>Eliminar</Button>
          {record.status !== 'Done' && (
            <Button onClick={() => handleMarkCompleted(record.id)} type="primary"
              style={{ backgroundColor: 'green', borderColor: 'green' }}>Marcar como completada</Button>
          )}
        </div>

      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="dashboard-content">
        <h1>Bienvenido, {username}</h1>
        <h2>Tareas personales Admin</h2>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showModal}
          size='large'
          style={{
            position: 'fixed',
            bottom: 70,
            right: 70,
            borderRadius: '50%',
            padding: '15px',
            fontSize: '20px',
            zIndex: 1000
          }}
        >
        </Button>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
        />
      </div>

      <Modal
        title={editingTask ? 'Editar Tarea' : 'Crear Tarea'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          initialValues={{ status: 'In Progress' }}
          onFinish={handleSaveTask}
        >
          <Form.Item
            label="Nombre de la Tarea"
            name="nameTask"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de la tarea' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="description"
            rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Categoría"
            name="category"
            rules={[{ required: true, message: 'Por favor selecciona una categoría' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}

          >
            <Select>
              <Option value="Work">Trabajo</Option>
              <Option value="Personal">Personal</Option>
              <Option value="Study">Estudio</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Fecha Límite"
            name="timeUntilFinish"
            rules={[{ required: true, message: 'Por favor selecciona una fecha' }]}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <DatePicker showTime />
          </Form.Item>

          <Form.Item
            label="Estado"
            name="status"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
          >
            <Select>
              <Option value="In Progress">En progreso</Option>
              <Option value="Done">Hecho</Option>
              <Option value="Paused">Pausada</Option>
              <Option value="Revision">Revisión</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label=""
            colon={false}
            wrapperCol={{ span: 24, offset: 16 }}
          >
            <Button type="primary" htmlType="submit">
              {editingTask ? 'Actualizar Tarea' : 'Crear Tarea'}
            </Button>
          </Form.Item>

        </Form>
      </Modal>
    </AdminLayout>
  );
}

export default AdminDashboardPage;