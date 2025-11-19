import { Card } from './ui/card';
import { Button } from './ui/button';
import { CloudUpload, Clock, CheckCircle2, XCircle, Mail, LogOut } from 'lucide-react';

interface PendingApprovalProps {
  email: string;
  role: 'student' | 'teacher';
  onLogout: () => void;
}

export default function PendingApproval({ email, role, onLogout }: PendingApprovalProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg text-center">
        <div className="mb-6">
          <div className="bg-yellow-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          
          <div className="flex items-center gap-2 justify-center mb-2">
            <CloudUpload className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">CloudHub</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Account Pending Approval
          </h2>
          
          <p className="text-gray-600 mb-4">
            Your {role} account has been created successfully, but it requires admin approval before you can access the platform.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 text-left">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Account Details
              </p>
              <p className="text-sm text-gray-600">
                Email: <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-600">
                Role: <span className="font-medium capitalize">{role}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 text-left">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">What happens next?</p>
              <p className="text-sm text-gray-600">
                An admin will review your account and approve it within 24-48 hours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notification</p>
              <p className="text-sm text-gray-600">
                You'll receive an email once your account is approved.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Access Restricted</p>
              <p className="text-sm text-gray-600">
                You cannot access CloudHub features until approval.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-4">
            Need help? Contact your institution's admin.
          </p>
          
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
