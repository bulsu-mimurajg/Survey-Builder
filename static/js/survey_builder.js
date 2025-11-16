// Survey Builder JavaScript

let draggedQuestionType = null;
let draggedElement = null;
let draggedQuestionId = null;
let draggedQuestionElement = null;
let autoScrollInterval = null;

// Drag and Drop Handlers for adding new questions
function handleDragStart(event, questionType) {
    draggedQuestionType = questionType;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    event.target.style.opacity = '0.5';
    
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
    draggedQuestionId = questionId;
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
});

// Handle dragging over a question
function handleQuestionDragOver(event) {
    if (!draggedQuestionId) return;
    
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const questionElement = event.currentTarget;
    const questionId = parseInt(questionElement.dataset.questionId);
    
    if (questionId !== draggedQuestionId) {
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
    
    const targetQuestionId = parseInt(event.currentTarget.dataset.questionId);
    
    if (draggedQuestionId && targetQuestionId !== draggedQuestionId) {
        reorderQuestions(draggedQuestionId, targetQuestionId);
    }
    
    // Clean up visual states
    const questions = document.querySelectorAll('.draggable-question');
    questions.forEach(q => {
        q.classList.remove('drag-over', 'border-indigo-400', 'bg-indigo-50');
    });
}

// Reorder questions
function reorderQuestions(draggedId, targetId) {
    const questions = Array.from(document.querySelectorAll('.draggable-question'));
    const draggedElement = questions.find(q => parseInt(q.dataset.questionId) === draggedId);
    const targetElement = questions.find(q => parseInt(q.dataset.questionId) === targetId);
    
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
    
    // Update order numbers and save
    updateQuestionOrders();
}

// Update question orders and save to backend
function updateQuestionOrders() {
    const questions = Array.from(document.querySelectorAll('.draggable-question'));
    const orders = questions.map((question, index) => ({
        question_id: parseInt(question.dataset.questionId),
        order: index
    }));
    
    fetch(`/api/survey/${surveyId}/questions/reorder/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orders: orders })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update question numbers
            questions.forEach((question, index) => {
                const qNumber = question.querySelector('.text-sm.font-medium.text-gray-500');
                if (qNumber) {
                    qNumber.textContent = `Question ${index + 1}`;
                }
            });
        } else {
            console.error('Error reordering questions:', data.error);
            // Reload on error to restore original order
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error reordering questions:', error);
        window.location.reload();
    });
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

// Add question
function addQuestion(questionType, insertOrder = null) {
    const formData = new FormData();
    formData.append('question_type', questionType);
    if (insertOrder !== null) {
        formData.append('insert_order', insertOrder);
    }
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    fetch(`/api/survey/${surveyId}/question/add/`, {
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
        if (data.success) {
            // Reload page to show new question
            window.location.reload();
        } else {
            alert('Error adding question: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error adding question:', error);
        alert('Error adding question: ' + error.message);
    });
}

// Edit question
function editQuestion(questionId) {
    fetch(`/api/survey/question/${questionId}/update/`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('question-edit-form').innerHTML = data.form_html;
            document.getElementById('question-edit-modal').classList.remove('hidden');
        } else {
            alert('Error loading question: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error loading question');
    });
}

// Delete question
function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
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
        if (data.success) {
            // Remove the question element from DOM
            const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
            if (questionElement) {
                questionElement.remove();
                // Renumber remaining questions
                renumberQuestions();
            } else {
                // If element not found, reload page
                window.location.reload();
            }
        } else {
            alert('Error deleting question: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting question: ' + error.message);
    });
}

// Renumber questions after deletion
function renumberQuestions() {
    const questions = Array.from(document.querySelectorAll('.draggable-question'));
    questions.forEach((question, index) => {
        const qNumber = question.querySelector('.text-sm.font-medium.text-gray-500');
        if (qNumber) {
            qNumber.textContent = `Question ${index + 1}`;
        }
    });
}

// Save question
function saveQuestion(questionId) {
    const form = document.getElementById('question-edit-form').querySelector('form');
    const formData = new FormData(form);
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    fetch(`/api/survey/question/${questionId}/update/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeQuestionModal();
            window.location.reload();
        } else {
            alert('Error saving question: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving question');
    });
}

// Close question modal
function closeQuestionModal() {
    document.getElementById('question-edit-modal').classList.add('hidden');
}

// Update survey title
function updateSurveyTitle() {
    const titleInput = document.getElementById('survey-title');
    if (!titleInput) return;
    
    const newTitle = titleInput.value.trim();
    const originalTitle = titleInput.getAttribute('data-original-value') || titleInput.value;
    
    if (!newTitle) {
        titleInput.value = originalTitle;
        return;
    }
    
    if (newTitle === originalTitle) {
        return; // No change
    }
    
    updateSaveStatus('Saving...', 'saving');
    
    const formData = new FormData();
    formData.append('title', newTitle);
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
            // Success - title was saved
            titleInput.setAttribute('data-original-value', newTitle);
            updateSaveStatus('All changes saved', 'success');
        } else {
            updateSaveStatus('Error saving title', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        updateSaveStatus('Error saving title', 'error');
    });
}

// Save survey
function saveSurvey() {
    // First save the title if it was changed
    const titleInput = document.getElementById('survey-title');
    if (titleInput) {
        const newTitle = titleInput.value.trim();
        const originalTitle = titleInput.getAttribute('data-original-value') || titleInput.value;
        if (newTitle !== originalTitle && newTitle) {
            // Save title first, then continue with general save
            updateSaveStatus('Saving...', 'saving');
            const formData = new FormData();
            formData.append('title', newTitle);
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
                    titleInput.setAttribute('data-original-value', newTitle);
                    // Continue with general save
                    performSave();
                } else {
                    updateSaveStatus('Error saving', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                updateSaveStatus('Error saving', 'error');
            });
            return;
        }
    }
    
    // If no title change, just perform the save
    performSave();
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
    saveStatus.classList.remove('text-yellow-600', 'text-green-600', 'text-red-600', 'text-gray-500');
    
    // Add appropriate class based on status
    switch(status) {
        case 'saving':
            saveStatus.classList.add('text-yellow-600');
            break;
        case 'success':
            saveStatus.classList.add('text-green-600');
            setTimeout(() => {
                saveStatus.classList.remove('text-green-600');
                saveStatus.classList.add('text-gray-500');
                saveStatus.textContent = 'All changes saved';
            }, 2000);
            break;
        case 'error':
            saveStatus.classList.add('text-red-600');
            setTimeout(() => {
                saveStatus.classList.remove('text-red-600');
                saveStatus.classList.add('text-gray-500');
                saveStatus.textContent = 'All changes saved';
            }, 3000);
            break;
        default:
            saveStatus.classList.add('text-gray-500');
    }
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

