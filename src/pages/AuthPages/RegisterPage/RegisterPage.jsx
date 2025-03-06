import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (location.pathname === '/register' && token) {
      localStorage.clear();
      Swal.fire('Sesión cerrada', '', 'info');
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

  const onFinish = async (values) => {
    setLoading(true);

    if (!validator.isEmail(values.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
      });
      setLoading(false);
      return;
    }

    const passwordValidation = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordValidation.test(values.password)) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.',
      });
      setLoading(false);
      return;
    }

    if (/\s/.test(values.username) || /\s/.test(values.password)) {
      Swal.fire({
        icon: 'error',
        title: 'No se permiten espacios',
        text: 'El nombre de usuario y la contraseña no deben contener espacios.',
      });
      setLoading(false);
      return;
    }

    try {
      await axios.post('https://task-manager-back-2xgi.onrender.com/api/auth/register', {
        email: values.email,
        username: values.username,
        password: values.password,
      });

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Ahora puedes iniciar sesión con tus credenciales.',
        showConfirmButton: false,
        timer: 1500,
      });

      setLoading(false);
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: error.response?.data?.error || 'Hubo un problema al registrar el usuario.',
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
        <h2 className="register-title">Registro</h2>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Por favor, ingresa tu correo' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nombre de usuario"
          name="username"
          rules={[{ required: true, message: 'Por favor, ingresa tu nombre de usuario' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Contraseña"
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
            className="register-button"
            size="large"
          >
            Registrarse
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
