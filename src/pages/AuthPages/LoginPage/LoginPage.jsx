import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './login.css';
import loginImage from '../../../assets/images/list.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Esta función se ejecuta cuando el componente se monta
  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    // Si el usuario accede directamente a /login y ya está autenticado
    if (location.pathname === '/login' && token) {
      // Limpiar localStorage si el usuario regresó manualmente a /login
      localStorage.clear();
      message.info('Sesión cerrada');
    }
    
    // Verificar si hay un token válido después de la limpieza
    const tokenAfterCheck = localStorage.getItem('token');
    if (tokenAfterCheck && userRole) {
      // Redireccionar al dashboard correspondiente
      const redirectPath = getRedirectPath(userRole);
      navigate(redirectPath);
    }
  }, [navigate, location.pathname]);

  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admindashboard';
      case 'master':
        return '/masterdashboard';
      case 'worker':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
  
    try {
      const response = await axios.post('https://task-manager-back-2xgi.onrender.com/api/auth/login', {
        email: values.username,
        password: values.password,
      });
  
      console.log('Full response data:', response.data);
  
      const { token, userId, role, username } = response.data.token;
  
      // Store auth data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', role);
      localStorage.setItem('username', username);
  
      console.log('User ID:', userId);
      console.log('Token:', token);
      console.log('Role:', role);
      console.log('Username:', username);
  
      message.success('Login exitoso');
      
      // Redirect based on role
      const redirectPath = getRedirectPath(role);
      navigate(redirectPath);
    } catch (error) {
      message.error('Credenciales incorrectas');
    }
  
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-image-container">
        <img src={loginImage} alt="Login" className="login-image" />
      </div>
      <Form
        onFinish={onFinish}
        className="login-form"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <h2 className="login-title">Login</h2>
        <Form.Item
          label="Email"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="login-button"
            size="large"
          >
            Log in
          </Button>
        </Form.Item>

        <div className="register-link">
          No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginPage;