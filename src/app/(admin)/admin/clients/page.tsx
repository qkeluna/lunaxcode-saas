'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Mail,
  Calendar,
  Edit,
  Trash2,
  Eye,
  FolderKanban,
  DollarSign,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAlertDialog } from '@/hooks/use-alert-dialog';

interface Client {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalSpent: number;
  };
}

interface ClientDetails {
  client: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  projects: Array<{
    id: number;
    name: string;
    status: string;
    paymentStatus: string;
    price: number;
    createdAt: string;
  }>;
}

export default function AdminClientsPage() {
  const { showError, showSuccess, showConfirm, AlertDialog } = useAlertDialog();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/clients');
      const data = await response.json();

      if (response.ok) {
        setClients(data.clients);
      } else {
        console.error('Failed to fetch clients:', data.error);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (clientId: string) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedClient(data);
        setIsDetailsDialogOpen(true);
      } else {
        console.error('Failed to fetch client details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

  const handleEditClick = (client: Client) => {
    setEditFormData({
      name: client.name,
      email: client.email,
    });
    setSelectedClient({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        role: client.role,
        createdAt: client.createdAt,
      },
      projects: [],
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/admin/clients/${selectedClient.client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        fetchClients();
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      showError('Failed to update client');
    }
  };

  const handleDeleteClient = (clientId: string) => {
    showConfirm(
      'Are you sure you want to delete this client? This action cannot be undone.',
      async () => {
        try {
          const response = await fetch(`/api/admin/clients/${clientId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            fetchClients();
          } else {
            const data = await response.json();
            showError(data.error || 'Failed to delete client');
          }
        } catch (error) {
          console.error('Error deleting client:', error);
          showError('Failed to delete client');
        }
      },
      'Delete Client'
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Client Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all clients and view their project history
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Total Clients</dt>
                  <dd className="text-lg font-semibold text-foreground">{clients.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Active Clients</dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {clients.filter(c => c.stats.activeProjects > 0).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderKanban className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Total Projects</dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {clients.reduce((sum, c) => sum + c.stats.totalProjects, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-muted-foreground truncate">Total Revenue</dt>
                  <dd className="text-lg font-semibold text-foreground">
                    {formatCurrency(clients.reduce((sum, c) => sum + c.stats.totalSpent, 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card border p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-card border shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Loading clients...
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <a href={`mailto:${client.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {client.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.stats.totalProjects}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-blue-600 dark:text-blue-400">{client.stats.activeProjects}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-green-600 dark:text-green-400">{client.stats.completedProjects}</span>
                  </TableCell>
                  <TableCell>{formatCurrency(client.stats.totalSpent)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(client.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(client.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              View client information and project history
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-base text-foreground">{selectedClient.client.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base text-foreground">{selectedClient.client.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge>{selectedClient.client.role}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined</p>
                  <p className="text-base text-foreground">{formatDate(selectedClient.client.createdAt)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Projects</h4>
                {selectedClient.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(project.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs">
                            {project.status}
                          </Badge>
                          <span className="text-sm font-medium">{formatCurrency(project.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog />
    </div>
  );
}
