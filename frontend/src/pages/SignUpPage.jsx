import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Modal } from '../components/ui/modal';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Step 1 - Login Details
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Step 2 - User Profile
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: ''
  });

  // Step 3 - Verification
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Redirect logic based on account status
  useEffect(() => {
    if (isAccountCreated && !isVerified && currentStep !== 3) {
      setCurrentStep(3);
    }
  }, [isAccountCreated, isVerified, currentStep]);

  // Handle Step 1 Continue
  const handleStep1Continue = (e) => {
    e.preventDefault();
    
    // Validation
    if (!loginData.email || !loginData.password || !loginData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (loginData.password !== loginData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setCurrentStep(2);
  };

  // Handle Step 2 Create Account
  const handleStep2CreateAccount = (e) => {
    e.preventDefault();
    
    // Validation
    if (!profileData.firstName || !profileData.lastName || !profileData.gender || !profileData.dateOfBirth) {
      toast.error('Please fill in all fields');
      return;
    }

    setShowConfirmModal(true);
  };

  // Handle Confirmation
  const handleConfirmCreation = () => {
    setShowConfirmModal(false);
    setIsAccountCreated(true);
    // TODO: Create account in database and send verification email
    console.log('Account created:', { ...loginData, ...profileData });
    toast.success('Account created successfully! Please check your email for verification.');
    setCurrentStep(3);
  };

  // Handle Verification Code Input
  const handleVerificationInput = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Verification Code Backspace
  const handleVerificationKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Verification Submit
  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    // TODO: Verify code with backend
    console.log('Verification code submitted:', code);
    
    // For now, simulate successful verification
    setIsVerified(true);
    toast.success('Verification successful! Redirecting to dashboard...');
    // TODO: Redirect to student dashboard
    // navigate('/student/dashboard');
  };

  // Handle Sign Out from Step 3
  const handleSignOut = () => {
    // Reset all states
    setCurrentStep(1);
    setIsAccountCreated(false);
    setIsVerified(false);
    setLoginData({ email: '', password: '', confirmPassword: '' });
    setProfileData({ firstName: '', lastName: '', gender: '', dateOfBirth: '' });
    setVerificationCode(['', '', '', '', '', '']);
    navigate('/signin');
  };

  // Mask email for display
  const maskEmail = (email) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    if (localPart.length <= 4) {
      return `${localPart[0]}*${localPart[localPart.length - 1]}@${domain}`;
    }
    
    const visibleChars = 2;
    const maskedLength = Math.min(localPart.length - (visibleChars * 2), 5);
    const maskedPart = '*'.repeat(maskedLength);
    return `${localPart.substring(0, visibleChars)}${maskedPart}${localPart.substring(localPart.length - visibleChars)}@${domain}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-20 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Back Navigation */}
          {currentStep === 1 && (
            <Link 
              to="/signin" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-12 text-sm"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Back to Sign In
            </Link>
          )}

          {currentStep === 2 && (
            <button 
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-12 text-sm"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Previous Step
            </button>
          )}

          {currentStep === 3 && (
            <Link 
              to="/signin" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-12 text-sm"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Back to Sign In
            </Link>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Create your account
            </h1>

            {/* Step Title */}
            <div className="mb-3">
              <h2 className="text-base font-normal text-gray-900">
                <span className="font-semibold">
                  {currentStep === 1 && 'Step 1.'}
                  {currentStep === 2 && 'Step 2.'}
                  {currentStep === 3 && 'Step 3.'}
                </span>{' '}
                {currentStep === 1 && 'Login Details'}
                {currentStep === 2 && 'User Profile'}
                {currentStep === 3 && 'Verification'}
              </h2>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center mb-8">
              {/* Step 1 */}
              <div className="relative">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  currentStep > 1 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : currentStep === 1 
                    ? 'bg-white border-indigo-600' 
                    : 'bg-white border-gray-300'
                }`}>
                  {currentStep > 1 && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {currentStep === 1 && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  )}
                </div>
              </div>

              {/* Line 1-2 */}
              <div className={`h-0.5 w-20 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>

              {/* Step 2 */}
              <div className="relative">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  currentStep > 2 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : currentStep === 2 
                    ? 'bg-white border-indigo-600' 
                    : 'bg-white border-gray-300'
                }`}>
                  {currentStep > 2 && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {currentStep === 2 && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  )}
                </div>
              </div>

              {/* Line 2-3 */}
              <div className={`h-0.5 w-20 ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>

              {/* Step 3 */}
              <div className="relative">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  currentStep === 3 
                    ? 'bg-white border-indigo-600' 
                    : 'bg-white border-gray-300'
                }`}>
                  {currentStep === 3 && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Login Details */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Continue} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={loginData.confirmPassword}
                  onChange={(e) => setLoginData({ ...loginData, confirmPassword: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-medium"
              >
                Continue
              </Button>

              <div className="text-center h-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Step 2: User Profile */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2CreateAccount} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <Select
                  id="gender"
                  value={profileData.gender}
                  onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </Select>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                  className="w-full"
                  placeholder="MM/DD/YY"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-medium"
              >
                Create account
              </Button>

              {/* Empty space to maintain layout consistency */}
              <div className="h-6"></div>
            </form>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  A 6-digit verification code was sent to your email,{' '}
                  <span className="font-semibold text-gray-900">{maskEmail(loginData.email)}</span>.
                  Please check your inbox.
                </p>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Input your 6-digit verification code
                  </label>
                  <div className="flex justify-between gap-2">
                    {verificationCode.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleVerificationInput(index, e.target.value)}
                        onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                        className="w-14 h-14 text-center text-xl font-semibold"
                        required
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-medium"
                >
                  Continue
                </Button>

                <div className="text-center h-6">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/90 to-purple-600/90 mix-blend-multiply"></div>
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
          alt="Workspace"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmCreation}
        title="Confirm account creation"
        description="Please review your details before continuing. Once your account is created, you can't return to the previous steps. After this, you'll move on to Step 3: Verify Your Account."
        cancelText="Cancel"
        confirmText="Confirm Action"
      />
    </div>
  );
}
