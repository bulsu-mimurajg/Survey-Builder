import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import StudentNavbar from '../components/StudentNavbar';

export default function StudentNotificationsPage() {

  // Mock notification data
  const notifications = [
    {
      id: 1,
      type: 'info',
      icon: 'info',
      title: 'New course enrollment',
      description: 'You\'ve been added to the Introduction to Marketing course.',
      course: 'ELEC 401',
      time: '2 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'success',
      icon: 'check',
      title: 'Exam graded',
      description: 'Your score for the Final Assessment exam is now available.',
      course: '98Pc 101',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'warning',
      icon: 'warning',
      title: 'Exam deadline approaching',
      description: 'The STE # 2 exam closes in 2 hours — don\'t forget to submit!',
      course: 'IT401',
      time: '3 hours ago',
      unread: true
    },
    {
      id: 4,
      type: 'info',
      icon: 'info',
      title: 'New survey available',
      description: 'The Activity Insights Survey is now open for responses.',
      course: 'IT402',
      time: '1 day ago',
      unread: true
    },
    {
      id: 5,
      type: 'error',
      icon: 'close',
      title: 'Survey past due',
      description: 'You missed the deadline for the Activity # 6 exam. This survey is now closed.',
      course: 'IT405',
      time: '2 days ago',
      unread: true
    },
    {
      id: 6,
      type: 'info',
      icon: 'info',
      title: 'New exam available',
      description: 'The STE # 3 exam is now open for responses. Deadline: November 9, 2025',
      course: 'IT401',
      time: '3 days ago',
      unread: true
    },
  ];

  // Count unread notifications
  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type, icon) => {
    const colors = {
      info: 'bg-blue-100',
      success: 'bg-green-100',
      warning: 'bg-yellow-100',
      error: 'bg-red-100'
    };

    const iconColors = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };

    return (
      <div className={`w-10 h-10 rounded-full ${colors[type]} flex items-center justify-center flex-shrink-0`}>
        {icon === 'info' && (
          <svg className={`w-5 h-5 ${iconColors[type]}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        )}
        {icon === 'check' && (
          <svg className={`w-5 h-5 ${iconColors[type]}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        )}
        {icon === 'warning' && (
          <svg className={`w-5 h-5 ${iconColors[type]}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        )}
        {icon === 'close' && (
          <svg className={`w-5 h-5 ${iconColors[type]}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-4 border-b border-gray-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-sm text-gray-500">All your survey alerts and updates in one place.</p>
          </div>
          <Button variant="outline" className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50">
            Mark all as read
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="hover:shadow-md transition-shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {getNotificationIcon(notification.type, notification.icon)}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notification.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-indigo-600 text-white border-indigo-600 text-xs font-semibold">
                        {notification.course}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
