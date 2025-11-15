import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import StudentNavbar from '../components/StudentNavbar';

export default function StudentSurveyDetailPage() {
  const { surveyId } = useParams();
  const navigate = useNavigate();

  // Mock survey data - in real app, fetch based on surveyId
  const survey = {
    id: surveyId,
    title: 'Weekly Assessment',
    course: 'CAP 301',
    type: 'Exam',
    status: 'In Progress',
    progress: 50,
    dueDate: 'Nov 8, 5:00 PM',
    duration: '30 minutes',
    passingScore: '70%',
    totalQuestions: 25,
    attemptsRemaining: 1,
    description: 'This weekly assessment covers the key concepts discussed in lectures 5-7. Please ensure you complete all questions before the deadline.',
    instructions: [
      'Read each question carefully before answering',
      'You must complete the survey in one sitting',
      'Ensure stable internet connection throughout',
      'Click \'Submit\' when you\'re done to save your responses'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="mb-8 pb-4 border-b border-gray-300">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">Survey Board</h1>
          <p className="text-sm text-gray-500">View and manage all your surveys and submissions in one place.</p>
        </div>

        {/* Survey Detail Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8 mb-6 border border-indigo-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-indigo-900">{survey.title}</h2>
                <Badge className="bg-white text-gray-700 border-gray-300 px-3 py-1">
                  {survey.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-indigo-700 mb-6">
                <span className="font-semibold">{survey.course}</span>
                <span>•</span>
                <Badge variant="info">{survey.status}</Badge>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">{survey.progress}%</span>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-indigo-200">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-300" 
                style={{ width: `${survey.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Due date</p>
              <p className="text-sm font-semibold text-gray-900">{survey.dueDate}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Duration</p>
              <p className="text-sm font-semibold text-gray-900">{survey.duration}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Passing Score</p>
              <p className="text-sm font-semibold text-gray-900">{survey.passingScore}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Questions</p>
              <p className="text-sm font-semibold text-gray-900">{survey.totalQuestions}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-600">{survey.description}</p>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-yellow-900 mb-3">Please read carefully before starting</h3>
              <ul className="space-y-2">
                {survey.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-yellow-800 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Attempts Remaining */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Note: {survey.attemptsRemaining} Attempt</span> remaining
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => {
              // Handle continue survey
              console.log('Continue survey');
            }}
          >
            Continue Survey
          </Button>
        </div>
      </main>
    </div>
  );
}
