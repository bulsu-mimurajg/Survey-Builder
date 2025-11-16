// Survey Builder JavaScript

let draggedQuestionType = null;
let draggedElement = null;

// Drag and Drop Handlers
function handleDragStart(event, questionType) {
    draggedQuestionType = questionType;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.outerHTML);
    event.target.style.opacity = '0.5';
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50');
    
    if (draggedQuestionType) {
        addQuestion(draggedQuestionType);
    }
    
    draggedQuestionType = null;
}

// Initialize drag and drop
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('survey-canvas');
    if (canvas) {
        canvas.addEventListener('dragover', handleDragOver);
        canvas.addEventListener('dragleave', handleDragLeave);
        canvas.addEventListener('drop', handleDrop);
    }
});

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
function addQuestion(questionType) {
    const formData = new FormData();
    formData.append('question_type', questionType);
    formData.append('csrfmiddlewaretoken', csrfToken);
    
    fetch(`/api/survey/${surveyId}/question/add/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reload page to show new question
            window.location.reload();
        } else {
            alert('Error adding question: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding question');
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            alert('Error deleting question: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting question');
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

// Save survey
function saveSurvey() {
    const saveStatus = document.getElementById('save-status');
    saveStatus.textContent = 'Saving...';
    saveStatus.classList.add('text-yellow-600');
    
    fetch(`/api/survey/${surveyId}/save/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            saveStatus.textContent = 'All changes saved';
            saveStatus.classList.remove('text-yellow-600');
            saveStatus.classList.add('text-green-600');
            setTimeout(() => {
                saveStatus.classList.remove('text-green-600');
            }, 2000);
        } else {
            saveStatus.textContent = 'Error saving';
            saveStatus.classList.add('text-red-600');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        saveStatus.textContent = 'Error saving';
        saveStatus.classList.add('text-red-600');
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

