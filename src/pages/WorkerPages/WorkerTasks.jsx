import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import MainLayout from '../../layouts/MainLayouts';
import { Button, Select, Tag, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import useAxiosInterceptor from '../../interceptors/useAxiosInterceptor';

const WorkerTasks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { group } = location.state || {};
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username'); // Usuario guardado
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const intervalRef = useRef(null);
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

  // Verificar si hay un grupo
  useEffect(() => {
    if (!group) {
      navigate('/workerGroups');
    }
  }, [group, navigate]);

  // Configurar axios con el token de autenticación y cargar tareas
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadTasks();
      
      // Configurar intervalo de actualización automática cada 2.5 segundos
      intervalRef.current = setInterval(() => {
        loadTasksWithoutLoading();
      }, 2500);
      
      // Limpiar intervalo cuando el componente se desmonte
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
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

  // Cargar tareas con indicador de carga
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://task-manager-back-2xgi.onrender.com/api/workerTasks/${group.id}`);
      setTasks(response.data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las tareas. Por favor, intenta de nuevo.',
      });
      setLoading(false);
    }
  };

  // Cargar tareas sin mostrar indicador de carga (para actualización silenciosa)
  const loadTasksWithoutLoading = async () => {
    try {
      const response = await axios.get(`https://task-manager-back-2xgi.onrender.com/api/workerTasks/${group.id}`);
      
      // Comparar si ha habido cambios
      const currentTasksJSON = JSON.stringify(tasks);
      const newTasksJSON = JSON.stringify(response.data);
      
      if (currentTasksJSON !== newTasksJSON) {
        setTasks(response.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error al actualizar tareas automáticamente:', error);
      // No mostrar notificación para evitar interrupciones en caso de errores temporales
    }
  };

  // Actualizar estado de tarea (validando en función del username)
  const handleStatusChange = async (taskId, newStatus, taskAssignedTo) => {
    // Validación extra para prevenir modificaciones no autorizadas
    if (taskAssignedTo !== username) {
      Swal.fire({
        icon: 'error',
        title: 'Acción no permitida',
        text: 'Solo puedes actualizar el estado de tus propias tareas.',
      });
      return;
    }
    
    try {
      const response = await axios.patch(`https://task-manager-back-2xgi.onrender.com/api/workerTasks/${taskId}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Actualizar estado localmente
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: 'El estado de la tarea ha sido actualizado correctamente.',
        timer: 1500,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo actualizar el estado de la tarea.',
      });
    }
  };

  const taskColors = {
    'En progreso': '#1890ff',
    'Hecho': '#52c41a',
    'Pausada': '#faad14',
    'En revisión': '#fa541c',
  };

  const priorityColors = {
    'Alta': '#f5222d',
    'Media': '#fa8c16',
    'Baja': '#52c41a',
  };

  // Renderizar tarea
  const renderTask = (task) => {
    // Aquí se valida con el username almacenado
    const isOwnTask = task.assigned_to === username;

    return (
      <div
        key={task.id}
        className="kanban-task"
        style={{
          borderLeft: `5px solid ${taskColors[task.status]}`,
          padding: '15px',
          marginBottom: '10px',
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          borderRadius: '4px'
        }}
      >
        <h4>{task.nameTask}</h4>
        <p>{task.description}</p>
        <p><strong>Asignado a:</strong> {task.assigned_to}</p>

        <div className="task-priority" style={{ 
          backgroundColor: priorityColors[task.priority],
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          {task.priority}
        </div>

        <Select
          defaultValue={task.status}
          style={{ width: '100%' }}
          disabled={!isOwnTask}
          onChange={(value) => handleStatusChange(task.id, value, task.assigned_to)}
        >
          <Select.Option value="En progreso">En progreso</Select.Option>
          <Select.Option value="Hecho">Hecho</Select.Option>
          <Select.Option value="Pausada">Pausada</Select.Option>
          <Select.Option value="En revisión">En revisión</Select.Option>
        </Select>
        
        {!isOwnTask && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
            Solo puedes actualizar tus propias tareas
          </div>
        )}
      </div>
    );
  };

  if (!group) {
    return null;
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <h1>Tareas para el grupo: {group.groupName}</h1>
        <h1>Hola {username}</h1>
        <h2>Solo puedes modificar el estatus de tus tareas asignadas</h2>
        
        <div style={{ marginBottom: '15px', fontSize: '12px', color: '#666' }}>
          Actualización automática cada 2.5 segundos. Última actualización: {lastUpdated.toLocaleTimeString()}
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          /* Tablero Kanban */
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap' }}>
            {['En progreso', 'Hecho', 'Pausada', 'En revisión'].map((status) => (
              <div key={status} className="kanban-column" style={{ 
                width: '22%', 
                minWidth: '250px',
                marginBottom: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '5px',
                padding: '10px'
              }}>
                <h3
                  className="kanban-column-header"
                  style={{ 
                    backgroundColor: taskColors[status], 
                    color: 'white', 
                    padding: '10px', 
                    textAlign: 'center',
                    borderRadius: '4px'
                  }}
                >
                  {status}
                </h3>
                {tasks
                  .filter(task => task.status === status)
                  .map(task => renderTask(task))
                }
                {tasks.filter(task => task.status === status).length === 0 && (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#999',
                    backgroundColor: 'white',
                    margin: '10px 0',
                    borderRadius: '4px'
                  }}>
                    No hay tareas
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WorkerTasks;