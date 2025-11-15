import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';

export default function StudentHomePage() {
  const navigate = useNavigate();

  // Mock data for enrolled courses
  const enrolledCourses = [
    { id: 1, code: 'CA', name: 'CAP 401 - Capstone', members: 23, color: 'bg-pink-500' },
    { id: 2, code: 'SS', name: 'SSP101C - Gender and So..', members: 16, color: 'bg-orange-500' },
    { id: 3, code: 'SA', name: 'IT401 - System Administra..', members: 67, color: 'bg-green-500' },
    { id: 4, code: 'CA', name: 'IT403 - Web Systems & Te..', members: 12, color: 'bg-cyan-500' },
  ];

  // Mock data for recently taken surveys
  const recentSurveys = [
    { 
      id: 1, 
      title: 'UI/UX Design Principles', 
      type: 'Exam',
      status: 'Completed',
      progress: 100,
      dueDate: 'Nov 5',
      score: '10/10'
    },
    { 
      id: 2, 
      title: 'Weekly Assessment', 
      type: 'Exam',
      status: 'In Progress',
      progress: 50,
      dueDate: 'Nov 10',
      score: null
    },
    { 
      id: 3, 
      title: 'Course Evaluation', 
      type: 'Survey',
      status: 'In Progress',
      progress: 50,
      dueDate: '--',
      score: null
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl leading-8 font-normal text-gray-600 flex items-center">
              <span className="mr-2">👋</span> Welcome, Juan!
            </h1>
          </div>
          <div className="text-xs leading-4 font-extrabold text-gray-500">
            October 25, 2025, Sunday
          </div>
        </div>

        {/* Get Started Card */}
        <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-8 pt-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Get Started – Join a Course Today!</h2>
                <p className="text-gray-600 mb-4 max-w-2xl">
                  Discover insights and share your thoughts by participating in one of our class surveys. Whether it's for feedback, research, or engagement, your voice helps shape a better learning experience. Be part of the conversation!
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Join a Course
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </div>
              <div className="hidden lg:block">
                <img src="data:image/svg+xml,%3Csvg width='200' height='150' viewBox='0 0 200 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='20' y='20' width='80' height='100' rx='8' fill='%234F46E5' opacity='0.2'/%3E%3Crect x='110' y='40' width='70' height='80' rx='8' fill='%236366F1' opacity='0.3'/%3E%3Ccircle cx='150' cy='30' r='20' fill='%238B5CF6' opacity='0.2'/%3E%3C/svg%3E" alt="Illustration" className="w-48 h-36" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Enrolled Courses</h2>
            </div>
            <Button 
              variant="link" 
              className="text-indigo-600"
              onClick={() => navigate('/student/courses')}
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                <div className="flex items-center">
                  <div className={`w-24 h-20 ${course.color} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                    {course.code}
                  </div>
                  <div className="flex-1 px-4 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{course.name}</h3>
                    <p className="text-xs text-gray-500">{course.members} Members</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 mr-2 flex-shrink-0">
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
                        onClick={() => navigate(`/student/courses/${course.id}`)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Survey Board */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Survey Board</h2>
            </div>
            <Button 
              variant="link" 
              className="text-indigo-600"
              onClick={() => navigate('/student/survey-board')}
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-600">Survey Title</TableHead>
                  <TableHead className="font-semibold text-gray-600">Type</TableHead>
                  <TableHead className="font-semibold text-gray-600">Status</TableHead>
                  <TableHead className="font-semibold text-gray-600">Progress</TableHead>
                  <TableHead className="font-semibold text-gray-600">Due Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSurveys.map((survey) => (
                  <TableRow key={survey.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{survey.title}</TableCell>
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
                          <DropdownMenuItem className="cursor-pointer">
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
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
