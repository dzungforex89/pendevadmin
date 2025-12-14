import AdminBackend from '../admin-backend';
import AuthGuard from '../../components/AuthGuard';

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminBackend />
    </AuthGuard>
  );
}

