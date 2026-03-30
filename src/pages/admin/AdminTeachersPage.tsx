import { AdminManagePage } from './AdminManagePage';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TeacherRow {
  id: string;
  name: string;
  department: string;
  email: string;
  courses: string;
  status: string;
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'email', label: 'Email' },
  { key: 'courses', label: 'Courses' },
  { key: 'status', label: 'Status' },
];

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const rows = await api.get<Array<{ id: number; name: string; department?: string; email: string }>>('/users/teachers');
      setTeachers(rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        department: row.department ?? 'N/A',
        email: row.email,
        courses: '-',
        status: 'Active',
      })));
    };

    void load();
  }, []);

  return <AdminManagePage title="Manage Teachers" columns={columns} data={teachers} />;
}
