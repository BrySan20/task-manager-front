import React, { useState, useEffect } from 'react';
import { Card, Button, message } from 'antd';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import './landing.css';
import task from '../../../assets/images/task.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Esta función se ejecuta cuando el componente se monta
  useEffect(() => {
    // Verificar si el usuario ya está autenticado
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Si el usuario accede directamente a /login y ya está autenticado
    if (location.pathname === '/' && token) {
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

  return (
    <div className="landing-container">
      <p className="intro-text">¡Empiece a gestionar sus tareas de forma eficiente!</p>
      <Card
        title={<span className="card-title">Bienvenido a Task Manager</span>}
        bordered={false}
        className="card-container"
      >
        <img
          alt="Task Management"
          src={task}
          className="card-image"
        />
        <div className="button-container">
          <Button className="login-button" size="large">
            <Link to="/login">Login</Link>
          </Button>
          <Button className="register-button" size="large">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LandingPage;
