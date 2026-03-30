import { AdminManagePage } from './AdminManagePage';

const classrooms = [
  { id: '1', name: 'Room 101', building: 'Main Hall', capacity: '60', equipment: 'Projector, Whiteboard', status: 'Active' },
  { id: '2', name: 'Room 201', building: 'Science Block', capacity: '40', equipment: 'Projector, Lab Setup', status: 'Active' },
  { id: '3', name: 'Lab 2', building: 'CS Building', capacity: '30', equipment: 'Computers, Projector', status: 'Active' },
  { id: '4', name: 'Room 305', building: 'Arts Building', capacity: '80', equipment: 'Projector', status: 'Maintenance' },
];

const columns = [
  { key: 'name', label: 'Room' },
  { key: 'building', label: 'Building' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'status', label: 'Status' },
];

export default function AdminClassroomsPage() {
  return <AdminManagePage title="Manage Classrooms" columns={columns} data={classrooms} />;
}
