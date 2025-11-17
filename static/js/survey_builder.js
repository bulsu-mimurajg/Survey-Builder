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
    
    // Update question numbers in DOM
    questions.forEach((question, index) => {
        const qNumber = question.querySelector('.text-sm.font-medium.text-gray-500');
        if (qNumber) {
            qNumber.textContent = `Question ${index + 1}`;
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
        'short_text': 'short text',
        'long_text': 'long text',
        'multiple_choice': 'multiple choice',
        'checkboxes': 'checkboxes',
        'dropdown': 'dropdown',
        'rating': 'rating',
        'scale': 'scale'
    };
    
    questionDiv.innerHTML = `
        <div class="flex items-start justify-between mb-2">
            <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-500">Question ${container.querySelectorAll('.draggable-question').length + 1}</span>
                <span class="text-xs text-gray-400 question-type-badge">${typeLabels[questionType] || questionType.replace('_', ' ')}</span>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="editQuestion('${tempId}')" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button onclick="deleteQuestion('${tempId}')" class="text-gray-400 hover:text-red-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
        <p class="text-gray-700">New Question</p>
    `;
    
    // Insert at correct position
    const existingQuestions = container.querySelectorAll('.draggable-question');
    if (insertOrder !== null && insertOrder < existingQuestions.length) {
        container.insertBefore(questionDiv, existingQuestions[insertOrder]);
    } else {
        container.appendChild(questionDiv);
    }
    
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
            // Create form with question type selector
            const questionTypes = [
                {value: 'short_text', label: 'Short Text'},
                {value: 'long_text', label: 'Long Text'},
                {value: 'multiple_choice', label: 'Multiple Choice'},
                {value: 'checkboxes', label: 'Checkboxes'},
                {value: 'dropdown', label: 'Dropdown'},
                {value: 'rating', label: 'Rating'},
                {value: 'scale', label: 'Scale'}
            ];
            
            const currentType = addedQuestion.type || 'short_text';
            const currentText = addedQuestion.text || 'New Question';
            const currentRequired = addedQuestion.required || false;
            const currentOptions = addedQuestion.options || [];
            const currentSettings = addedQuestion.settings || {};
            
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
                            <input type="number" name="scale_min" id="scale_min" min="0" max="100" 
                                   value="${currentSettings.min || 1}" 
                                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                        </div>
                        <div>
                            <label for="scale_max" class="block mb-2 text-sm font-medium text-gray-900">Maximum Value</label>
                            <input type="number" name="scale_max" id="scale_max" min="1" max="100" 
                                   value="${currentSettings.max || 10}" 
                                   class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                        </div>
                        <p class="text-xs text-gray-500">Numeric range from minimum to maximum value</p>
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
                                Save
                            </button>
                        </div>
                    </div>
                </form>
                <script>
                    function addOption() {
                        const container = document.getElementById('options-list');
                        const optionDiv = document.createElement('div');
                        optionDiv.className = 'flex items-center space-x-2 option-item';
                        optionDiv.innerHTML = \`
                            <input type="text" name="options[]" 
                                   class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5" 
                                   placeholder="Option text" required>
                            <button type="button" onclick="removeOption(this)" class="text-red-600 hover:text-red-800">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        \`;
                        container.appendChild(optionDiv);
                    }
                    function removeOption(button) {
                        button.closest('.option-item').remove();
                    }
                </script>
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
                alert('Error loading question: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading question');
        });
    }
}

// Delete question (temporary, not saved to backend)
function deleteQuestion(questionId) {
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
    
    // Track changes
    changeTracker.updateChangeStatus();
    if (changeTracker.hasUnsavedChanges) {
        updateSaveStatus('Unsaved changes', 'unsaved');
    }
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
                    <input type="number" name="scale_min" id="scale_min" min="0" max="100" value="1" 
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                </div>
                <div>
                    <label for="scale_max" class="block mb-2 text-sm font-medium text-gray-900">Maximum Value</label>
                    <input type="number" name="scale_max" id="scale_max" min="1" max="100" value="10" 
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required>
                </div>
                <p class="text-xs text-gray-500">Numeric range from minimum to maximum value</p>
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
            } else {
                addedQuestion.settings = {};
            }
            
            addedQuestion.data = questionData;
            
            // Update the question display in DOM
            const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
            if (questionElement) {
                const questionText = questionData.question_text || 'New Question';
                const textElement = questionElement.querySelector('.text-gray-700');
                if (textElement) {
                    textElement.textContent = questionText;
                }
                // Update type badge
                const typeBadge = questionElement.querySelector('.text-xs.text-gray-400');
                if (typeBadge) {
                    const typeLabels = {
                        'short_text': 'short text',
                        'long_text': 'long text',
                        'multiple_choice': 'multiple choice',
                        'checkboxes': 'checkboxes',
                        'dropdown': 'dropdown',
                        'rating': 'rating',
                        'scale': 'scale'
                    };
                    typeBadge.textContent = typeLabels[newType] || newType.replace('_', ' ');
                }
            }
        }
    } else {
        // Store as edited
        changeTracker.pendingQuestionChanges.edited[questionId] = questionData;
    }
    
    closeQuestionModal();
    
    // Track changes
    changeTracker.updateChangeStatus();
    if (changeTracker.hasUnsavedChanges) {
        updateSaveStatus('Unsaved changes', 'unsaved');
    }
}

// Close question modal
function closeQuestionModal() {
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
        const saveButton = document.querySelector('button[onclick="saveSurvey()"]');
        if (saveButton) {
            if (this.hasUnsavedChanges) {
                saveButton.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
                saveButton.classList.add('bg-orange-500', 'hover:bg-orange-600');
            } else {
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
    const hasQuestionChanges = changeTracker.pendingQuestionChanges.added.length > 0 ||
                               changeTracker.pendingQuestionChanges.deleted.length > 0 ||
                               Object.keys(changeTracker.pendingQuestionChanges.edited).length > 0;
    
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
                window.location.reload();
            }, 500);
        })
        .catch(error => {
            console.error('Error saving:', error);
            isSaving = false; // Reset flag on error
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
    
        // Save added questions
        for (const addedQuestion of changeTracker.pendingQuestionChanges.added) {
            const formData = new FormData();
            formData.append('question_type', addedQuestion.type);
            formData.append('insert_order', addedQuestion.order);
            formData.append('csrfmiddlewaretoken', csrfToken);
            
            promises.push(
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
                    if (!data.success) {
                        throw new Error(data.error || 'Failed to add question');
                    }
                    const newQuestionId = data.question_id;
                    
                    // Now update the question with all its data (text, required, options, settings)
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
                    });
                })
            );
        }
    
    // Save edited questions
    for (const [questionId, questionData] of Object.entries(changeTracker.pendingQuestionChanges.edited)) {
        // Skip if question was deleted
        if (changeTracker.pendingQuestionChanges.deleted.includes(parseInt(questionId))) {
            continue;
        }
        promises.push(saveQuestionEdit(questionId, questionData));
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
    
    // Save reordering
    const currentState = changeTracker.getCurrentQuestionState();
    const originalOrder = changeTracker.originalQuestionState.order.map(o => String(o.questionId));
    const currentOrder = currentState.order.map(o => String(o.questionId));
    
    if (JSON.stringify(originalOrder) !== JSON.stringify(currentOrder)) {
        const orders = currentState.order.map((item, index) => {
            const questionId = item.questionId;
            // Skip temp IDs (they'll be real IDs after being added)
            if (String(questionId).startsWith('temp-')) {
                return null;
            }
            return {
                question_id: parseInt(questionId),
                order: index
            };
        }).filter(o => o !== null);
        
        if (orders.length > 0) {
            promises.push(
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
                    if (!data.success) {
                        throw new Error(data.error || 'Failed to reorder questions');
                    }
                })
            );
        }
    }
    
    return Promise.all(promises);
}

function saveQuestionEdit(questionId, questionData) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(questionData)) {
        if (key !== 'csrfmiddlewaretoken') {
            formData.append(key, value);
        }
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
});

