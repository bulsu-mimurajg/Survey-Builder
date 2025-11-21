// Survey Builder JavaScript

let draggedQuestionType = null;
let draggedElement = null;
let draggedQuestionId = null;
let draggedQuestionElement = null;
let autoScrollInterval = null;

// Function to hide empty state message
function hideEmptyState() {
    const canvas = document.getElementById('survey-canvas');
    if (!canvas) return;
    
    const emptyState = canvas.querySelector('.flex.flex-col.items-center.justify-center.h-full');
    if (emptyState) {
        emptyState.remove();
    }
}

// Function to show empty state message
function showEmptyState() {
    const canvas = document.getElementById('survey-canvas');
    if (!canvas) return;
    
    const container = document.getElementById('questions-container');
    
    // Only show if there are no questions
    const hasQuestions = container && container.querySelectorAll('.draggable-question').length > 0;
    if (hasQuestions) return;
    
    // Check if empty state already exists
    const existingEmptyState = canvas.querySelector('.flex.flex-col.items-center.justify-center.h-full');
    if (existingEmptyState) return;
    
    // Create empty state message
    const emptyState = document.createElement('div');
    emptyState.className = 'flex flex-col items-center justify-center h-full text-center py-20';
    emptyState.innerHTML = `
        <div class="text-6xl text-gray-300 mb-4">T</div>
        <p class="text-lg font-medium text-gray-600 mb-2">Drop components here to start building</p>
        <p class="text-sm text-gray-500">Drag question types from the toolbox on the right</p>
    `;
    canvas.appendChild(emptyState);
}

// Drag and Drop Handlers for adding new questions
function handleDragStart(event, questionType) {
    // REINFORCED: Check if restrictions apply - block if survey is active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        event.preventDefault();
        showToast('Cannot add questions when survey is active', 'error');
        return;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        event.preventDefault();
        showToast('Cannot add questions when survey has responses', 'error');
        return;
    }
    
    draggedQuestionType = questionType;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    
    // Show drop zones between questions
    showQuestionDropZones();
}

function handleDragOver(event) {
    // Only handle if we're not dragging a question and not over a drop zone
    if (draggedQuestionId || event.target.closest('.question-drop-zone')) {
        return;
    }
    
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // Only highlight canvas if there are no questions (empty canvas)
    const container = document.getElementById('questions-container');
    if (!container || container.children.length === 0) {
        event.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
    }
    
    // Handle auto-scrolling
    handleAutoScroll(event);
}

function handleDragLeave(event) {
    // Only handle if we're not dragging a question
    if (draggedQuestionId) {
        return;
    }
    
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
    // Stop auto-scrolling when leaving canvas
    stopAutoScroll();
}

function handleDrop(event) {
    // Only handle if we're not dragging a question
    if (draggedQuestionId) {
        return;
    }
    
    // REINFORCED: Check if restrictions apply - block if survey is active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        event.preventDefault();
        showToast('Cannot add questions when survey is active', 'error');
        hideQuestionDropZones();
        draggedQuestionType = null;
        return;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        event.preventDefault();
        showToast('Cannot add questions when survey has responses', 'error');
        hideQuestionDropZones();
        draggedQuestionType = null;
        return;
    }
    
    event.preventDefault();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
    
    // Check if dropping on a drop zone
    const dropZone = event.target.closest('.question-drop-zone');
    if (dropZone && draggedQuestionType) {
        const insertOrder = parseInt(dropZone.dataset.insertOrder);
        addQuestion(draggedQuestionType, insertOrder);
    } else if (draggedQuestionType) {
        // Drop on canvas - add at end
        addQuestion(draggedQuestionType);
    }
    
    // Clean up
    hideQuestionDropZones();
    draggedQuestionType = null;
}

// Drag and Drop Handlers for reordering existing questions
function handleQuestionDragStart(event, questionId) {
    // REINFORCED: Check if restrictions apply - block if survey is active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        event.preventDefault();
        event.stopPropagation();
        showToast('Cannot reorder questions when survey is active', 'error');
        return false;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        event.preventDefault();
        event.stopPropagation();
        showToast('Cannot reorder questions when survey has responses', 'error');
        return false;
    }
    
    // Handle both string temp IDs and numeric IDs
    draggedQuestionId = String(questionId);
    draggedQuestionElement = event.currentTarget;
    event.dataTransfer.effectAllowed = 'move';
    event.currentTarget.style.opacity = '0.5';
    event.currentTarget.classList.add('border-indigo-500');
    
    // Add drop zones
    const questions = document.querySelectorAll('.draggable-question');
    questions.forEach(q => {
        if (q !== event.currentTarget) {
            q.classList.add('drop-zone');
        }
    });
}

function handleQuestionDragEnd(event) {
    event.currentTarget.style.opacity = '1';
    event.currentTarget.classList.remove('border-indigo-500');
    
    // Remove drop zones
    const questions = document.querySelectorAll('.draggable-question');
    questions.forEach(q => {
        q.classList.remove('drop-zone', 'drag-over');
    });
    
    draggedQuestionId = null;
    draggedQuestionElement = null;
}

// Show drop zones between questions when dragging new question type
function showQuestionDropZones() {
    const container = document.getElementById('questions-container');
    const canvas = document.getElementById('survey-canvas');
    
    if (!container && !canvas) return;
    
    const questions = container ? Array.from(container.querySelectorAll('.draggable-question')) : [];
    
    if (questions.length > 0) {
        // Add drop zone before first question
        const firstDropZone = createDropZone(0);
        container.insertBefore(firstDropZone, questions[0]);
        
        // Add drop zones between questions
        questions.forEach((question, index) => {
            const dropZone = createDropZone(index + 1);
            question.parentNode.insertBefore(dropZone, question.nextSibling);
        });
    } else {
        // If no questions, add drop zone in canvas
        if (canvas) {
            const dropZone = createDropZone(0);
            canvas.appendChild(dropZone);
        }
    }
}

// Create a drop zone element
function createDropZone(insertOrder) {
    const dropZone = document.createElement('div');
    // Start visible with default state (smaller, less prominent)
    dropZone.className = 'question-drop-zone my-2 h-3 bg-indigo-100 border-2 border-dashed border-indigo-300 rounded-lg opacity-100 transition-all duration-200';
    dropZone.dataset.insertOrder = insertOrder;
    dropZone.setAttribute('draggable', 'false');
    
    let dragLeaveTimeout = null;
    
    // Add event listeners
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Clear any pending hide timeout
        if (dragLeaveTimeout) {
            clearTimeout(dragLeaveTimeout);
            dragLeaveTimeout = null;
        }
        // Make more prominent when hovering
        dropZone.classList.remove('h-3', 'bg-indigo-100', 'border-indigo-300');
        dropZone.classList.add('h-8', 'bg-indigo-300', 'border-indigo-400');
        // Handle auto-scrolling
        handleAutoScroll(e);
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        // Check if we're actually leaving the dropzone (not just moving to a child element)
        const rect = dropZone.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        // If mouse is still within dropzone bounds, don't change state
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return;
        }
        
        // Use a small timeout to debounce - if dragover fires again, we'll cancel this
        dragLeaveTimeout = setTimeout(() => {
            // Return to default visible state (not hidden)
            dropZone.classList.remove('h-8', 'bg-indigo-300', 'border-indigo-400');
            dropZone.classList.add('h-3', 'bg-indigo-100', 'border-indigo-300');
            dragLeaveTimeout = null;
        }, 50);
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Clear any pending hide timeout
        if (dragLeaveTimeout) {
            clearTimeout(dragLeaveTimeout);
            dragLeaveTimeout = null;
        }
        handleDrop(e);
    });
    
    return dropZone;
}

// Hide all drop zones
function hideQuestionDropZones() {
    const dropZones = document.querySelectorAll('.question-drop-zone');
    dropZones.forEach(zone => {
        zone.classList.add('opacity-0');
        setTimeout(() => {
            if (zone.parentElement) {
                zone.remove();
            }
        }, 200);
    });
}

// Auto-scroll when dragging near edges
function handleAutoScroll(event) {
    // Only auto-scroll when dragging new question types
    if (!draggedQuestionType || draggedQuestionId) {
        stopAutoScroll();
        return;
    }
    
    // Find the scrollable container (parent of survey-canvas with overflow-y-auto)
    const canvas = document.getElementById('survey-canvas');
    if (!canvas) {
        stopAutoScroll();
        return;
    }
    
    const scrollContainer = canvas.closest('.overflow-y-auto');
    if (!scrollContainer) {
        stopAutoScroll();
        return;
    }
    
    const containerRect = scrollContainer.getBoundingClientRect();
    const mouseY = event.clientY;
    
    // Check if mouse is within container bounds
    if (mouseY < containerRect.top || mouseY > containerRect.bottom) {
        stopAutoScroll();
        return;
    }
    
    // Define scroll zone (50px from top/bottom edges)
    const scrollZoneHeight = 50;
    const topZone = containerRect.top + scrollZoneHeight;
    const bottomZone = containerRect.bottom - scrollZoneHeight;
    
    // Clear existing interval
    stopAutoScroll();
    
    // Check if mouse is in scroll zone
    if (mouseY < topZone && scrollContainer.scrollTop > 0) {
        // Scroll up
        autoScrollInterval = setInterval(() => {
            const scrollAmount = Math.max(1, (topZone - mouseY) / 5);
            scrollContainer.scrollTop = Math.max(0, scrollContainer.scrollTop - scrollAmount);
            if (scrollContainer.scrollTop <= 0) {
                stopAutoScroll();
            }
        }, 16); // ~60fps
    } else if (mouseY > bottomZone && scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        // Scroll down
        autoScrollInterval = setInterval(() => {
            const scrollAmount = Math.max(1, (mouseY - bottomZone) / 5);
            const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            scrollContainer.scrollTop = Math.min(maxScroll, scrollContainer.scrollTop + scrollAmount);
            if (scrollContainer.scrollTop >= maxScroll) {
                stopAutoScroll();
            }
        }, 16); // ~60fps
    }
}

// Stop auto-scrolling
function stopAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// Initialize drag and drop
document.addEventListener('DOMContentLoaded', function() {
    // Initialize change tracker
    changeTracker.init();
    
    // Track title changes
    const titleInput = document.getElementById('survey-title');
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            changeTracker.updateChangeStatus();
            if (changeTracker.hasUnsavedChanges) {
                updateSaveStatus('Unsaved changes', 'unsaved');
            }
        });
    }
    
    // Track course checkbox changes
    const courseCheckboxes = document.querySelectorAll('input[name="course-assignment"]');
    courseCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Small delay to ensure checkbox state is updated
            setTimeout(() => {
                changeTracker.updateChangeStatus();
                if (changeTracker.hasUnsavedChanges) {
                    updateSaveStatus('Unsaved changes', 'unsaved');
                }
            }, 10);
        });
    });
    
    const canvas = document.getElementById('survey-canvas');
    if (canvas) {
        canvas.addEventListener('dragover', handleDragOver);
        canvas.addEventListener('dragleave', handleDragLeave);
        canvas.addEventListener('drop', handleDrop);
        
        // Add drag and drop handlers for existing questions
        const questions = document.querySelectorAll('.draggable-question');
        questions.forEach(question => {
            question.addEventListener('dragover', handleQuestionDragOver);
            question.addEventListener('dragleave', handleQuestionDragLeave);
            question.addEventListener('drop', handleQuestionDrop);
        });
    }
    
    // Hide drop zones when drag ends (for new question types)
    document.addEventListener('dragend', function(e) {
        if (draggedQuestionType && !draggedQuestionId) {
            hideQuestionDropZones();
            stopAutoScroll();
            // Reset opacity of dragged element
            if (e.target) {
                e.target.style.opacity = '1';
            }
        }
    });
    
    // Also stop auto-scroll on drop
    document.addEventListener('drop', function(e) {
        stopAutoScroll();
    });
    
    // Add event listener for course assignment modal button
    const openCourseModalBtn = document.getElementById('open-course-modal-btn');
    if (openCourseModalBtn) {
        openCourseModalBtn.addEventListener('click', openCourseAssignmentModal);
    }
    
    // Prevent navigation if there are unsaved changes (but not if we're saving)
    window.addEventListener('beforeunload', function(e) {
        if (changeTracker.hasUnsavedChanges && !isSaving) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
});

// Handle dragging over a question
function handleQuestionDragOver(event) {
    if (!draggedQuestionId) return;
    
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const questionElement = event.currentTarget;
    const questionId = questionElement.dataset.questionId;
    
    if (String(questionId) !== String(draggedQuestionId)) {
        questionElement.classList.add('drag-over', 'border-indigo-400', 'bg-indigo-50');
    }
}

// Handle leaving a question during drag
function handleQuestionDragLeave(event) {
    event.currentTarget.classList.remove('drag-over', 'border-indigo-400', 'bg-indigo-50');
}

// Handle dropping a question on another question
function handleQuestionDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // REINFORCED: Check if restrictions apply - block if survey is active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        showToast('Cannot reorder questions when survey is active', 'error');
        return;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        showToast('Cannot reorder questions when survey has responses', 'error');
        return;
    }
    
    const targetQuestionId = event.currentTarget.dataset.questionId;
    
    if (draggedQuestionId && String(targetQuestionId) !== String(draggedQuestionId)) {
        reorderQuestions(draggedQuestionId, targetQuestionId);
    }
    
    // Clean up visual states
    const questions = document.querySelectorAll('.draggable-question');
    questions.forEach(q => {
        q.classList.remove('drag-over', 'border-indigo-400', 'bg-indigo-50');
    });
}

// Reorder questions (temporary, not saved to backend)
function reorderQuestions(draggedId, targetId) {
    // REINFORCED: Check if restrictions apply - block if survey is active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        showToast('Cannot reorder questions when survey is active', 'error');
        return;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        showToast('Cannot reorder questions when survey has responses', 'error');
        return;
    }
    
    const questions = Array.from(document.querySelectorAll('.draggable-question'));
    const draggedElement = questions.find(q => {
        const id = q.dataset.questionId;
        return String(id) === String(draggedId);
    });
    const targetElement = questions.find(q => {
        const id = q.dataset.questionId;
        return String(id) === String(targetId);
    });
    
    if (!draggedElement || !targetElement) return;
    
    const container = document.getElementById('questions-container') || document.getElementById('survey-canvas');
    const draggedIndex = questions.indexOf(draggedElement);
    const targetIndex = questions.indexOf(targetElement);
    
    // Move the element in the DOM
    if (draggedIndex < targetIndex) {
        targetElement.parentNode.insertBefore(draggedElement, targetElement.nextSibling);
    } else {
        targetElement.parentNode.insertBefore(draggedElement, targetElement);
    }
    
    // Update order numbers (temporary, not saved)
    updateQuestionOrders();
}

// Update question orders (temporary, not saved to backend)
function updateQuestionOrders() {
    const questions = Array.from(document.querySelectorAll('.draggable-question'));
    
    // Count sections starting from 2 (Section 1 is the implicit first page)
    let sectionCount = 1;
    let questionCount = 0;
    
    // Update question numbers in DOM
    questions.forEach((question) => {
        const qNumber = question.querySelector('.text-sm.font-medium.text-gray-500');
        const isSection = qNumber && qNumber.hasAttribute('data-is-section');
        
        if (qNumber) {
            if (isSection) {
                sectionCount++;
                qNumber.textContent = `Section ${sectionCount}`;
            } else {
                questionCount++;
                qNumber.textContent = `Question ${questionCount}`;
            }
        }
    });
    
    // Track changes instead of saving immediately
    changeTracker.updateChangeStatus();
    if (changeTracker.hasUnsavedChanges) {
        updateSaveStatus('Unsaved changes', 'unsaved');
    }
}

// Toggle category expansion
function toggleCategory(categoryId) {
    const category = document.getElementById(categoryId);
    const icon = document.getElementById(categoryId + '-icon');
    
    if (category) {
        category.classList.toggle('hidden');
        if (icon) {
            icon.classList.toggle('rotate-180');
        }
    }
}

// Add question (temporary, not saved to backend)
function addQuestion(questionType, insertOrder = null) {
    // REINFORCED: Check if restrictions apply - block if survey is active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        showToast('Cannot add questions when survey is active', 'error');
        return;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        showToast('Cannot add questions when survey has responses', 'error');
        return;
    }
    
    // Generate temporary ID
    const tempId = 'temp-' + changeTracker.tempQuestionIdCounter++;
    
    // Get container
    const container = document.getElementById('questions-container') || document.getElementById('survey-canvas');
    if (!container) return;
    
    // Create question element (simplified version - you may need to enhance this)
    const questionDiv = document.createElement('div');
    questionDiv.className = 'draggable-question mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm';
    questionDiv.setAttribute('data-question-id', tempId);
    questionDiv.setAttribute('draggable', 'true');
    questionDiv.setAttribute('ondragstart', `handleQuestionDragStart(event, '${tempId}')`);
    questionDiv.setAttribute('ondragend', 'handleQuestionDragEnd(event)');
    
    // Set default settings based on question type
    const defaultSettings = {};
    if (questionType === 'rating') {
        defaultSettings.max = 5;
    } else if (questionType === 'scale') {
        defaultSettings.min = 1;
        defaultSettings.max = 10;
    }
    
    // Store question data
    const questionData = {
        tempId: tempId,
        type: questionType,
        order: insertOrder !== null ? insertOrder : (container.querySelectorAll('.draggable-question').length),
        text: 'New Question',
        required: false,
        settings: defaultSettings,
        options: [] // For choice-based questions
    };
    
    // Add to pending changes
    changeTracker.pendingQuestionChanges.added.push(questionData);
    
    // Create question HTML (simplified - you may want to load from template)
    const typeLabels = {
        'short_text': 'Short Text',
        'long_text': 'Long Text',
        'multiple_choice': 'Multiple Choice',
        'checkboxes': 'Checkboxes',
        'dropdown': 'Dropdown',
        'rating': 'Rating',
        'scale': 'Scale',
        'date': 'Date',
        'time': 'Time',
        'file_upload': 'File Upload',
        'section': 'Section'
    };
    
    // Get icon HTML based on question type
    let iconHtml = '';
    if (questionType === 'short_text') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><span class="text-indigo-600 font-bold text-xs">T</span></div>';
    } else if (questionType === 'long_text') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg></div>';
    } else if (questionType === 'multiple_choice') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>';
    } else if (questionType === 'checkboxes') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>';
    } else if (questionType === 'dropdown') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg></div>';
    } else if (questionType === 'rating') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></div>';
    } else if (questionType === 'scale') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg></div>';
    } else if (questionType === 'date') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg></div>';
    } else if (questionType === 'time') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg></div>';
    } else if (questionType === 'file_upload') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg></div>';
    } else if (questionType === 'section') {
        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg></div>';
    } else {
        iconHtml = '<div class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg></div>';
    }
    
    // Generate preview based on question type
    let questionPreview = '';
    if (questionType === 'short_text') {
        questionPreview = '<input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter your answer" disabled>';
    } else if (questionType === 'long_text') {
        questionPreview = '<textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" placeholder="Enter your answer" disabled></textarea>';
    } else if (questionType === 'multiple_choice') {
        questionPreview = '<div class="space-y-2"><p class="text-sm text-gray-400">No options added</p></div>';
    } else if (questionType === 'checkboxes') {
        questionPreview = '<div class="space-y-2"><p class="text-sm text-gray-400">No options added</p></div>';
    } else if (questionType === 'dropdown') {
        questionPreview = '<select class="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled><option>Select an option</option></select>';
    } else if (questionType === 'rating') {
        questionPreview = '<div class="flex space-x-2">' + Array.from({length: 5}, (_, i) => '<button disabled class="w-8 h-8 border border-gray-300 rounded hover:bg-indigo-50">⭐</button>').join('') + '</div>';
    } else if (questionType === 'scale') {
        questionPreview = '<div class="flex space-x-2">' + Array.from({length: 10}, (_, i) => `<button disabled class="w-8 h-8 border border-gray-300 rounded hover:bg-indigo-50">${i + 1}</button>`).join('') + '</div>';
    } else if (questionType === 'date') {
        questionPreview = '<input type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>';
    } else if (questionType === 'time') {
        questionPreview = '<input type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>';
    } else if (questionType === 'file_upload') {
        questionPreview = '<div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"><svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg><p class="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p></div>';
    } else if (questionType === 'section') {
        questionPreview = '<div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4"><p class="text-sm text-indigo-600 font-medium mb-1">Section Break</p><p class="text-xs text-gray-500">Add a description to provide context for the next set of questions</p></div>';
    }
    
    // Calculate initial display number
    let initialDisplayNumber = 1;
    if (questionType === 'section') {
        // Count existing sections + 2 (since Section 1 is implicit)
        const existingSections = container.querySelectorAll('[data-is-section="true"]');
        initialDisplayNumber = existingSections.length + 2;
    } else {
        // Count existing non-section questions
        const allItems = container.querySelectorAll('.draggable-question');
        let questionCount = 0;
        allItems.forEach(item => {
            const qNum = item.querySelector('.text-sm.font-medium.text-gray-500');
            if (qNum && !qNum.hasAttribute('data-is-section')) {
                questionCount++;
            }
        });
        initialDisplayNumber = questionCount + 1;
    }
    
    questionDiv.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <div class="flex items-center space-x-2 mb-2">
                    <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 text-gray-400 drag-handle" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                        </svg>
                        ${iconHtml}
                    </div>
                    <span class="text-sm font-medium text-gray-500"${questionType === 'section' ? ' data-is-section="true"' : ''}>${questionType === 'section' ? 'Section ' + initialDisplayNumber : 'Question ' + initialDisplayNumber}</span>
                    <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">${typeLabels[questionType] || questionType.replace(/_/g, ' ')}</span>
                </div>
                <h4 class="text-base font-medium text-gray-900 mb-2">New Question</h4>
                <div class="mt-3">
                    ${questionPreview}
                </div>
            </div>
            <div class="ml-4 flex items-center space-x-2">
                <button onclick="editQuestion('${tempId}')" class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button onclick="deleteQuestion('${tempId}')" class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Hide empty state when adding first question
    hideEmptyState();
    
    // Insert at correct position
    const existingQuestions = container.querySelectorAll('.draggable-question');
    if (insertOrder !== null && insertOrder < existingQuestions.length) {
        container.insertBefore(questionDiv, existingQuestions[insertOrder]);
    } else {
        container.appendChild(questionDiv);
    }
    
    // Attach drag and drop event listeners for the new question
    questionDiv.addEventListener('dragover', handleQuestionDragOver);
    questionDiv.addEventListener('dragleave', handleQuestionDragLeave);
    questionDiv.addEventListener('drop', handleQuestionDrop);
    
    // Renumber all questions
    renumberQuestions();
    
    // Track changes
    changeTracker.updateChangeStatus();
    if (changeTracker.hasUnsavedChanges) {
        updateSaveStatus('Unsaved changes', 'unsaved');
    }
}

// Edit question
function editQuestion(questionId) {
    // Check if it's a temporary question
    if (String(questionId).startsWith('temp-')) {
        // For temporary questions, create an edit form with type selector
        const addedQuestion = changeTracker.pendingQuestionChanges.added.find(q => q.tempId === questionId);
        if (addedQuestion) {
            const currentType = addedQuestion.type || 'short_text';
            const currentText = addedQuestion.text || 'New Question';
            const currentRequired = addedQuestion.required || false;
            const currentOptions = addedQuestion.options || [];
            const currentSettings = addedQuestion.settings || {};
            
            // Special modal for section type
            if (currentType === 'section') {
                const currentDescription = currentSettings.description || '';
                const sectionFormHtml = `
                    <form onsubmit="event.preventDefault(); saveQuestion('${questionId}');">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                                <input type="text" name="question_text" value="${currentText}" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                      placeholder="Enter section title" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
                                <textarea name="section_description" rows="3" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                          placeholder="Add a description to provide context for the next set of questions">${currentDescription}</textarea>
                                <p class="text-xs text-gray-500 mt-1">This description will be shown to students at the beginning of the section</p>
                            </div>
                            <div class="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onclick="closeQuestionModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </form>
                `;
                showQuestionModal('Edit Section', sectionFormHtml);
                return;
            }
            
            // Create form with question type selector for non-section questions
            const questionTypes = [
                {value: 'short_text', label: 'Short Text'},
                {value: 'long_text', label: 'Long Text'},
                {value: 'multiple_choice', label: 'Multiple Choice'},
                {value: 'checkboxes', label: 'Checkboxes'},
                {value: 'dropdown', label: 'Dropdown'},
                {value: 'rating', label: 'Rating'},
                {value: 'scale', label: 'Scale'},
                {value: 'date', label: 'Date'},
                {value: 'time', label: 'Time'},
                {value: 'file_upload', label: 'File Upload'}
            ];
            
            let typeSpecificFields = '';
            
            // Options for choice-based questions
            if (['multiple_choice', 'checkboxes', 'dropdown'].includes(currentType)) {
                const optionsHtml = currentOptions.length > 0 
                    ? currentOptions.map((opt, idx) => `
                        <div class="flex items-center space-x-2 option-item">
                            <input type="text" name="options[]" value="${opt}" 
                                   class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5" 
                                   placeholder="Option text" required>
                            <button type="button" onclick="removeOption(this)" class="text-red-600 hover:text-red-800">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    `).join('')
                    : `
                        <div class="flex items-center space-x-2 option-item">
                            <input type="text" name="options[]" 
                                   class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5" 
                                   placeholder="Option text" required>
                            <button type="button" onclick="removeOption(this)" class="text-red-600 hover:text-red-800">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    `;
                
                typeSpecificFields = `
                    <div class="mb-4" id="options-section">
                        <label class="block mb-2 text-sm font-medium text-gray-900">Options</label>
                        <div id="options-list" class="space-y-2">
                            ${optionsHtml}
                        </div>
                        <button type="button" onclick="addOption()" class="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            + Add Option
                        </button>
                    </div>
                `;
            }
            
            // Scale settings
            if (currentType === 'scale') {
                typeSpecificFields = `
                    <div class="mb-4 space-y-3" id="scale-section">
                        <div>
                            <label for="scale_min" class="block mb-2 text-sm font-medium text-gray-900">Minimum Value</label>
                            <input type="number" name="scale_min" id="scale_min" min="1" max="10" 
                                   value="${currentSettings.min || 1}" 
                                   oninput="validateScaleInputs(this)" onchange="validateScaleRange()"
                                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                        </div>
                        <div>
                            <label for="scale_max" class="block mb-2 text-sm font-medium text-gray-900">Maximum Value</label>
                            <input type="number" name="scale_max" id="scale_max" min="1" max="10" 
                                   value="${currentSettings.max || 10}" 
                                   oninput="validateScaleInputs(this)" onchange="validateScaleRange()"
                                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                        </div>
                        <p class="text-xs text-gray-500">Numeric range from minimum (1) to maximum (10) value</p>
                    </div>
                `;
            }
            
            // Rating info
            if (currentType === 'rating') {
                typeSpecificFields = `
                    <div class="mb-4" id="rating-section">
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p class="text-sm font-medium text-gray-900 mb-1">Rating Type</p>
                            <p class="text-xs text-gray-600">Likert scale (1-5)</p>
                        </div>
                    </div>
                `;
            }
            
            // Section description
            if (currentType === 'section') {
                const currentDescription = currentSettings.description || '';
                typeSpecificFields = `
                    <div class="mb-4" id="section-description">
                        <label for="section_description" class="block mb-2 text-sm font-medium text-gray-900">Section Description</label>
                        <textarea name="section_description" id="section_description" rows="3" 
                                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" 
                                  placeholder="Provide context or instructions for this section">${currentDescription}</textarea>
                        <p class="text-xs text-gray-500 mt-1">This description will be shown to students at the beginning of the section</p>
                    </div>
                `;
            }
            
            const formHtml = `
                <form onsubmit="event.preventDefault(); saveQuestion('${questionId}');">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                            <select name="question_type" id="question-type-select" onchange="updateQuestionTypeFields('${questionId}')" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                ${questionTypes.map(t => `<option value="${t.value}" ${t.value === currentType ? 'selected' : ''}>${t.label}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                            <textarea name="question_text" rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                      required>${currentText}</textarea>
                        </div>
                        <div id="type-specific-fields">
                            ${typeSpecificFields}
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="required" ${currentRequired ? 'checked' : ''} 
                                   class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                            <label class="ml-2 text-sm text-gray-700">Required</label>
                        </div>
                        <div class="flex justify-end gap-3 pt-4 border-t">
                            <button type="button" onclick="closeQuestionModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                Confirm
                            </button>
                        </div>
                    </div>
                </form>
            `;
            document.getElementById('question-edit-form').innerHTML = formHtml;
            document.getElementById('question-edit-modal').classList.remove('hidden');
        }
    } else {
        // For existing questions, fetch from API
        fetch(`/api/survey/question/${questionId}/update/`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('question-edit-form').innerHTML = data.form_html;
                document.getElementById('question-edit-modal').classList.remove('hidden');
            } else {
                showToast('Error loading question: ' + (data.error || 'Unknown error'), 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading question', 'error');
        });
    }
}

// Delete question (temporary, not saved to backend)
function deleteQuestion(questionId) {
    // REINFORCED: Check if restrictions apply - block if survey is active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        showToast('Cannot delete questions when survey is active', 'error');
        return false;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        showToast('Cannot delete questions when survey has responses', 'error');
        return false;
    }
    
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
    if (!questionElement) return;
    
    // Check if it's a temporary question (was just added)
    if (String(questionId).startsWith('temp-')) {
        // Remove from added list
        changeTracker.pendingQuestionChanges.added = changeTracker.pendingQuestionChanges.added.filter(
            q => q.tempId !== questionId
        );
    } else {
        // Mark as deleted
        if (!changeTracker.pendingQuestionChanges.deleted.includes(parseInt(questionId))) {
            changeTracker.pendingQuestionChanges.deleted.push(parseInt(questionId));
        }
        // Remove from edited list if it was there
        delete changeTracker.pendingQuestionChanges.edited[questionId];
    }
    
    // Remove from DOM
    questionElement.remove();
    
    // Renumber remaining questions
    renumberQuestions();
    
    // Check if no questions remain and show empty state
    const container = document.getElementById('questions-container');
    const remainingQuestions = container ? container.querySelectorAll('.draggable-question').length : 0;
    if (remainingQuestions === 0) {
        showEmptyState();
    }
    
    // Track changes
    changeTracker.updateChangeStatus();
    if (changeTracker.hasUnsavedChanges) {
        updateSaveStatus('Unsaved changes', 'unsaved');
    }
}

// Renumber questions after deletion
function renumberQuestions() {
    // Use updateQuestionOrders which handles sections correctly
    updateQuestionOrders();
}

// Update question type fields when type changes
function updateQuestionTypeFields(questionId) {
    const select = document.getElementById('question-type-select');
    const selectedType = select.value;
    const typeFieldsContainer = document.getElementById('type-specific-fields');
    
    let typeSpecificFields = '';
    
    if (['multiple_choice', 'checkboxes', 'dropdown'].includes(selectedType)) {
        typeSpecificFields = `
            <div class="mb-4" id="options-section">
                <label class="block mb-2 text-sm font-medium text-gray-900">Options</label>
                <div id="options-list" class="space-y-2">
                    <div class="flex items-center space-x-2 option-item">
                        <input type="text" name="options[]" 
                               class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5" 
                               placeholder="Option text" required>
                        <button type="button" onclick="removeOption(this)" class="text-red-600 hover:text-red-800">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <button type="button" onclick="addOption()" class="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    + Add Option
                </button>
            </div>
        `;
    } else if (selectedType === 'scale') {
        typeSpecificFields = `
            <div class="mb-4 space-y-3" id="scale-section">
                <div>
                    <label for="scale_min" class="block mb-2 text-sm font-medium text-gray-900">Minimum Value</label>
                    <input type="number" name="scale_min" id="scale_min" min="1" max="10" value="1" 
                           oninput="validateScaleInputs(this)" onchange="validateScaleRange()"
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                </div>
                <div>
                    <label for="scale_max" class="block mb-2 text-sm font-medium text-gray-900">Maximum Value</label>
                    <input type="number" name="scale_max" id="scale_max" min="1" max="10" value="10" 
                           oninput="validateScaleInputs(this)" onchange="validateScaleRange()"
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                </div>
                <p class="text-xs text-gray-500">Numeric range from minimum (1) to maximum (10) value</p>
            </div>
        `;
    } else if (selectedType === 'rating') {
        typeSpecificFields = `
            <div class="mb-4" id="rating-section">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p class="text-sm font-medium text-gray-900 mb-1">Rating Type</p>
                    <p class="text-xs text-gray-600">Likert scale (1-5)</p>
                </div>
            </div>
        `;
    }
    
    typeFieldsContainer.innerHTML = typeSpecificFields;
}

// Validate scale input values (1-10 only)
function validateScaleInputs(input) {
    let value = parseInt(input.value);
    
    // Remove non-numeric characters
    if (input.value !== '' && isNaN(value)) {
        input.value = '';
        return;
    }
    
    // Enforce range 1-10
    if (value < 1) {
        input.value = 1;
    } else if (value > 10) {
        input.value = 10;
    }
}

// Validate that minimum doesn't exceed maximum
function validateScaleRange() {
    const minInput = document.getElementById('scale_min');
    const maxInput = document.getElementById('scale_max');
    
    if (!minInput || !maxInput) return;
    
    const minValue = parseInt(minInput.value);
    const maxValue = parseInt(maxInput.value);
    
    // If both have values, check that min <= max
    if (!isNaN(minValue) && !isNaN(maxValue)) {
        if (minValue > maxValue) {
            // Adjust the one that was just changed
            if (document.activeElement === minInput) {
                minInput.value = maxValue;
            } else if (document.activeElement === maxInput) {
                maxInput.value = minValue;
            }
        }
    }
}

// Save question (temporary, stores in pending changes)
function saveQuestion(questionId) {
    const form = document.getElementById('question-edit-form').querySelector('form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    // Store form data in pending changes
    const questionData = {};
    const options = [];
    for (let [key, value] of formData.entries()) {
        if (key === 'options[]') {
            options.push(value);
        } else {
            questionData[key] = value;
        }
    }
    if (options.length > 0) {
        questionData.options = options;
    }
    
    // Check if it's a temporary question
    if (String(questionId).startsWith('temp-')) {
        // Update the added question data
        const addedQuestion = changeTracker.pendingQuestionChanges.added.find(q => q.tempId === questionId);
        if (addedQuestion) {
            // Update type if changed
            const newType = questionData.question_type || addedQuestion.type;
            addedQuestion.type = newType;
            addedQuestion.text = questionData.question_text || addedQuestion.text;
            addedQuestion.required = questionData.required === 'on' || questionData.required === true;
            addedQuestion.options = options;
            
            // Update settings based on type
            if (newType === 'scale') {
                addedQuestion.settings = {
                    min: parseInt(questionData.scale_min) || 1,
                    max: parseInt(questionData.scale_max) || 10
                };
            } else if (newType === 'rating') {
                addedQuestion.settings = { max: 5 };
            } else if (newType === 'section') {
                addedQuestion.settings = {
                    description: questionData.section_description || ''
                };
            } else {
                addedQuestion.settings = {};
            }
            
            addedQuestion.data = questionData;
            
            // Update the question display in DOM
            const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
            if (questionElement) {
                const questionText = questionData.question_text || 'New Question';
                const textElement = questionElement.querySelector('h4.text-base.font-medium.text-gray-900');
                if (textElement) {
                    textElement.textContent = questionText;
                }
                
                // Update icon based on new type
                const iconContainer = questionElement.querySelector('.w-6.h-6.bg-indigo-100, .w-6.h-6.bg-gray-100');
                if (iconContainer) {
                    let iconHtml = '';
                    if (newType === 'short_text') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><span class="text-indigo-600 font-bold text-xs">T</span></div>';
                    } else if (newType === 'long_text') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg></div>';
                    } else if (newType === 'multiple_choice') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>';
                    } else if (newType === 'checkboxes') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></div>';
                    } else if (newType === 'dropdown') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg></div>';
                    } else if (newType === 'rating') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></div>';
                    } else if (newType === 'scale') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg></div>';
                    } else if (newType === 'date') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg></div>';
                    } else if (newType === 'time') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg></div>';
                    } else if (newType === 'file_upload') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg></div>';
                    } else if (newType === 'section') {
                        iconHtml = '<div class="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg></div>';
                    } else {
                        iconHtml = '<div class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"><svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg></div>';
                    }
                    iconContainer.outerHTML = iconHtml;
                }
                
                // Update type badge
                const typeBadge = questionElement.querySelector('.text-xs.text-gray-400.bg-gray-100');
                if (typeBadge) {
                    const typeLabels = {
                        'short_text': 'Short Text',
                        'long_text': 'Long Text',
                        'multiple_choice': 'Multiple Choice',
                        'checkboxes': 'Checkboxes',
                        'dropdown': 'Dropdown',
                        'rating': 'Rating',
                        'scale': 'Scale',
                        'date': 'Date',
                        'time': 'Time',
                        'file_upload': 'File Upload',
                        'section': 'Section'
                    };
                    typeBadge.textContent = typeLabels[newType] || newType.replace(/_/g, ' ');
                }
                
                // Update preview container based on question type
                const previewContainer = questionElement.querySelector('.mt-3');
                if (previewContainer) {
                    // Generate appropriate preview based on type
                    if (newType === 'short_text') {
                        previewContainer.innerHTML = '<input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter your answer" disabled>';
                    } else if (newType === 'long_text') {
                        previewContainer.innerHTML = '<textarea class="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" placeholder="Enter your answer" disabled></textarea>';
                    } else if (newType === 'date') {
                        previewContainer.innerHTML = '<input type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>';
                    } else if (newType === 'time') {
                        previewContainer.innerHTML = '<input type="time" class="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>';
                    } else if (newType === 'file_upload') {
                        previewContainer.innerHTML = '<div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"><svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg><p class="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p></div>';
                    } else if (newType === 'section') {
                        const description = addedQuestion.settings && addedQuestion.settings.description ? addedQuestion.settings.description : '';
                        previewContainer.innerHTML = `<div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4"><p class="text-sm text-indigo-600 font-medium mb-1">Section Break</p>${description ? `<p class="text-sm text-gray-700">${description}</p>` : '<p class="text-xs text-gray-500">Add a description to provide context for the next set of questions</p>'}</div>`;
                    }
                }
                
                // Update options display for choice-based questions
                if (['multiple_choice', 'checkboxes', 'dropdown'].includes(newType) && options.length > 0) {
                    // Check if there's already an options container, if not create one
                    let optionsContainer = questionElement.querySelector('.mt-3, .space-y-2');
                    if (!optionsContainer) {
                        // Create a container for options
                        const container = document.createElement('div');
                        container.className = 'mt-3';
                        questionElement.appendChild(container);
                        optionsContainer = container;
                    } else if (!optionsContainer.classList.contains('space-y-2')) {
                        // If it's the mt-3 container, create space-y-2 inside it
                        const spaceDiv = document.createElement('div');
                        spaceDiv.className = 'space-y-2';
                        optionsContainer.innerHTML = '';
                        optionsContainer.appendChild(spaceDiv);
                        optionsContainer = spaceDiv;
                    }
                    
                    if (newType === 'multiple_choice' || newType === 'checkboxes') {
                        optionsContainer.innerHTML = '';
                        options.forEach(optionText => {
                            if (optionText.trim()) {
                                const optionDiv = document.createElement('div');
                                optionDiv.className = 'flex items-center';
                                const inputType = newType === 'multiple_choice' ? 'radio' : 'checkbox';
                                optionDiv.innerHTML = `
                                    <input type="${inputType}" disabled class="mr-2">
                                    <label class="text-sm text-gray-700">${optionText}</label>
                                `;
                                optionsContainer.appendChild(optionDiv);
                            }
                        });
                    } else if (newType === 'dropdown') {
                        const select = document.createElement('select');
                        select.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg';
                        select.disabled = true;
                        const defaultOption = document.createElement('option');
                        defaultOption.textContent = 'Select an option';
                        select.appendChild(defaultOption);
                        options.forEach(optionText => {
                            if (optionText.trim()) {
                                const option = document.createElement('option');
                                option.textContent = optionText;
                                select.appendChild(option);
                            }
                        });
                        
                        // Find the preview container (the .mt-3 div) and replace its content
                        const previewContainer = questionElement.querySelector('.mt-3');
                        if (previewContainer) {
                            previewContainer.innerHTML = '';
                            previewContainer.appendChild(select);
                        }
                    }
                }
                
                // Update scale preview with custom min/max
                if (newType === 'scale') {
                    const previewContainer = questionElement.querySelector('.mt-3');
                    if (previewContainer) {
                        const min = addedQuestion.settings.min || 1;
                        const max = addedQuestion.settings.max || 10;
                        const scaleButtons = [];
                        for (let i = min; i <= max; i++) {
                            scaleButtons.push(`<button disabled class="w-8 h-8 border border-gray-300 rounded hover:bg-indigo-50">${i}</button>`);
                        }
                        previewContainer.innerHTML = '<div class="flex space-x-2">' + scaleButtons.join('') + '</div>';
                    }
                }
                
                // Update rating preview
                if (newType === 'rating') {
                    const previewContainer = questionElement.querySelector('.mt-3');
                    if (previewContainer) {
                        const ratingButtons = Array.from({length: 5}, () => '<button disabled class="w-8 h-8 border border-gray-300 rounded hover:bg-indigo-50">⭐</button>').join('');
                        previewContainer.innerHTML = '<div class="flex space-x-2">' + ratingButtons + '</div>';
                    }
                }
            }
        }
    } else {
        // For saved questions, immediately save to backend
        saveQuestionEdit(questionId, questionData);
    }
    
    closeQuestionModal();
}

// Global functions for adding/removing options in question edit form
function addOption() {
    const container = document.getElementById('options-list');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2 option-item';
    div.innerHTML = `
        <input type="text" name="options[]" class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5" placeholder="Option text" required>
        <button type="button" onclick="removeOption(this)" class="text-red-600 hover:text-red-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;
    container.appendChild(div);
}

function removeOption(button) {
    const container = document.getElementById('options-list');
    if (!container) return;
    
    const optionItem = button.closest('.option-item');
    if (!optionItem) return;
    
    const optionItems = container.querySelectorAll('.option-item');
    if (optionItems.length > 1) {
        optionItem.remove();
    } else {
        alert('At least one option is required');
    }
}

// Close question modal
function closeQuestionModal() {
    // Clear the form HTML to discard unsaved changes
    const formContainer = document.getElementById('question-edit-form');
    if (formContainer) {
        formContainer.innerHTML = '';
    }
    
    // Hide the modal
    const modal = document.getElementById('question-edit-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    document.getElementById('question-edit-modal').classList.add('hidden');
}

// Global flag to track if we're currently saving (prevents beforeunload alert)
let isSaving = false;

// Change tracking system
let changeTracker = {
    hasUnsavedChanges: false,
    originalTitle: null,
    originalCourseIds: null,
    originalQuestionState: null, // {ids: [], order: []}
    pendingTitle: null,
    pendingCourseIds: null,
    pendingQuestionChanges: {
        added: [], // {tempId, type, order, data}
        deleted: [], // questionIds
        edited: {}, // {questionId: formData}
        reordered: null // new order array
    },
    tempQuestionIdCounter: 10000, // Start high to avoid conflicts
    
    init: function() {
        const titleInput = document.getElementById('survey-title');
        if (titleInput) {
            this.originalTitle = titleInput.value.trim();
            titleInput.setAttribute('data-original-value', this.originalTitle);
        }
        
        // Get original course IDs
        const checkboxes = document.querySelectorAll('input[name="course-assignment"]:checked');
        this.originalCourseIds = Array.from(checkboxes).map(cb => parseInt(cb.value)).sort();
        this.pendingCourseIds = [...this.originalCourseIds];
        
        // Store original question state
        this.storeOriginalQuestionState();
        
        this.updateChangeStatus();
    },
    
    storeOriginalQuestionState: function() {
        const questions = Array.from(document.querySelectorAll('.draggable-question'));
        this.originalQuestionState = {
            ids: questions.map(q => parseInt(q.dataset.questionId)),
            order: questions.map((q, index) => ({
                questionId: parseInt(q.dataset.questionId),
                order: index
            }))
        };
    },
    
    getCurrentQuestionState: function() {
        const questions = Array.from(document.querySelectorAll('.draggable-question'));
        return {
            ids: questions.map(q => {
                const id = q.dataset.questionId;
                // Check if it's a temp ID (starts with 'temp-')
                return id.startsWith('temp-') ? id : parseInt(id);
            }),
            order: questions.map((q, index) => {
                const id = q.dataset.questionId;
                return {
                    questionId: id.startsWith('temp-') ? id : parseInt(id),
                    order: index
                };
            })
        };
    },
    
    updateChangeStatus: function() {
        const titleInput = document.getElementById('survey-title');
        let titleChanged = false;
        let coursesChanged = false;
        let questionsChanged = false;
        
        if (titleInput) {
            const currentTitle = titleInput.value.trim();
            titleChanged = currentTitle !== this.originalTitle;
            this.pendingTitle = currentTitle;
        }
        
        // Check if courses changed
        const currentCheckboxes = document.querySelectorAll('input[name="course-assignment"]:checked');
        const currentCourseIds = Array.from(currentCheckboxes).map(cb => parseInt(cb.value)).sort();
        coursesChanged = JSON.stringify(currentCourseIds) !== JSON.stringify(this.originalCourseIds);
        if (coursesChanged) {
            this.pendingCourseIds = currentCourseIds;
        }
        
        // Check if questions changed
        const currentState = this.getCurrentQuestionState();
        const originalIds = this.originalQuestionState.ids.map(id => String(id)).sort();
        const currentIds = currentState.ids.map(id => String(id)).sort();
        
        // Check for additions, deletions, or reordering
        const hasAdditions = this.pendingQuestionChanges.added.length > 0;
        const hasDeletions = this.pendingQuestionChanges.deleted.length > 0;
        const hasEdits = Object.keys(this.pendingQuestionChanges.edited).length > 0;
        const hasReordering = JSON.stringify(currentState.order.map(o => String(o.questionId))) !== 
                             JSON.stringify(this.originalQuestionState.order.map(o => String(o.questionId)));
        
        questionsChanged = hasAdditions || hasDeletions || hasEdits || hasReordering;
        
        this.hasUnsavedChanges = titleChanged || coursesChanged || questionsChanged;
        this.updateSaveButtonState();
    },
    
    updateSaveButtonState: function() {
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            if (this.hasUnsavedChanges) {
                // Show button and change to orange when there are unsaved changes
                saveButton.classList.remove('hidden');
                saveButton.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
                saveButton.classList.add('bg-orange-500', 'hover:bg-orange-600');
            } else {
                // Hide button when there are no unsaved changes
                saveButton.classList.add('hidden');
                saveButton.classList.remove('bg-orange-500', 'hover:bg-orange-600');
                saveButton.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
            }
        }
    },
    
    markAsSaved: function() {
        const titleInput = document.getElementById('survey-title');
        if (titleInput && this.pendingTitle) {
            this.originalTitle = this.pendingTitle;
            titleInput.setAttribute('data-original-value', this.originalTitle);
        }
        
        if (this.pendingCourseIds) {
            this.originalCourseIds = [...this.pendingCourseIds];
        }
        
        // Update original question state
        this.storeOriginalQuestionState();
        
        // Clear pending question changes
        this.pendingQuestionChanges = {
            added: [],
            deleted: [],
            edited: {},
            reordered: null
        };
        
        this.hasUnsavedChanges = false;
        this.updateSaveButtonState();
    },
    
    resetQuestions: function() {
        // This will be called when discarding changes
        // Reload page to restore original state
        window.location.reload();
    }
};

// Update survey title (no auto-save, just track changes)
function updateSurveyTitle() {
    const titleInput = document.getElementById('survey-title');
    if (!titleInput) return;
    
    const newTitle = titleInput.value.trim();
    const originalTitle = titleInput.getAttribute('data-original-value') || titleInput.value;
    
    if (!newTitle) {
        titleInput.value = originalTitle;
        changeTracker.updateChangeStatus();
        return;
    }
    
    // Track changes instead of auto-saving
    changeTracker.updateChangeStatus();
    
    if (changeTracker.hasUnsavedChanges) {
        updateSaveStatus('Unsaved changes', 'unsaved');
    } else {
        updateSaveStatus('All changes saved', 'success');
    }
}

// Save survey - saves all pending changes
function saveSurvey() {
    // Disable button and show spinner
    const saveButton = document.getElementById('save-button');
    const saveSpinner = document.getElementById('save-spinner');
    if (saveButton) {
        saveButton.disabled = true;
        if (saveSpinner) {
            saveSpinner.classList.remove('hidden');
        }
    }
    
    isSaving = true; // Set flag to prevent beforeunload alert
    updateSaveStatus('Saving...', 'saving');
    
    // Save title if changed
    const titleInput = document.getElementById('survey-title');
    let titlePromise = Promise.resolve();
    
    if (titleInput && changeTracker.pendingTitle && changeTracker.pendingTitle !== changeTracker.originalTitle) {
        titlePromise = new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('title', changeTracker.pendingTitle);
            formData.append('csrfmiddlewaretoken', csrfToken);
            
            fetch(`/teacher/survey/${surveyId}/edit/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
            .then(response => {
                if (response.ok || response.redirected) {
                    resolve();
                } else {
                    reject(new Error('Failed to save title'));
                }
            })
            .catch(reject);
        });
    }
    
    // Save course assignments if changed
    let coursesPromise = Promise.resolve();
    const currentCheckboxes = document.querySelectorAll('input[name="course-assignment"]:checked');
    const currentCourseIds = Array.from(currentCheckboxes).map(cb => parseInt(cb.value));
    const coursesChanged = JSON.stringify(currentCourseIds.sort()) !== JSON.stringify(changeTracker.originalCourseIds.sort());
    
    if (coursesChanged) {
        coursesPromise = fetch(`/api/survey/${surveyId}/courses/update/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ course_ids: currentCourseIds })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.error || 'Failed to save course assignments');
            }
            // Update display
            if (data.course_names) {
                const displayElement = document.getElementById('courses-display');
                if (displayElement) {
                    displayElement.innerHTML = '';
                    data.course_names.forEach(courseCode => {
                        const badge = document.createElement('span');
                        badge.className = 'inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium whitespace-nowrap';
                        badge.textContent = courseCode;
                        displayElement.appendChild(badge);
                    });
                }
            }
        });
    }
    
    // Save question changes
    let questionsPromise = Promise.resolve();
    
    // Check if there are any question changes (additions, deletions, edits, or reordering)
    const currentState = changeTracker.getCurrentQuestionState();
    const originalOrder = changeTracker.originalQuestionState.order.map(o => String(o.questionId));
    const currentOrder = currentState.order.map(o => String(o.questionId));
    const hasReordering = JSON.stringify(originalOrder) !== JSON.stringify(currentOrder);
    
    const hasQuestionChanges = changeTracker.pendingQuestionChanges.added.length > 0 ||
                               changeTracker.pendingQuestionChanges.deleted.length > 0 ||
                               Object.keys(changeTracker.pendingQuestionChanges.edited).length > 0 ||
                               hasReordering;
    
    if (hasQuestionChanges) {
        questionsPromise = saveQuestionChanges();
    }
    
    // Save all changes
    return Promise.all([titlePromise, coursesPromise, questionsPromise])
        .then(() => {
            // Mark as saved
            changeTracker.markAsSaved();
            updateSaveStatus('All changes saved', 'success');
            showToast('All changes saved', 'success');
            // Reload page to show all saved changes (especially for questions)
            setTimeout(() => {
                isSaving = false; // Reset flag after navigation starts
                // Re-enable button before reload (for visual feedback)
                if (saveButton) {
                    saveButton.disabled = false;
                    if (saveSpinner) {
                        saveSpinner.classList.add('hidden');
                    }
                }
                window.location.reload();
            }, 500);
        })
        .catch(error => {
            console.error('Error saving:', error);
            isSaving = false; // Reset flag on error
            
            // Re-enable button on error
            if (saveButton) {
                saveButton.disabled = false;
                if (saveSpinner) {
                    saveSpinner.classList.add('hidden');
                }
            }
            
            updateSaveStatus('Error saving', 'error');
            showToast('Error saving changes: ' + error.message, 'error');
            throw error; // Re-throw so callers can handle it
        });
}

// Perform the actual save operation
function performSave() {
    updateSaveStatus('Saving...', 'saving');
    
    const url = `/api/survey/${surveyId}/save/`;
    console.log('Saving survey:', url, 'Survey ID:', surveyId);
    
    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.error || `HTTP error! status: ${response.status}`);
            }).catch(() => {
                throw new Error(`HTTP error! status: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Save response:', data);
        if (data.success) {
            updateSaveStatus('All changes saved', 'success');
            showToast('All changes saved', 'success');
        } else {
            updateSaveStatus('Error saving', 'error');
            showToast(data.error || 'Error saving changes', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving survey:', error);
        updateSaveStatus('Error saving', 'error');
        showToast('Error saving changes: ' + error.message, 'error');
    });
}

// Show toast notification (matching base.html style)
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    // Create toast element matching base.html style
    const toast = document.createElement('div');
    toast.className = 'toast-item flex items-center w-full max-w-md p-4 text-gray-900 bg-white rounded-lg shadow-lg border border-gray-200 gap-3';
    
    // Set icon and background color based on type
    let icon = '';
    let iconBg = '';
    
    if (type === 'error') {
        iconBg = 'bg-red-100';
        icon = `<svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>`;
    } else if (type === 'success') {
        iconBg = 'bg-green-100';
        icon = `<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>`;
    } else if (type === 'warning') {
        iconBg = 'bg-orange-100';
        icon = `<svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>`;
    } else {
        iconBg = 'bg-blue-100';
        icon = `<svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`;
    }
    
    toast.innerHTML = `
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconBg}">
            ${icon}
        </div>
        <div class="text-sm font-normal flex-1">${message}</div>
        <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 transition-colors" aria-label="Close">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    // Add to container
    container.appendChild(toast);
    
    // Auto remove after 5 seconds (matching base.html)
    setTimeout(() => removeToast(toast), 5000);
}

// Remove toast with animation (matching base.html)
function removeToast(toast) {
    if (!toast.classList.contains('removing')) {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 150);
    }
}

// Update save status with proper styling
function updateSaveStatus(message, status) {
    const saveStatus = document.getElementById('save-status');
    if (!saveStatus) return;
    
    saveStatus.textContent = message;
    
    // Remove all status classes
    saveStatus.classList.remove('text-yellow-600', 'text-green-600', 'text-red-600', 'text-gray-500', 'text-orange-600');
    
    // Add appropriate class based on status
    switch(status) {
        case 'saving':
            saveStatus.classList.add('text-yellow-600');
            break;
        case 'success':
            saveStatus.classList.add('text-green-600');
            setTimeout(() => {
                if (!changeTracker.hasUnsavedChanges) {
                    saveStatus.classList.remove('text-green-600');
                    saveStatus.classList.add('text-gray-500');
                    saveStatus.textContent = 'All changes saved';
                }
            }, 2000);
            break;
        case 'error':
            saveStatus.classList.add('text-red-600');
            break;
        case 'unsaved':
            saveStatus.classList.add('text-orange-600');
            break;
        default:
            saveStatus.classList.add('text-gray-500');
    }
}

// Handle back button click
function handleBackClick() {
    if (changeTracker.hasUnsavedChanges) {
        openUnsavedChangesModal();
    } else {
        navigateBack();
    }
}

// Navigate back
function navigateBack() {
    // Get the back URL from the button's data attribute or construct it
    const backButton = document.getElementById('back-button');
    if (backButton && backButton.dataset.url) {
        window.location.href = backButton.dataset.url;
    } else {
        // Fallback: construct URL from current path
        const pathParts = window.location.pathname.split('/');
        // Remove the last parts (survey ID and 'builder')
        const basePath = pathParts.slice(0, -2).join('/');
        window.location.href = basePath + '/survey-builder/';
    }
}

// Unsaved changes modal functions
function openUnsavedChangesModal() {
    const modal = document.getElementById('unsaved-changes-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeUnsavedChangesModal() {
    const modal = document.getElementById('unsaved-changes-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Save question changes to backend
function saveQuestionChanges() {
    const promises = [];
    const tempIdToRealId = {}; // Map temp IDs to real IDs as questions are created
    
    // Save added questions (without insert_order - they'll be appended, then reordered)
    const addPromises = changeTracker.pendingQuestionChanges.added.map(addedQuestion => {
        const tempId = addedQuestion.tempId;
        const formData = new FormData();
        formData.append('question_type', addedQuestion.type);
        formData.append('csrfmiddlewaretoken', csrfToken);
        
        return fetch(`/api/survey/${surveyId}/question/add/`, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.error || 'Failed to add question');
            }
            const newQuestionId = data.question_id;
            
            // Store the mapping
            tempIdToRealId[tempId] = newQuestionId;
            
            // Now update the question with all its data
            const updateFormData = new FormData();
            updateFormData.append('question_text', addedQuestion.text || 'New Question');
            updateFormData.append('required', addedQuestion.required ? 'on' : '');
            
            // Add options if it's a choice-based question
            if (addedQuestion.options && addedQuestion.options.length > 0) {
                addedQuestion.options.forEach(opt => {
                    updateFormData.append('options[]', opt);
                });
            }
            
            // Add settings for scale
            if (addedQuestion.type === 'scale' && addedQuestion.settings) {
                updateFormData.append('scale_min', addedQuestion.settings.min || 1);
                updateFormData.append('scale_max', addedQuestion.settings.max || 10);
            }
            
            updateFormData.append('csrfmiddlewaretoken', csrfToken);
            
            return fetch(`/api/survey/question/${newQuestionId}/update/`, {
                method: 'POST',
                body: updateFormData,
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
            .then(response => response.json())
            .then(updateData => {
                if (!updateData.success) {
                    throw new Error(updateData.error || 'Failed to update question');
                }
                return newQuestionId; // Return the ID for later use
            });
        });
    });
    
    promises.push(...addPromises);
    
    // Save edited questions
    for (const [questionId, questionData] of Object.entries(changeTracker.pendingQuestionChanges.edited)) {
        // Skip if question was deleted
        if (changeTracker.pendingQuestionChanges.deleted.includes(parseInt(questionId))) {
            continue;
        }
        promises.push(saveQuestionEdit(questionId, questionData));
    }
    
    // REINFORCED: Validate before attempting to delete questions
    if (changeTracker.pendingQuestionChanges.deleted.length > 0) {
        // Check if restrictions apply - block if active OR has responses
        if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
            showToast('Cannot delete questions when survey is active', 'error');
            changeTracker.pendingQuestionChanges.deleted = [];
            return Promise.reject(new Error('Cannot delete questions when survey is active'));
        }
        if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
            typeof hasResponses !== 'undefined' && hasResponses) {
            showToast('Cannot delete questions when survey has responses', 'error');
            // Clear the deleted list to prevent sending to backend
            changeTracker.pendingQuestionChanges.deleted = [];
            return Promise.reject(new Error('Cannot delete questions when survey has responses'));
        }
    }
    
    // Delete questions
    for (const questionId of changeTracker.pendingQuestionChanges.deleted) {
        promises.push(
            fetch(`/api/survey/question/${questionId}/delete/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || `HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    throw new Error(data.error || 'Failed to delete question');
                }
            })
        );
    }
    
    // Always reorder if there are added questions OR if order changed
    const hasAddedQuestions = changeTracker.pendingQuestionChanges.added.length > 0;
    const currentState = changeTracker.getCurrentQuestionState();
    const originalOrder = changeTracker.originalQuestionState.order.map(o => String(o.questionId));
    const currentOrder = currentState.order.map(o => String(o.questionId));
    const hasReordering = JSON.stringify(originalOrder) !== JSON.stringify(currentOrder);
    
    if (hasAddedQuestions || hasReordering) {
        // Check if restrictions apply
        if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
            showToast('Cannot reorder questions when survey is active', 'error');
            return Promise.reject(new Error('Cannot reorder questions when survey is active'));
        }
        if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
            typeof hasResponses !== 'undefined' && hasResponses) {
            showToast('Cannot reorder questions when survey has responses', 'error');
            return Promise.reject(new Error('Cannot reorder questions when survey has responses'));
        }
        
        // Wait for all add/edit/delete operations to complete, then reorder
        promises.push(
            Promise.all(promises.slice()).then(() => {
                // Build final order based on current DOM
                const questionElements = Array.from(document.querySelectorAll('.draggable-question'));
                const orders = questionElements.map((el, index) => {
                    let questionId = el.dataset.questionId;
                    
                    // If it's a temp ID, convert to real ID
                    if (String(questionId).startsWith('temp-')) {
                        questionId = tempIdToRealId[questionId];
                        if (!questionId) {
                            console.error(`No real ID found for temp ID: ${el.dataset.questionId}`);
                            return null;
                        }
                    }
                    
                    return {
                        question_id: parseInt(questionId),
                        order: index
                    };
                }).filter(o => o !== null);
                
                if (orders.length > 0) {
                    return fetch(`/api/survey/${surveyId}/questions/reorder/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': csrfToken,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ orders: orders })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (!data.success) {
                            throw new Error(data.error || 'Failed to reorder questions');
                        }
                    });
                }
            })
        );
    }
    
    return Promise.all(promises);
}

function saveQuestionEdit(questionId, questionData) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(questionData)) {
        if (key !== 'csrfmiddlewaretoken' && key !== 'options') {
            formData.append(key, value);
        }
    }
    
    // Handle options array separately - append each option as options[]
    if (questionData.options && Array.isArray(questionData.options)) {
        questionData.options.forEach(option => {
            if (option && option.trim()) {
                formData.append('options[]', option.trim());
            }
        });
    }
    
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    return fetch(`/api/survey/question/${questionId}/update/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.error || 'Failed to update question');
        }
        
        // Reload the question from the server to get updated HTML
        return fetch(`/api/survey/question/${questionId}/html/`)
            .then(response => response.json())
            .then(htmlData => {
                if (htmlData.success && htmlData.html) {
                    const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
                    if (questionElement) {
                        // Replace the question HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = htmlData.html;
                        const newQuestionElement = tempDiv.firstElementChild;
                        questionElement.replaceWith(newQuestionElement);
                        showToast('Question updated successfully', 'success');
                    }
                }
            });
    })
    .catch(error => {
        console.error('Error updating question:', error);
        showToast('Error updating question: ' + error.message, 'error');
        throw error;
    });
}

function discardChanges() {
    // Set flag to prevent beforeunload alert since we're discarding
    isSaving = true;
    
    // Close modal first
    closeUnsavedChangesModal();
    
    // For questions, we need to reload the page to restore original state
    // But since user wants to go back, we'll just navigate back
    // The original state will be restored when they come back to the page
    
    // Reset change tracker (mark as no unsaved changes so navigation proceeds)
    changeTracker.hasUnsavedChanges = false;
    changeTracker.updateSaveButtonState();
    
    // Navigate back - the page will reload with original state from server
    setTimeout(() => {
        isSaving = false; // Reset flag after navigation starts
        navigateBack();
    }, 100);
}

function saveAndExit() {
    closeUnsavedChangesModal();
    
    // Set flag to prevent beforeunload alert
    isSaving = true;
    
    // Save all changes first
    updateSaveStatus('Saving...', 'saving');
    
    // Save title if changed
    const titleInput = document.getElementById('survey-title');
    let titlePromise = Promise.resolve();
    
    if (titleInput && changeTracker.pendingTitle && changeTracker.pendingTitle !== changeTracker.originalTitle) {
        titlePromise = new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('title', changeTracker.pendingTitle);
            formData.append('csrfmiddlewaretoken', csrfToken);
            
            fetch(`/teacher/survey/${surveyId}/edit/`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
            .then(response => {
                if (response.ok || response.redirected) {
                    resolve();
                } else {
                    reject(new Error('Failed to save title'));
                }
            })
            .catch(reject);
        });
    }
    
    // Save course assignments if changed
    let coursesPromise = Promise.resolve();
    const currentCheckboxes = document.querySelectorAll('input[name="course-assignment"]:checked');
    const currentCourseIds = Array.from(currentCheckboxes).map(cb => parseInt(cb.value));
    const coursesChanged = JSON.stringify(currentCourseIds.sort()) !== JSON.stringify(changeTracker.originalCourseIds.sort());
    
    if (coursesChanged) {
        coursesPromise = fetch(`/api/survey/${surveyId}/courses/update/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ course_ids: currentCourseIds })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.error || 'Failed to save course assignments');
            }
        });
    }
    
    // Save question changes
    let questionsPromise = Promise.resolve();
    const hasQuestionChanges = changeTracker.pendingQuestionChanges.added.length > 0 ||
                               changeTracker.pendingQuestionChanges.deleted.length > 0 ||
                               Object.keys(changeTracker.pendingQuestionChanges.edited).length > 0;
    
    if (hasQuestionChanges) {
        questionsPromise = saveQuestionChanges();
    }
    
    // Save all changes, then navigate
    Promise.all([titlePromise, coursesPromise, questionsPromise])
        .then(() => {
            // Mark as saved
            changeTracker.markAsSaved();
            // Navigate after saving (flag will prevent beforeunload)
            setTimeout(() => {
                isSaving = false; // Reset flag after navigation starts
                navigateBack();
            }, 100);
        })
        .catch(error => {
            console.error('Error saving:', error);
            isSaving = false; // Reset flag on error
            updateSaveStatus('Error saving', 'error');
            showToast('Error saving changes: ' + error.message, 'error');
            // Don't navigate if save failed
        });
}

// Toggle actions menu
function toggleActionsMenu() {
    const menu = document.getElementById('actions-menu');
    menu.classList.toggle('hidden');
}

// Undo/Redo (placeholder)
function undoAction() {
    // TODO: Implement undo functionality
    console.log('Undo');
}

function redoAction() {
    // TODO: Implement redo functionality
    console.log('Redo');
}

// Close actions menu on outside click
document.addEventListener('click', function(event) {
    const menu = document.getElementById('actions-menu');
    const button = event.target.closest('[onclick="toggleActionsMenu()"]');
    
    if (!button && !menu.contains(event.target)) {
        menu.classList.add('hidden');
    }
});

// Store original checkbox states for course assignment modal
let originalCourseCheckboxStates = {};

// Course Assignment Modal Functions - Make sure it's globally accessible
window.openCourseAssignmentModal = function() {
    const modal = document.getElementById('course-assignment-modal');
    if (modal) {
        // Store original checkbox states before any changes
        const checkboxes = document.querySelectorAll('input[name="course-assignment"]');
        originalCourseCheckboxStates = {};
        checkboxes.forEach(checkbox => {
            originalCourseCheckboxStates[checkbox.value] = checkbox.checked;
        });
        
        modal.classList.remove('hidden');
        // Hide error message when opening
        const errorDiv = document.getElementById('course-assignment-error');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
        // Add event listeners to checkboxes to prevent unchecking the last one
        setupCourseCheckboxListeners();
    }
};

// Also define it as a regular function for backwards compatibility
function openCourseAssignmentModal() {
    window.openCourseAssignmentModal();
}

function setupCourseCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[name="course-assignment"]');
    // Remove any existing listeners by cloning and replacing (cleaner approach)
    checkboxes.forEach(checkbox => {
        // Store the original checked state handler
        const originalHandler = function() {
            const checkedCount = document.querySelectorAll('input[name="course-assignment"]:checked').length;
            if (checkedCount === 0 && this.checked === false) {
                // Prevent unchecking if this would be the last one
                this.checked = true;
                const errorDiv = document.getElementById('course-assignment-error');
                const errorText = errorDiv.querySelector('p');
                if (errorDiv && errorText) {
                    errorText.textContent = 'At least one course must be assigned to the survey.';
                    errorDiv.classList.remove('hidden');
                    // Hide error after 3 seconds
                    setTimeout(() => {
                        errorDiv.classList.add('hidden');
                    }, 3000);
                }
            } else {
                // Hide error if at least one is checked
                const errorDiv = document.getElementById('course-assignment-error');
                if (errorDiv) {
                    errorDiv.classList.add('hidden');
                }
            }
        };
        
        // Remove old listener if it exists (by replacing with new one)
        checkbox.onchange = null;
        checkbox.addEventListener('change', originalHandler);
    });
}

function closeCourseAssignmentModal() {
    const modal = document.getElementById('course-assignment-modal');
    if (modal) {
        // Restore original checkbox states
        const checkboxes = document.querySelectorAll('input[name="course-assignment"]');
        checkboxes.forEach(checkbox => {
            const originalState = originalCourseCheckboxStates[checkbox.value];
            if (originalState !== undefined) {
                checkbox.checked = originalState;
            }
        });
        
        modal.classList.add('hidden');
    }
}

function saveCourseAssignments() {
    const checkboxes = document.querySelectorAll('input[name="course-assignment"]:checked');
    const courseIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    // Validate: at least one course must be selected
    if (courseIds.length === 0) {
        const errorDiv = document.getElementById('course-assignment-error');
        const errorText = errorDiv.querySelector('p');
        if (errorDiv && errorText) {
            errorText.textContent = 'At least one course must be assigned to the survey.';
            errorDiv.classList.remove('hidden');
        }
        return;
    }
    
    // Hide error message
    const errorDiv = document.getElementById('course-assignment-error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
    
    // Update display immediately (temporary, not saved yet)
    updateCoursesDisplay(courseIds);
    
    // Track changes instead of saving immediately
    changeTracker.updateChangeStatus();
    
    // Close modal
    closeCourseAssignmentModal();
    
    // Show notification that changes are pending
    if (changeTracker.hasUnsavedChanges) {
        updateSaveStatus('Unsaved changes', 'unsaved');
    }
}

function updateCoursesDisplay(courseIds) {
    // Get course codes from checkboxes
    const courseCodes = [];
    courseIds.forEach(courseId => {
        const checkbox = document.querySelector(`input[name="course-assignment"][value="${courseId}"]`);
        if (checkbox) {
            const label = checkbox.closest('label');
            if (label) {
                const courseCode = label.querySelector('.text-sm.font-medium.text-gray-900');
                if (courseCode) {
                    courseCodes.push(courseCode.textContent.trim());
                }
            }
        }
    });
    
    const displayElement = document.getElementById('courses-display');
    if (displayElement) {
        if (courseCodes.length > 0) {
            // Clear existing content
            displayElement.innerHTML = '';
            // Add course code badges
            courseCodes.forEach(courseCode => {
                const badge = document.createElement('span');
                badge.className = 'inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium whitespace-nowrap';
                badge.textContent = courseCode;
                displayElement.appendChild(badge);
            });
        } else {
            displayElement.innerHTML = '<span class="text-gray-500">No courses assigned</span>';
        }
    }
}

// Close modal when clicking outside (on the backdrop) - restores checkbox states
document.addEventListener('click', function(event) {
    const modal = document.getElementById('course-assignment-modal');
    if (modal && !modal.classList.contains('hidden')) {
        const modalContent = modal.querySelector('.bg-white');
        const openBtn = document.getElementById('open-course-modal-btn');
        // Close if clicking on the backdrop (not on modal content or the button that opens it)
        if (event.target === modal && !modalContent.contains(event.target) && event.target !== openBtn && !openBtn.contains(event.target)) {
            // closeCourseAssignmentModal will restore the states, so just call it
            closeCourseAssignmentModal();
        }
    }
    
    // Close parameters modal when clicking outside
    const parametersModal = document.getElementById('parameters-modal');
    if (parametersModal && !parametersModal.classList.contains('hidden')) {
        const modalContent = parametersModal.querySelector('.bg-white');
        const openBtn = document.querySelector('[onclick="openParametersModal()"]');
        // Close if clicking on the backdrop (not on modal content or the button that opens it)
        if (event.target === parametersModal && !modalContent.contains(event.target) && event.target !== openBtn && !openBtn.contains(event.target)) {
            // closeParametersModal will restore the states, so just call it
            closeParametersModal();
        }
    }
});

// Survey Activation Functions
function activateSurvey() {
    // Show confirmation modal first
    document.getElementById('activation-confirmation-modal').classList.remove('hidden');
}

function closeActivationConfirmationModal() {
    document.getElementById('activation-confirmation-modal').classList.add('hidden');
}

function confirmActivationProceed() {
    // Close confirmation modal
    closeActivationConfirmationModal();
    
    // Proceed with activation
    const formData = new FormData();
    formData.append('action', 'activate');
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    fetch(`/api/survey/${surveyId}/status/toggle/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.requires_confirmation) {
                // Show warning modal for surveys with existing responses
                document.getElementById('response-count-display').textContent = data.response_count;
                document.getElementById('activation-warning-modal').classList.remove('hidden');
            } else {
                // Activate directly
                showToast(data.message || 'Survey activated successfully', 'success');
                // Reload page to update UI
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } else {
            showToast(data.error || 'Failed to activate survey', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error activating survey', 'error');
    });
}

function closeSurvey() {
    // Show confirmation modal
    document.getElementById('close-survey-modal').classList.remove('hidden');
}

function previewSurvey() {
    // Check for unsaved changes
    if (changeTracker.hasUnsavedChanges) {
        showToast('Please save or discard your changes before previewing the survey.', 'error');
        return;
    }
    
    // Open preview in new tab
    window.open(`/teacher/survey/${surveyId}/preview/`, '_blank');
}

function closeCloseSurveyModal() {
    document.getElementById('close-survey-modal').classList.add('hidden');
}

function confirmCloseSurvey() {
    // Close modal
    closeCloseSurveyModal();
    
    const formData = new FormData();
    formData.append('action', 'close');
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    fetch(`/api/survey/${surveyId}/status/toggle/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message || 'Survey closed successfully', 'success');
            // Reload page to update UI
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast(data.error || 'Failed to close survey', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error closing survey', 'error');
    });
}

function confirmActivateSurvey() {
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    fetch(`/api/survey/${surveyId}/status/confirm-activate/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeActivationWarningModal();
            showToast(data.message || 'Survey activated successfully', 'success');
            // Reload page to update UI and apply edit restrictions
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showToast(data.error || 'Failed to activate survey', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error activating survey', 'error');
    });
}

function closeActivationWarningModal() {
    document.getElementById('activation-warning-modal').classList.add('hidden');
}

// Edit Restrictions When Survey is Active or Has Responses
function applyEditRestrictions() {
    // Apply restrictions if survey is active (regardless of responses)
    // OR if survey was ever activated (not draft) AND has responses
    // If survey is draft, no restrictions
    if (typeof surveyStatus === 'undefined' || surveyStatus === 'draft') {
        return; // No restrictions if survey is draft
    }
    
    // Check if survey is active - block deletion regardless of responses
    const isActive = surveyStatus === 'active';
    // Check if survey has responses (for other restrictions)
    const hasResponsesCheck = typeof hasResponses !== 'undefined' && hasResponses;
    
    // Only apply restrictions if survey is active OR has responses
    if (!isActive && !hasResponsesCheck) {
        return; // No restrictions if survey is closed and has no responses
    }
    
    // Disable delete question buttons - REINFORCED (block if active OR has responses)
    if (isActive || hasResponsesCheck) {
    document.querySelectorAll('[onclick*="deleteQuestion"]').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
        const restrictionMessage = isActive 
            ? 'Cannot delete questions when survey is active' 
            : 'Cannot delete questions when survey has responses';
        btn.title = restrictionMessage;
        // Remove existing onclick and add click handler to show toast
        const originalOnclick = btn.getAttribute('onclick');
        btn.removeAttribute('onclick');
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showToast(restrictionMessage, 'error');
            return false;
        });
        // Store original onclick for potential restoration
        if (originalOnclick) {
            btn.setAttribute('data-original-onclick', originalOnclick);
        }
    });
    
    // Also disable delete buttons by class or data attribute
    document.querySelectorAll('.delete-question-btn, [data-action="delete-question"]').forEach(btn => {
        if (!btn.hasAttribute('data-restriction-handler')) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            const restrictionMessage = isActive 
                ? 'Cannot delete questions when survey is active' 
                : 'Cannot delete questions when survey has responses';
            btn.title = restrictionMessage;
            btn.setAttribute('data-restriction-handler', 'true');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showToast(restrictionMessage, 'error');
                return false;
            });
        }
    });
    }
    
    // Disable add question drag-and-drop (block if active OR has responses)
    if (isActive || hasResponsesCheck) {
        document.querySelectorAll('.component-item').forEach(item => {
            item.draggable = false;
            item.classList.add('opacity-50', 'cursor-not-allowed');
            const restrictionMessage = isActive 
                ? 'Cannot add questions when survey is active' 
                : 'Cannot add questions when survey has responses';
            item.title = restrictionMessage;
            // Add click/drag handlers to show toast
            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showToast(restrictionMessage, 'error');
            });
            item.addEventListener('dragstart', function(e) {
                e.preventDefault();
                showToast(restrictionMessage, 'error');
            });
        });
    }
    
    // Allow dragging but show toast and prevent reordering (block if active OR has responses)
    if (isActive || hasResponsesCheck) {
        document.querySelectorAll('.draggable-question').forEach(question => {
            // Keep draggable enabled, but prevent actual reordering
            // Don't blur the questions - keep them visible
            const restrictionMessage = isActive 
                ? 'Cannot reorder questions when survey is active' 
                : 'Cannot reorder questions when survey has responses';
            // Add dragstart handler to show toast and prevent drag
            question.addEventListener('dragstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showToast(restrictionMessage, 'error');
                return false;
            }, true); // Use capture phase to catch early
        });
    }
    
    // Monitor for question edit modal and disable type selector (only if has responses)
    if (hasResponsesCheck) {
        const observer = new MutationObserver(function(mutations) {
        const typeSelector = document.getElementById('question-type-select');
        if (typeSelector && !typeSelector.hasAttribute('data-restriction-handler')) {
            typeSelector.disabled = true;
            typeSelector.title = 'Cannot change question type when survey has responses';
            typeSelector.classList.add('opacity-50', 'cursor-not-allowed');
            typeSelector.setAttribute('data-restriction-handler', 'true');
            // Add change handler to show toast
            typeSelector.addEventListener('change', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // Reset to original value
                const originalValue = typeSelector.getAttribute('data-original-value');
                if (originalValue) {
                    typeSelector.value = originalValue;
                }
                showToast('Cannot change question type when survey has responses', 'error');
            });
            // Store original value
            if (!typeSelector.hasAttribute('data-original-value')) {
                typeSelector.setAttribute('data-original-value', typeSelector.value);
            }
        }
        
        // Disable option add/remove buttons
        document.querySelectorAll('[onclick="addOption()"]').forEach(btn => {
            if (!btn.hasAttribute('data-restriction-handler')) {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
                btn.title = 'Cannot add options when survey has responses';
                btn.setAttribute('data-restriction-handler', 'true');
                // Add click handler to show toast
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showToast('Cannot add options when survey has responses', 'error');
                });
            }
        });
        
        document.querySelectorAll('[onclick="removeOption"]').forEach(btn => {
            if (!btn.hasAttribute('data-restriction-handler')) {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
                btn.title = 'Cannot remove options when survey has responses';
                btn.setAttribute('data-restriction-handler', 'true');
                // Add click handler to show toast
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    showToast('Cannot remove options when survey has responses', 'error');
                });
            }
        });
        
        // Observe the question edit modal
        const modal = document.getElementById('question-edit-modal');
        if (modal) {
            observer.observe(modal, { childList: true, subtree: true });
        }
    });
    }
}

// REINFORCED: Override deleteQuestion to check for active status or responses
const originalDeleteQuestion = window.deleteQuestion;
window.deleteQuestion = function(questionId) {
    // Double-check restrictions before allowing deletion - block if active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        showToast('Cannot delete questions when survey is active', 'error');
        return false;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        showToast('Cannot delete questions when survey has responses', 'error');
        return false;
    }
    // Call original function if restrictions don't apply
    if (originalDeleteQuestion) {
        return originalDeleteQuestion(questionId);
    }
    return false;
};

// REINFORCED: Override addQuestion to check for active status or responses
const originalAddQuestion = window.addQuestion;
window.addQuestion = function(questionType, insertOrder) {
    // Double-check restrictions before allowing addition - block if active OR has responses
    if (typeof surveyStatus !== 'undefined' && surveyStatus === 'active') {
        showToast('Cannot add questions when survey is active', 'error');
        return;
    }
    if (typeof surveyStatus !== 'undefined' && surveyStatus !== 'draft' && 
        typeof hasResponses !== 'undefined' && hasResponses) {
        showToast('Cannot add questions when survey has responses', 'error');
        return;
    }
    if (originalAddQuestion) {
        originalAddQuestion(questionType, insertOrder);
    }
};

// REINFORCED: Apply restrictions on page load and monitor for dynamically added elements
function applyRestrictionsToNewElements() {
    if (typeof surveyStatus === 'undefined' || surveyStatus === 'draft') {
        return;
    }
    
    const isActive = surveyStatus === 'active';
    const hasResponsesCheck = typeof hasResponses !== 'undefined' && hasResponses;
    
    // Only apply delete restrictions if survey is active OR has responses
    if (!isActive && !hasResponsesCheck) {
        return;
    }
    
    // Re-apply delete button restrictions to any newly added buttons
    document.querySelectorAll('[onclick*="deleteQuestion"]:not([data-restriction-applied])').forEach(btn => {
        if (!btn.disabled) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            const restrictionMessage = isActive 
                ? 'Cannot delete questions when survey is active' 
                : 'Cannot delete questions when survey has responses';
            btn.title = restrictionMessage;
            const originalOnclick = btn.getAttribute('onclick');
            btn.removeAttribute('onclick');
            btn.setAttribute('data-restriction-applied', 'true');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                showToast(restrictionMessage, 'error');
                return false;
            });
            if (originalOnclick) {
                btn.setAttribute('data-original-onclick', originalOnclick);
            }
        }
    });
}

// Apply restrictions on page load
document.addEventListener('DOMContentLoaded', function() {
    applyEditRestrictions();
    
    // REINFORCED: Monitor for dynamically added delete buttons
    const questionsContainer = document.getElementById('questions-container');
    if (questionsContainer) {
        const restrictionObserver = new MutationObserver(function(mutations) {
            applyRestrictionsToNewElements();
        });
        restrictionObserver.observe(questionsContainer, {
            childList: true,
            subtree: true
        });
    }
});

