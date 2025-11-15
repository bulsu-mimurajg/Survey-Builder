import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Modal } from '../components/ui/modal';
import StudentNavbar from '../components/StudentNavbar';

export default function StudentCoursesPage() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  // Mock enrolled courses data
  const enrolledCourses = [
    { id: 1, code: 'CAP 401', fullName: 'Capstone 401 - BSIT 4EG2' },
    { id: 2, code: 'SSP101C', fullName: 'SSP101C - BSIT 4E' },
    { id: 3, code: 'IT403', fullName: 'Web Systems and Technology 3 - BSIT 4EG2' },
    { id: 4, code: 'CAP 401', fullName: 'Capstone 401 - BSIT 4EG2' },
    { id: 5, code: 'SSP101C', fullName: 'SSP101C - BSIT 4E' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-4 border-b border-gray-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrolled courses</h1>
            <p className="text-sm text-gray-500">View and manage the courses you're currently enrolled in.</p>
          </div>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            onClick={() => setShowJoinModal(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Join a Course
          </Button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow border border-gray-200">
              <CardContent className="p-6 pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{course.code}</h3>
                  <p className="text-sm text-gray-500">{course.fullName}</p>
                </div>
                <Link to={`/student/courses/${course.id}`}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    View
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Join Course Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setInviteCode('');
        }}
        title="Join course via invite code"
        description="Enter your invite code to join a class."
        confirmText="Join Course"
        onConfirm={() => {
          // Handle join course logic here
          console.log('Joining course with code:', inviteCode);
          setShowJoinModal(false);
          setInviteCode('');
        }}
      >
        <Input
          type="text"
          placeholder="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="w-full"
        />
      </Modal>
    </div>
  );
}
