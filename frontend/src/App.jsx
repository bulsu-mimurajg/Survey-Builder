import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import StudentHomePage from './pages/StudentHomePage'
import StudentNotificationsPage from './pages/StudentNotificationsPage'
import StudentCoursesPage from './pages/StudentCoursesPage'
import StudentCourseDetailPage from './pages/StudentCourseDetailPage'
import StudentSurveyBoardPage from './pages/StudentSurveyBoardPage'
import StudentSurveyDetailPage from './pages/StudentSurveyDetailPage'

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/student/home" element={<StudentHomePage />} />
        <Route path="/student/notifications" element={<StudentNotificationsPage />} />
        <Route path="/student/courses" element={<StudentCoursesPage />} />
        <Route path="/student/courses/:courseId" element={<StudentCourseDetailPage />} />
        <Route path="/student/survey-board" element={<StudentSurveyBoardPage />} />
        <Route path="/student/survey-board/:surveyId" element={<StudentSurveyDetailPage />} />
      </Routes>
    </Router>
  )
}

export default App
