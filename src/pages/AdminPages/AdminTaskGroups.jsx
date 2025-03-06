import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Button, Modal, Form, Input, Select, DatePicker, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import useAxiosInterceptor from '../../interceptors/useAxiosInterceptor';
import './taskGroups.css';

const AdminTaskGroups = () => {
    const location = useLocation();
    const { group } = location.state || {};
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [form] = Form.useForm();
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [groupName, setGroupName] = useState('');
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
    }, []);

    // Cargar usuarios excluyendo los de rol "admin" y "master"
    const loadUsers = async () => {
        try {
            const { data } = await axios.get('https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/users');
            setUsers(data);
        } catch (error) {
            notification.error({
                message: 'Error al cargar usuarios',
                description: 'No se pudo cargar la lista de usuarios.',
            });
        }
    };

    const loadGroupAndUsername = async () => {
        const userId = localStorage.getItem('userId');
        try {
            // Obtener nombre del grupo
            const { data } = await axios.get(`https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/groups/${group.id}`);
            setGroupName(data.groupName);

            // Obtener el username del admin
            const { data: usernameData } = await axios.get(`https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/users/${userId}`);

            console.log('Username recibido:', usernameData.username);
            setUsername(usernameData.username);

        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Hubo un error al cargar los datos del grupo o el usuario.',
            });
        }
    };

    useEffect(() => {
        loadUsers();
        loadGroupAndUsername();
    }, []);

    const showModal = (task = null) => {
        if (task) {
            // Convertir la fecha string a objeto dayjs antes de setear los valores
            const taskWithFormattedDate = {
                ...task,
                timeUntilFinish: task.timeUntilFinish ? dayjs(task.timeUntilFinish) : null
            };
            setEditingTask(taskWithFormattedDate);
            form.setFieldsValue(taskWithFormattedDate);
        } else {
            setEditingTask(null);
            form.resetFields();
        }
        setModalVisible(true);
    };

    const handleCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setEditingTask(null);
    };

    // Cargar todas las tareas
    const loadTasks = async () => {
        try {
            const { data } = await axios.get('https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/tasks');
            // Formatear las fechas antes de guardar las tareas en el estado
            const formattedTasks = data.tasks
                .filter(task => task.groupId === group.id)
                .map(task => ({
                    ...task,
                    timeUntilFinish: task.timeUntilFinish ? dayjs(task.timeUntilFinish) : null
                }));
            setTasks(formattedTasks);
        } catch (error) {
            notification.error({
                message: 'Error al cargar tareas',
                description: 'No se pudieron cargar las tareas del grupo.',
            });
        }
    };

    useEffect(() => {
        if (group) {
            loadTasks();
        }
    }, [group]);

    // Función para añadir una nueva tarea
    const handleAddTask = async (values) => {
        try {
            // Formatear la fecha antes de enviar
            const formattedValues = {
                ...values,
                timeUntilFinish: values.timeUntilFinish.format('YYYY-MM-DD'),
            };

            await axios.post('https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/addTask', formattedValues);

            notification.success({
                message: 'Tarea agregada',
                description: 'La tarea se ha agregado exitosamente.',
            });

            loadTasks(); // Recargar las tareas
            handleCancel(); // Cerrar el modal
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'No se pudo agregar la tarea.',
            });
        }
    };

    // Función para editar una tarea
    const handleEditTask = async (values) => {
        try {
            // Formatear la fecha antes de enviar
            const formattedValues = {
                ...values,
                timeUntilFinish: values.timeUntilFinish.format('YYYY-MM-DD'),
            };

            await axios.put(`https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/editTask/${editingTask.id}`, formattedValues);

            notification.success({
                message: 'Tarea actualizada',
                description: 'La tarea se ha actualizado exitosamente.',
            });

            loadTasks(); // Recargar las tareas
            handleCancel(); // Cerrar el modal
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'No se pudo actualizar la tarea.',
            });
        }
    };

    // Función para eliminar una tarea
    const handleDeleteTask = async (taskId) => {
        try {
            await Swal.fire({
                title: '¿Estás seguro?',
                text: "No podrás revertir esta acción",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await axios.delete(`https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/deleteTask/${taskId}`);

                    Swal.fire(
                        'Eliminada',
                        'La tarea ha sido eliminada.',
                        'success'
                    );

                    loadTasks(); // Recargar las tareas
                }
            });
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'No se pudo eliminar la tarea.',
            });
        }
    };

    // Función para actualizar el estado de una tarea
    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const taskToUpdate = tasks.find(t => t.id === taskId);
            if (!taskToUpdate) return;

            const updatedTask = {
                ...taskToUpdate,
                status: newStatus
            };

            await axios.put(`https://task-manager-back-2xgi.onrender.com/api/tasksAdmin/editTask/${taskId}`, updatedTask);

            loadTasks(); // Recargar las tareas
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'No se pudo actualizar el estado de la tarea.',
            });
        }
    };

    // Modificar el renderizado de las tareas para incluir el botón de eliminar
    const renderTask = (task) => (
        <div
            key={task.id}
            className="kanban-task"
            style={{ borderLeft: `5px solid ${taskColors[task.status]}` }}
        >
            <h4>{task.nameTask}</h4>
            <p>{task.description}</p>
            <p><strong>Asignado a:</strong> {task.assigned_to}</p>

            <div className="task-priority" style={{ backgroundColor: priorityColors[task.priority] }}>
                {task.priority}
            </div>

            <Select
                defaultValue={task.status}
                onChange={(newStatus) => handleStatusChange(task.id, newStatus)}
            >
                <Select.Option value="En progreso">En progreso</Select.Option>
                <Select.Option value="Hecho">Hecho</Select.Option>
                <Select.Option value="Pausada">Pausada</Select.Option>
                <Select.Option value="En revisión">En revisión</Select.Option>
            </Select>

            <div className="task-actions">
                <Button
                    type="primary"
                    size="small"
                    onClick={() => showModal(task)}
                    style={{ marginRight: '8px' }}
                >
                    Editar
                </Button>
                <Button
                    type="danger"
                    size="small"
                    onClick={() => handleDeleteTask(task.id)}
                >
                    Eliminar
                </Button>
            </div>
        </div>
    );

    const taskColors = {
        'En progreso': '#1890ff',
        Hecho: '#52c41a',
        Pausada: '#faad14',
        'En revisión': '#fa541c',
    };

    const priorityColors = {
        Alta: '#f5222d',
        Media: '#fa8c16',
        Baja: '#52c41a',
    };

    return (
        <AdminLayout>
            <h1>Asignar tareas a los usuarios</h1>
            {group ? (
                <div>
                    <h2>Tareas del grupo: {groupName}</h2>

                    {/* Tablero Kanban */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        {['En progreso', 'Hecho', 'Pausada', 'En revisión'].map((status) => (
                            <div key={status} className="kanban-column">
                                <h3
                                    className="kanban-column-header"
                                    style={{ backgroundColor: taskColors[status] }}
                                >
                                    {status}
                                </h3>
                                {tasks
                                    .filter(task => task.status === status)
                                    .map(task => renderTask(task))
                                }
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p>No se encontró información del grupo.</p>
            )}

            {/* Botón Flotante para añadir tarea */}
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                size="large"
                className="floating-button"
                style={{zIndex: 1000}}
            />

            {/* Modal para agregar o editar tarea */}
            <Modal
                title={editingTask ? 'Editar Tarea' : 'Agregar Nueva Tarea'}
                visible={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    onFinish={editingTask ? handleEditTask : handleAddTask}
                    layout="vertical"
                    initialValues={{
                        ...editingTask,
                        assigned_by: username
                    }}
                >
                    <Form.Item
                        label="Nombre de tarea"
                        name="nameTask"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre de la tarea' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Descripción"
                        name="description"
                        rules={[{ required: true, message: 'Por favor ingrese la descripción de la tarea' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Prioridad"
                        name="priority"
                        rules={[{ required: true, message: 'Por favor seleccione la prioridad' }]}
                    >
                        <Select>
                            <Select.Option value="Alta">Alta</Select.Option>
                            <Select.Option value="Media">Media</Select.Option>
                            <Select.Option value="Baja">Baja</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Fecha límite"
                        name="timeUntilFinish"
                        rules={[{ required: true, message: 'Por favor seleccione la fecha límite' }]}
                    >
                        <DatePicker />
                    </Form.Item>

                    <Form.Item
                        label="Grupo"
                        name="groupId"
                        rules={[{ required: true, message: 'Por favor seleccione el grupo' }]}
                    >
                        <Select>
                            <Select.Option value={group.id}>{groupName}</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Asignado por"
                        name="assigned_by"
                        rules={[{ required: true, message: 'Por favor ingrese el asignador' }]}
                    >
                        <Select value={username} disabled>
                            <Select.Option value={username}>{username}</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Asignado a"
                        name="assigned_to"
                        rules={[{ required: true, message: 'Por favor seleccione al usuario asignado' }]}
                    >
                        <Select>
                            {users.map(user => (
                                <Select.Option key={user.id} value={user.username}>
                                    {user.username}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Estado"
                        name="status"
                        rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
                    >
                        <Select>
                            <Select.Option value="En progreso">En progreso</Select.Option>
                            <Select.Option value="Hecho">Hecho</Select.Option>
                            <Select.Option value="Pausada">Pausada</Select.Option>
                            <Select.Option value="En revisión">En revisión</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingTask ? 'Guardar Cambios' : 'Agregar Tarea'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </AdminLayout>
    );
};

export default AdminTaskGroups;
