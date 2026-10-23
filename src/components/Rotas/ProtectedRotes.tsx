import { useEffect, useState, type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import AuthRequests from '../../fetch/AuthRequests';
const ProtectedRoute = ({
    element,
    roles,
}: {
    element: ReactElement;
    roles?: string[];
}) => {
    const [valid, setValid] = useState(() => AuthRequests.checkTokenExpiry());
    useEffect(() => {
        const check = () => setValid(AuthRequests.checkTokenExpiry());
        window.addEventListener('auth-changed', check);
        window.addEventListener('storage', check);
        const timer = window.setInterval(check, 30000);
        return () => {
            clearInterval(timer);
            window.removeEventListener('auth-changed', check);
            window.removeEventListener('storage', check);
        };
    }, []);
    if (!valid) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(localStorage.getItem('role') ?? ''))
        return <Navigate to="/lista/consulta" replace />;
    return element;
};
export default ProtectedRoute;
