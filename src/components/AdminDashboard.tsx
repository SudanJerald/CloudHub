import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  CheckCircle2, 
  XCircle,
  Mail,
  GraduationCap,
  Briefcase,
  LogOut,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../utils/api';

interface PendingUser {
  name: string;
  email: string;
  rollNo?: string;
  role: 'student' | 'teacher';
  department?: string;
  yearSemester?: string;
  designation?: string;
  accountStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0
  });

  useEffect(() => {
    loadPendingUsers();
  }, []);

  useEffect(() => {
    let filtered = pendingUsers;

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.rollNo && user.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterRole, pendingUsers]);

  const loadPendingUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.getPendingUsers();
      const users = response.users || [];
      setPendingUsers(users);
      
      const pending = users.filter(u => u.accountStatus === 'pending').length;
      const approved = users.filter(u => u.accountStatus === 'approved').length;
      const rejected = users.filter(u => u.accountStatus === 'rejected').length;

      setStats({
        totalPending: pending,
        totalApproved: approved,
        totalRejected: rejected
      });
    } catch (error) {
      toast.error('Failed to load pending users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (email: string, name: string) => {
    try {
      await api.updateAccountStatus(email, 'approved');
      toast.success(`${name}'s account has been approved!`);
      loadPendingUsers();
    } catch (error) {
      toast.error('Failed to approve account');
      console.error(error);
    }
  };

  const handleReject = async (email: string, name: string) => {
    try {
      await api.updateAccountStatus(email, 'rejected');
      toast.success(`${name}'s account has been rejected`);
      loadPendingUsers();
    } catch (error) {
      toast.error('Failed to reject account');
      console.error(error);
    }
  };

  const handleDelete = async (email: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}'s account?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteUser(email);
      toast.success(`${name}'s account has been deleted`);
      loadPendingUsers();
    } catch (error) {
      toast.error('Failed to delete account');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col items-center">

        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-4 w-full">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage user account approvals</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <Card className="p-6 w-full">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-gray-600 text-sm">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalPending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 w-full">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-gray-600 text-sm">Approved Users</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalApproved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 w-full">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-gray-600 text-sm">Rejected Users</p>
                <p className="text-3xl font-bold text-red-600">{stats.totalRejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <UserX className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter */}
        <Card className="p-6 mb-6 w-full max-w-3xl">
          <div className="flex flex-col gap-4 items-center">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                variant={filterRole === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterRole('all')}
              >
                <Users className="w-4 h-4 mr-2" />
                All
              </Button>

              <Button
                variant={filterRole === 'student' ? 'default' : 'outline'}
                onClick={() => setFilterRole('student')}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Students
              </Button>

              <Button
                variant={filterRole === 'teacher' ? 'default' : 'outline'}
                onClick={() => setFilterRole('teacher')}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Teachers
              </Button>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Card className="p-6 w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            {filterRole === 'all' ? 'All Users' : filterRole === 'student' ? 'Students' : 'Teachers'}
          </h2>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No users found</div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.email}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        {getStatusBadge(user.accountStatus)}

                        <Badge variant="outline" className="capitalize">
                          {user.role === 'student' ? (
                            <>
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Student
                            </>
                          ) : (
                            <>
                              <Briefcase className="w-3 h-3 mr-1" />
                              Teacher
                            </>
                          )}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>

                        {user.rollNo && (
                          <div><strong>Roll No:</strong> {user.rollNo}</div>
                        )}

                        {user.designation && (
                          <div><strong>Designation:</strong> {user.designation}</div>
                        )}

                        {user.department && (
                          <div><strong>Department:</strong> {user.department}</div>
                        )}

                        {user.yearSemester && (
                          <div><strong>Year/Semester:</strong> {user.yearSemester}</div>
                        )}

                        <div>
                          <strong>Registered:</strong>{' '}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {user.accountStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(user.email, user.name)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(user.email, user.name)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(user.email, user.name)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
