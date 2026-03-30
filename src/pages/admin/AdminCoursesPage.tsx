import { AdminManagePage } from './AdminManagePage';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface CourseRow {
  id: string;
  code: string;
  name: string;
  teacher: string;
  students: string;
  status: string;
}

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Course Name' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'students', label: 'Students' },
  { key: 'status', label: 'Status' },
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const rows = await api.get<Array<{ id: number; code: string; name: string; teacher?: { name: string } }>>('/courses');
      setCourses(rows.map((row) => ({
        id: String(row.id),
        code: row.code,
        name: row.name,
        teacher: row.teacher?.name ?? 'Unassigned',
        students: '-',
        status: 'Active',
      })));
    };

    void load();
  }, []);

  return <AdminManagePage title="Manage Courses" columns={columns} data={courses} />;
}
