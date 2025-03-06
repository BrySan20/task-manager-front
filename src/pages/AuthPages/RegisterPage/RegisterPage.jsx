import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import validator from 'validator';
import { Link } from 'react-router-dom';
import './register.css';
import registerImage from '../../../assets/images/list.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Esta función se ejecuta cuando el componente se monta
  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Si el usuario accede directamente a /login y ya está autenticado
    if (location.pathname === '/register' && token) {
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

    if (!validator.isEmail(values.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please provide a valid email address.',
      });
      setLoading(false);
      return;
    }

    const passwordValidation = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordValidation.test(values.password)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 8 characters long, with at least one uppercase letter and one number.',
      });
      setLoading(false);
      return;
    }

    if (/\s/.test(values.username) || /\s/.test(values.password)) {
      Swal.fire({
        icon: 'error',
        title: 'No Spaces Allowed',
        text: 'Username and password should not contain spaces.',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://task-manager-back-2xgi.onrender.com/api/auth/register', {
        email: values.email,
        username: values.username,
        password: values.password,
      });

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        //text: response.data.message,
      });
      setLoading(false);
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Error al registrar el usuario',
      });
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-image-container">
        <img src={registerImage} alt="Register" className="register-image" />
      </div>
      <Form
        onFinish={onFinish}
        className="register-form"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <h2 className="register-title">Register</h2>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Username"
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
            className="register-button"
            size="large"
          >
            Register
          </Button>
        </Form.Item>
        <div className="login-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;
