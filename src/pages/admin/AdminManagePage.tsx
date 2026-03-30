import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Trash2 } from 'lucide-react';

interface DataItem {
  id: string;
  [key: string]: string;
}

interface AdminManagePageProps {
  title: string;
  columns: { key: string; label: string }[];
  data: DataItem[];
}

export function AdminManagePage({ title, columns, data: initialData }: AdminManagePageProps) {
  const [search, setSearch] = useState('');
  const [data] = useState(initialData);

  const filtered = data.filter((item) =>
    Object.values(item).some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout title={title}>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" /> Add New</Button>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">{filtered.length} records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>
                        {col.key === 'status' ? (
                          <Badge variant="outline" className={item[col.key] === 'Active' ? 'bg-accent/15 text-accent border-accent/30' : 'bg-muted text-muted-foreground'}>
                            {item[col.key]}
                          </Badge>
                        ) : (
                          <span className="text-sm">{item[col.key]}</span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
