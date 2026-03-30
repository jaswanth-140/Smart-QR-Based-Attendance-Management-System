import { AdminManagePage } from './AdminManagePage';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface StudentRow {
  id: string;
  name: string;
  studentId: string;
  department: string;
  email: string;
  status: string;
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'studentId', label: 'Student ID' },
  { key: 'department', label: 'Department' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const rows = await api.get<Array<{ id: number; name: string; studentId?: string; department?: string; email: string }>>('/users/students');
      setStudents(rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        studentId: row.studentId ?? `STD-${row.id}`,
        department: row.department ?? 'N/A',
        email: row.email,
        status: 'Active',
      })));
    };

    void load();
  }, []);

  return <AdminManagePage title="Manage Students" columns={columns} data={students} />;
}
