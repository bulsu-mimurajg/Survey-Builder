import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import StudentNavbar from '../components/StudentNavbar';

export default function StudentCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Mock course data - in real app, fetch based on courseId
  const courses = {
    1: { 
      code: 'CAP 301', 
      fullName: 'Capstone 301 - BSIT 4EG2',
      instructor: 'Juan Dela Cruz',
      description: 'Course details are coming soon. In the meantime, you can answer the available surveys to share your feedback and insights.'
    },
    2: { 
      code: 'SSP101C', 
      fullName: 'SSP101C - BSIT 4E',
      instructor: 'Maria Santos',
      description: 'Course details are coming soon. In the meantime, you can answer the available surveys to share your feedback and insights.'
    },
    3: { 
      code: 'IT403', 
      fullName: 'Web Systems and Technology 3 - BSIT 4EG2',
      instructor: 'Pedro Reyes',
      description: 'Course details are coming soon. In the meantime, you can answer the available surveys to share your feedback and insights.'
    },
  };

  const course = courses[courseId] || courses[1];

  // Mock surveys data for this course
  
  const surveys = [
    { 
      id: 1, 
      title: 'Quiz # 67', 
      type: 'Exam',
      status: 'Not Started',
      progress: 0,
      dueDate: 'Nov 8, 5:00pm',
      courseCode: course.code
    },
    { 
      id: 2, 
      title: 'Weekly Assessment', 
      type: 'Exam',
      status: 'In Progress',
      progress: 50,
      dueDate: 'Nov 10',
      courseCode: course.code
    },
    { 
      id: 3, 
      title: 'Feedback Form', 
      type: 'Survey',
      status: 'Not Started',
      progress: 0,
      dueDate: '--',
      courseCode: course.code
    },
    { 
      id: 4, 
      title: 'Course Evaluation', 
      type: 'Survey',
      status: 'In Progress',
      progress: 50,
      dueDate: '--',
      courseCode: course.code
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      'Not Started': { variant: 'warning', text: 'Not Started' },
      'In Progress': { variant: 'info', text: 'In Progress' },
      'Completed': { variant: 'success', text: 'Completed' },
    };
    const config = variants[status] || { variant: 'default', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getProgressBar = (progress) => {
    if (progress === 0) return <span className="text-sm text-gray-500">0%</span>;
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-600 font-medium">{progress}%</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Back Navigation */}
        <Link 
          to="/student/courses" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>

        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-300">
          <h1 className="text-2xl font-bold text-indigo-900 mb-2">Course</h1>
          <p className="text-sm text-gray-500">You're in this course. Access your surveys, responses, and updates below.</p>
        </div>

        {/* Course Info Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-8 mb-8 border border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-indigo-900 mb-3">{course.code}</h2>
              <p className="text-indigo-700 mb-4">
                {course.description}
              </p>
              <div className="inline-block">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
                  Instructor: {course.instructor}
                </Badge>
              </div>
            </div>
            <div className="hidden lg:block ml-8">
              <img 
                src="data:image/svg+xml,%3Csvg width='180' height='140' viewBox='0 0 180 140' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 50C60 50 70 30 90 30C110 30 120 50 120 50' stroke='%234F46E5' stroke-width='3' stroke-linecap='round'/%3E%3Ccircle cx='75' cy='45' r='8' fill='%234F46E5'/%3E%3Ccircle cx='105' cy='45' r='8' fill='%234F46E5'/%3E%3Cpath d='M70 70C70 70 75 80 90 80C105 80 110 70 110 70' stroke='%234F46E5' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M40 100L50 90L60 95L70 85' stroke='%236366F1' stroke-width='2' stroke-linecap='round'/%3E%3Cpath d='M110 85L120 95L130 90L140 100' stroke='%236366F1' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"
                alt="Course illustration" 
                className="w-44 h-36"
              />
            </div>
          </div>
        </div>

        {/* Survey Board Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Survey Board</h2>
            </div>
            <Link to="/student/survey-board" className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 flex items-center">
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <SurveyTable surveys={surveys} getStatusBadge={getStatusBadge} getProgressBar={getProgressBar} />
            </TabsContent>

            <TabsContent value="closed">
              <SurveyTable surveys={surveys.filter(s => s.status === 'Closed')} getStatusBadge={getStatusBadge} getProgressBar={getProgressBar} />
            </TabsContent>

            <TabsContent value="completed">
              <SurveyTable surveys={surveys.filter(s => s.status === 'Completed')} getStatusBadge={getStatusBadge} getProgressBar={getProgressBar} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Survey Table Component
function SurveyTable({ surveys, getStatusBadge, getProgressBar }) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Survey Title</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Progress</TableHead>
            <TableHead className="font-semibold">Due Date</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No surveys found
              </TableCell>
            </TableRow>
          ) : (
            surveys.map((survey) => (
              <TableRow key={survey.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{survey.title}</TableCell>
                <TableCell className="text-gray-600">{survey.type}</TableCell>
                <TableCell>{getStatusBadge(survey.status)}</TableCell>
                <TableCell>{getProgressBar(survey.progress)}</TableCell>
                <TableCell className="text-gray-600">{survey.dueDate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => navigate(`/student/survey-board/${survey.id}`)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {surveys.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">2</span> of <span className="font-semibold">10</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600">
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
