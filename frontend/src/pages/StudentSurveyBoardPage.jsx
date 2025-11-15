import { useState } from 'react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import StudentNavbar from '../components/StudentNavbar';

export default function StudentSurveyBoardPage() {
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Mock courses data
  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: '1', name: 'CAP 401' },
    { id: '2', name: 'SSP101C' },
    { id: '3', name: 'IT403' },
    { id: '4', name: 'IT401' },
  ];

  // Mock surveys data
  const allSurveys = [
    { 
      id: 1, 
      title: 'Quiz # 67', 
      type: 'Exam',
      status: 'Not Started',
      progress: 0,
      dueDate: 'Nov 8, 5:00pm',
      courseId: '1',
      courseName: 'CAP 401',
      score: null
    },
    { 
      id: 2, 
      title: 'Weekly Assessment', 
      type: 'Exam',
      status: 'In Progress',
      progress: 50,
      dueDate: 'Nov 10',
      courseId: '1',
      courseName: 'CAP 401',
      score: null
    },
    { 
      id: 3, 
      title: 'Feedback Form', 
      type: 'Survey',
      status: 'Not Started',
      progress: 0,
      dueDate: '--',
      courseId: '2',
      courseName: 'SSP101C',
      score: null
    },
    { 
      id: 4, 
      title: 'Course Evaluation', 
      type: 'Survey',
      status: 'In Progress',
      progress: 50,
      dueDate: '--',
      courseId: '3',
      courseName: 'IT403',
      score: null
    },
    { 
      id: 5, 
      title: 'Midterm Exam', 
      type: 'Exam',
      status: 'Completed',
      progress: 100,
      dueDate: 'Nov 1',
      courseId: '4',
      courseName: 'IT401',
      score: '85/100'
    },
    { 
      id: 6, 
      title: 'Final Project Survey', 
      type: 'Survey',
      status: 'Completed',
      progress: 100,
      dueDate: '--',
      courseId: '1',
      courseName: 'CAP 401',
      score: '95/100'
    },
  ];

  // Filter surveys based on selected course
  const filteredSurveys = selectedCourse === 'all' 
    ? allSurveys 
    : allSurveys.filter(s => s.courseId === selectedCourse);

  const getStatusBadge = (status) => {
    const variants = {
      'Not Started': { variant: 'warning', text: 'Not Started' },
      'In Progress': { variant: 'info', text: 'In Progress' },
      'Completed': { variant: 'success', text: 'Completed' },
      'Closed': { variant: 'default', text: 'Closed' },
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
        <div className="mb-8 pb-4 border-b border-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Board</h1>
          <p className="text-sm text-gray-500">View and manage all your surveys and submissions in one place.</p>
        </div>

        {/* Tabs and Course Filter */}
        <div className="flex items-center justify-between mb-6">
          <Tabs defaultValue="active" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="active">
              <SurveyTable 
                surveys={filteredSurveys.filter(s => s.status === 'Not Started' || s.status === 'In Progress')} 
                getStatusBadge={getStatusBadge} 
                getProgressBar={getProgressBar}
                showScore={false}
                showProgress={true}
              />
            </TabsContent>

            <TabsContent value="closed">
              <SurveyTable 
                surveys={filteredSurveys.filter(s => s.status === 'Closed')} 
                getStatusBadge={getStatusBadge} 
                getProgressBar={getProgressBar}
                showScore={false}
                showProgress={true}
              />
            </TabsContent>

            <TabsContent value="completed">
              <SurveyTable 
                surveys={filteredSurveys.filter(s => s.status === 'Completed')} 
                getStatusBadge={getStatusBadge} 
                getProgressBar={getProgressBar}
                showScore={true}
                showProgress={false}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Survey Table Component
function SurveyTable({ surveys, getStatusBadge, getProgressBar, showScore, showProgress }) {
  const colSpan = 5 + (showScore ? 1 : 0) + (showProgress ? 1 : 0);
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-gray-600">Survey Title</TableHead>
            <TableHead className="font-semibold text-gray-600">Type</TableHead>
            <TableHead className="font-semibold text-gray-600">Status</TableHead>
            {showProgress && <TableHead className="font-semibold text-gray-600">Progress</TableHead>}
            <TableHead className="font-semibold text-gray-600">Due Date</TableHead>
            {showScore && <TableHead className="font-semibold text-gray-600">Score</TableHead>}
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center text-gray-500 py-8">
                No surveys found
              </TableCell>
            </TableRow>
          ) : (
            surveys.map((survey) => (
              <TableRow key={survey.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{survey.title}</TableCell>
                <TableCell className="text-gray-600">{survey.type}</TableCell>
                <TableCell>{getStatusBadge(survey.status)}</TableCell>
                {showProgress && <TableCell>{getProgressBar(survey.progress)}</TableCell>}
                <TableCell className="text-gray-600">{survey.dueDate}</TableCell>
                {showScore && (
                  <TableCell className="text-gray-600">
                    {survey.status === 'Completed' && survey.score ? survey.score : '--'}
                  </TableCell>
                )}
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
