import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importamos SweetAlert2
import './login.css';
import loginImage from '../../../assets/images/list.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (location.pathname === '/login' && token) {
      localStorage.clear();
      Swal.fire('Sesión cerrada', '', 'info'); // Mensaje de sesión cerrada
    }

    const tokenAfterCheck = localStorage.getItem('token');
    if (tokenAfterCheck && userRole) {
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onFinish = async (values) => {
    const { username, password } = values;

    if (!validateEmail(username)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://task-manager-back-2xgi.onrender.com/api/auth/login', {
        email: username,
        password: password,
      });

      console.log('Full response data:', response.data);

      const { token, userId, role, username: user } = response.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', role);
      localStorage.setItem('username', user);

      Swal.fire({
        icon: 'success',
        title: 'Login exitoso',
        showConfirmButton: false,
        timer: 1500,
      });

      const redirectPath = getRedirectPath(role);
      navigate(redirectPath);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Credenciales incorrectas',
        text: 'Por favor, verifica tu correo y contraseña.',
      });
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
          rules={[{ required: true, message: 'Por favor, ingresa tu correo' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Por favor, ingresa tu contraseña' }]}
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
