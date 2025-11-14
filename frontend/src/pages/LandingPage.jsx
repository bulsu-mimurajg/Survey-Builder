import { Button } from '../components/ui/button'
import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const LandingPage = () => {
  const swiperRef = useRef(null)

  useEffect(() => {
    // Smooth scroll handler
    const handleClick = (e) => {
      const target = e.target.closest('a[href^="#"]')
      if (target) {
        e.preventDefault()
        const id = target.getAttribute('href').slice(1)
        const element = document.getElementById(id)
        if (element) {
          const headerOffset = 80
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - headerOffset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-indigo-600">
                <svg className="w-8 h-8 inline-block" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12C8 10.8954 8.89543 10 10 10H15C16.1046 10 17 10.8954 17 12V15C17 16.1046 16.1046 17 15 17H10C8.89543 17 8 16.1046 8 15V12Z" fill="currentColor"/>
                  <path d="M23 12C23 10.8954 23.8954 10 25 10H30C31.1046 10 32 10.8954 32 12V15C32 16.1046 31.1046 17 30 17H25C23.8954 17 23 16.1046 23 15V12Z" fill="currentColor"/>
                  <path d="M10 23C8.89543 23 8 23.8954 8 25V28C8 29.1046 8.89543 30 10 30H15C16.1046 30 17 29.1046 17 28V25C17 23.8954 16.1046 23 15 23H10Z" fill="currentColor"/>
                  <path d="M23 25C23 23.8954 23.8954 23 25 23H30C31.1046 23 32 23.8954 32 25V28C32 29.1046 31.1046 30 30 30H25C23.8954 30 23 29.1046 23 28V25Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">sixsayvensurvey.io</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-indigo-600 font-medium">Home</a>
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium">Features</a>
              <a href="#roles" className="text-gray-700 hover:text-indigo-600 font-medium">Roles</a>
              <a href="#team" className="text-gray-700 hover:text-indigo-600 font-medium">Our Team</a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 font-medium">About Us</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50 rounded-xl w-28">
                Sign In
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-28">
                Sign Up
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main id="home" className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 text-indigo-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold uppercase tracking-wide">SMARTER ACADEMIC INSIGHTS</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Create, Answer and Analyze Surveys
              <br />
              <span className="text-indigo-600">— All in One Platform</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Empowering students and teachers with real-time survey analytics that turn feedback into meaningful insights for smarter decisions and improved learning experiences.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-lg">
                Get Started
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg rounded-lg border-gray-300">
                Sign In
              </Button>
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-200 p-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                {/* Survey Builder Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Survey Name</div>
                      <div className="text-xs text-gray-500">All changes saved</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg">Save Changes</div>
                  </div>
                </div>

                <div className="flex">
                  {/* Main Canvas Area */}
                  <div className="flex-1 bg-gray-50 p-6">
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center" style={{ minHeight: '280px' }}>
                      <div className="w-16 h-16 text-gray-300 mb-4">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                      </div>
                      <div className="text-base font-medium text-gray-400 mb-2 whitespace-nowrap">Drop components here to start building</div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">Drag question types from the toolbox on the right</div>
                    </div>
                  </div>

                  {/* Component Toolbox Sidebar */}
                  <div className="w-64 bg-white border-l border-gray-200">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-5 h-5 bg-indigo-600 rounded animate-pulse"></div>
                        <div className="text-sm font-semibold text-gray-900">Component Toolbox</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Drag to add questions</div>
                    </div>

                    {/* Text Inputs Section */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-indigo-500 rounded animate-pulse"></div>
                          <div className="text-xs font-semibold text-gray-700">Text Inputs</div>
                        </div>
                        <div className="text-xs text-gray-400">(2)</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2 border border-gray-200">
                          <div className="w-6 h-6 bg-indigo-500 rounded animate-pulse"></div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-700">Short Text</div>
                            <div className="text-xs text-gray-500">Single line text input</div>
                          </div>
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2 border border-gray-200">
                          <div className="w-6 h-6 bg-indigo-500 rounded animate-pulse"></div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gray-700">Long Text</div>
                            <div className="text-xs text-gray-500">Multi-line text area</div>
                          </div>
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Choice Questions Section */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-purple-500 rounded animate-pulse"></div>
                          <div className="text-xs font-semibold text-gray-700">Choice Questions</div>
                        </div>
                        <div className="text-xs text-gray-400">(3)</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2 border border-gray-200">
                          <div className="w-6 h-6 bg-purple-500 rounded animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-2.5 bg-gray-300 rounded w-20 mb-1 animate-pulse"></div>
                            <div className="h-2 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2 border border-gray-200">
                          <div className="w-6 h-6 bg-purple-500 rounded animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-2.5 bg-gray-300 rounded w-16 mb-1 animate-pulse"></div>
                            <div className="h-2 bg-gray-200 rounded w-20 animate-pulse"></div>
                          </div>
                          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Other Sections Collapsed */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded animate-pulse"></div>
                          <div className="text-xs font-semibold text-gray-700">Rating & Scale</div>
                        </div>
                        <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
                          <div className="text-xs font-semibold text-gray-700">Date & Time</div>
                        </div>
                        <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-pink-500 rounded animate-pulse"></div>
                          <div className="text-xs font-semibold text-gray-700">Media & Files</div>
                        </div>
                        <div className="w-3 h-3 bg-gray-300 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-600 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-600 rounded-full opacity-20 blur-2xl"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
              <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                <span className="text-sm font-medium text-gray-700">Live Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-3">FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              A better way to measure what matters
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore the essential tools that make survey creation and analysis effortless, combining clarity, 
              efficiency, and real-time insights to help educators and students engage meaningfully with data.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
            {/* Response Management */}
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Response Management</h3>
              <p className="text-gray-600 leading-relaxed">
                View and filter student submissions in real time with organized, searchable tables.
              </p>
            </div>

            {/* Smart Survey Builder - Elevated Card */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl transform md:-translate-y-4 text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Survey Builder</h3>
              <p className="text-gray-600 leading-relaxed">
                Design surveys quickly with drag-and-drop controls, customizable question types, and section assignments.
              </p>
            </div>

            {/* Analytics Dashboard */}
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">
                Instantly visualize results through charts and word clouds that update as responses arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="bg-white py-20">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">ROLES</p>
          </div>

          {/* For Students */}
          <div className="max-w-6xl mx-auto mb-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left - Illustration */}
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-2xl p-8 flex items-center justify-center h-80">
                  {/* Placeholder for students illustration */}
                  <div className="text-center">
                    <svg className="w-48 h-48 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm text-gray-400 mt-4">Students Illustration</p>
                  </div>
                </div>
              </div>

              {/* Right - Content */}
              <div className="order-1 md:order-2">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">For Students</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Students can easily view and complete assigned surveys through a simple, organized interface. 
                  Each form supports multiple question types with progress indicators for a smooth experience. 
                  After submission, they can review their previous responses anytime within their personal history page.
                </p>
              </div>
            </div>
          </div>

          {/* For Teachers */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">For Teachers</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Teachers and administrators can create and assign surveys, monitor responses in real time, and 
                  analyze results through an interactive dashboard. The system streamlines survey management, 
                  making it easier to track participation and gain meaningful insights from student feedback.
                </p>
              </div>

              {/* Right - Illustration */}
              <div>
                <div className="bg-white rounded-2xl p-8 flex items-center justify-center h-80">
                  {/* Placeholder for teachers illustration */}
                  <div className="text-center">
                    <svg className="w-48 h-48 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <p className="text-sm text-gray-400 mt-4">Teachers Illustration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="bg-white py-20">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-4">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-3">OUR TEAM</p>
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-full">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Group 2 - BSIT 4EG2</h3>
            </div>
          </div>

          {/* Team Cards Container */}
          <div className="mx-auto mt-16" style={{ maxWidth: '1280px' }}>
            {/* Swiper Container with Navigation */}
            <div className="relative px-20">
              {/* Custom Navigation Buttons */}
              <button 
                className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button 
                className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Swiper Slider */}
              <Swiper
                ref={swiperRef}
                modules={[Navigation, Pagination]}
                spaceBetween={32}
                slidesPerView={3}
                slidesPerGroup={3}
                loop={true}
                loopAdditionalSlides={0}
                watchSlidesProgress={true}
                navigation={{
                  prevEl: '.swiper-button-prev-custom',
                  nextEl: '.swiper-button-next-custom',
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: false,
                }}
                speed={600}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 3,
                    slidesPerGroup: 3,
                    spaceBetween: 32,
                  },
                }}
                className="team-swiper"
                style={{ overflow: 'hidden' }}
              >
                {/* Card 1 - Ian Cruz */}
                <SwiperSlide>
                  <div className="group relative overflow-hidden rounded-3xl cursor-pointer mx-auto" style={{ height: '620px' }}>
                    {/* Background Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white opacity-30">
                          <svg className="w-32 h-32 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Sliding Overlay - Starts completely below the card */}
                    <div className="absolute inset-x-0 top-full h-full bg-indigo-700/90 backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:top-0 flex flex-col justify-between p-8">
                      {/* Name at Top */}
                      <div>
                        <h3 className="text-white text-2xl font-bold mb-1">Ian Cruz</h3>
                        <p className="text-white/90 text-sm">UI/UX, Front-end</p>
                      </div>
                      
                      {/* Bio at Bottom - Fades in on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        <p className="text-white/90 text-sm leading-relaxed">
                          I was in high school then a subject that I find fun is the one that involved computers and is also where I discovered that I want to be in this course.
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Card 2 - Aaron Christian */}
                <SwiperSlide>
                  <div className="group relative overflow-hidden rounded-3xl cursor-pointer mx-auto" style={{ height: '620px' }}>
                    {/* Background Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white opacity-30">
                          <svg className="w-32 h-32 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Sliding Overlay - Starts completely below the card */}
                    <div className="absolute inset-x-0 top-full h-full bg-indigo-700/90 backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:top-0 flex flex-col justify-between p-8">
                      {/* Name at Top */}
                      <div>
                        <h3 className="text-white text-2xl font-bold mb-1">Aaron Christian</h3>
                        <p className="text-white/90 text-sm">System Analyst</p>
                      </div>
                      
                      {/* Bio at Bottom - Fades in on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        <p className="text-white/90 text-sm leading-relaxed">
                          Passionate about analyzing systems and creating efficient solutions for complex problems.
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Card 3 - Tim Carcosia */}
                <SwiperSlide>
                  <div className="group relative overflow-hidden rounded-3xl cursor-pointer mx-auto" style={{ height: '620px' }}>
                    {/* Background Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white opacity-30">
                          <svg className="w-32 h-32 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Sliding Overlay - Starts completely below the card */}
                    <div className="absolute inset-x-0 top-full h-full bg-indigo-700/90 backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:top-0 flex flex-col justify-between p-8">
                      {/* Name at Top */}
                      <div>
                        <h3 className="text-white text-2xl font-bold mb-1">Tim Carcosia</h3>
                        <p className="text-white/90 text-sm">Backend</p>
                      </div>
                      
                      {/* Bio at Bottom - Fades in on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        <p className="text-white/90 text-sm leading-relaxed">
                          Specialized in backend development and building robust server-side applications.
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Card 4 - John Doe */}
                <SwiperSlide>
                  <div className="group relative overflow-hidden rounded-3xl cursor-pointer mx-auto" style={{ height: '620px' }}>
                    {/* Background Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white opacity-30">
                          <svg className="w-32 h-32 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Sliding Overlay - Starts completely below the card */}
                    <div className="absolute inset-x-0 top-full h-full bg-indigo-700/90 backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:top-0 flex flex-col justify-between p-8">
                      {/* Name at Top */}
                      <div>
                        <h3 className="text-white text-2xl font-bold mb-1">John Doe</h3>
                        <p className="text-white/90 text-sm">Full Stack Developer</p>
                      </div>
                      
                      {/* Bio at Bottom - Fades in on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        <p className="text-white/90 text-sm leading-relaxed">
                          Experienced in both frontend and backend technologies, building seamless applications.
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

                {/* Card 5 - Jane Smith */}
                <SwiperSlide>
                  <div className="group relative overflow-hidden rounded-3xl cursor-pointer mx-auto" style={{ height: '620px' }}>
                    {/* Background Image Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-600">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white opacity-30">
                          <svg className="w-32 h-32 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Sliding Overlay - Starts completely below the card */}
                    <div className="absolute inset-x-0 top-full h-full bg-indigo-700/90 backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:top-0 flex flex-col justify-between p-8">
                      {/* Name at Top */}
                      <div>
                        <h3 className="text-white text-2xl font-bold mb-1">Jane Smith</h3>
                        <p className="text-white/90 text-sm">UI Designer</p>
                      </div>
                      
                      {/* Bio at Bottom - Fades in on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                        <p className="text-white/90 text-sm leading-relaxed">
                          Creating beautiful and intuitive user interfaces that enhance user experience.
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Illustration Placeholder */}
              <div className="order-2 lg:order-1">
                <div className="relative">
                  {/* Placeholder for illustration */}
                  <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-3xl p-12 flex items-center justify-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                      <svg className="w-64 h-64 mx-auto text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <p className="text-indigo-600 font-medium mt-4">Illustration will be added here</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="order-1 lg:order-2">
                <div className="space-y-6">
                  {/* Section Label */}
                  <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">ABOUT US</p>
                  
                  {/* Main Heading */}
                  <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Our Story
                  </h2>

                  {/* Content Paragraphs */}
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    <p>
                      The Custom Survey and Analytics Platform is a web-based system developed for academic environments to simplify the process of gathering and analyzing feedback. It was designed for students and teachers who value efficiency, accuracy, and accessibility in managing surveys and interpreting results.
                    </p>
                    
                    <p>
                      Through an intuitive interface, the platform allows students to complete assigned surveys effortlessly while enabling teachers to create, monitor, and visualize responses in real time.
                    </p>
                    
                    <p>
                      This project was developed under the College of Information and Communications Technology as part of the <span className="font-semibold text-gray-900">IT 403 – Web Systems and Technologies 3</span> course, guided by <span className="font-semibold text-gray-900">Mr. Aaron Paul M. Dela Rosa, MSIT, QK-CDPO, PCEP, JSE, CPE, CLE, ITS.</span> It reflects a commitment to innovation in digital education, emphasizing usability, data integrity, and meaningful academic insight.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left Side - Text */}
              <div className="flex-1">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Run surveys with sixsayvensurvey.io.<br />
                  Gain clarity from every response.
                </h2>
              </div>

              {/* Right Side - Buttons */}
              <div className="flex items-center gap-4">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-base font-semibold rounded-xl w-40">
                  Get Started
                </Button>
                <Button variant="outline" className="bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50 py-6 text-base font-semibold rounded-xl w-40">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Footer Content */}
            <div className="flex flex-col items-center space-y-8">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold text-indigo-600">
                  <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 12C8 10.8954 8.89543 10 10 10H15C16.1046 10 17 10.8954 17 12V15C17 16.1046 16.1046 17 15 17H10C8.89543 17 8 16.1046 8 15V12Z" fill="currentColor"/>
                    <path d="M23 12C23 10.8954 23.8954 10 25 10H30C31.1046 10 32 10.8954 32 12V15C32 16.1046 31.1046 17 30 17H25C23.8954 17 23 16.1046 23 15V12Z" fill="currentColor"/>
                    <path d="M10 23C8.89543 23 8 23.8954 8 25V28C8 29.1046 8.89543 30 10 30H15C16.1046 30 17 29.1046 17 28V25C17 23.8954 16.1046 23 15 23H10Z" fill="currentColor"/>
                    <path d="M23 25C23 23.8954 23.8954 23 25 23H30C31.1046 23 32 23.8954 32 25V28C32 29.1046 31.1046 30 30 30H25C23.8954 30 23 29.1046 23 28V25Z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-2xl font-semibold text-gray-900">sixsayvensurvey.io</span>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-wrap justify-center gap-8">
                <a href="#home" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Home</a>
                <a href="#features" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
                <a href="#roles" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Roles</a>
                <a href="#team" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Our Team</a>
                <a href="#about" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">About Us</a>
              </nav>

              {/* Social Media Icons */}
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors" aria-label="Facebook">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors" aria-label="Twitter">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors" aria-label="GitHub">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors" aria-label="LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors" aria-label="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>

              {/* Copyright and Credits */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  © 2025, Group 2 BSIT 4EG2. All rights reserved.
                </p>
                <p className="text-sm text-gray-500">
                  Illustrations courtesy of <a href="https://notioly.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-medium">Notioly</a> by Mary Amato.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
