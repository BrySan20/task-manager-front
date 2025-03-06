import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

const useAxiosInterceptor = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    // Si el backend dice que el token ha expirado, borra la sesión
                    if (error.response.data.expired) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Sesión Expirada',
                            text: 'Tu sesión ha caducado. Por favor, inicia sesión nuevamente.',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            localStorage.clear();
                            navigate('/login');
                        });
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [navigate]);

    return null; // No renderiza nada, solo gestiona las respuestas de Axios
};

export default useAxiosInterceptor;
