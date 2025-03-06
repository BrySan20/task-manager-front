import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const navigate = useNavigate();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');

        if (!userRole || !allowedRoles.includes(userRole)) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'No tienes permiso para acceder a esta ruta. Inicia sesión nuevamente.',
                confirmButtonText: 'OK'
            }).then(() => {
                localStorage.clear(); // Limpia el almacenamiento local
                setShouldRedirect(true); // Activa la redirección después del mensaje
            });
        }
    }, [allowedRoles]);

    if (shouldRedirect) {
        navigate('/login');
        return null;
    }

    return children;
};

export default ProtectedRoute;
