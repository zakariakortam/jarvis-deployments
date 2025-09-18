// HR Engineering Manager Application
class HRManager {
    constructor() {
        this.employees = JSON.parse(localStorage.getItem('employees')) || [];
        this.performanceReviews = JSON.parse(localStorage.getItem('performanceReviews')) || [];
        this.timeOffRequests = JSON.parse(localStorage.getItem('timeOffRequests')) || [];
        this.projects = JSON.parse(localStorage.getItem('projects')) || [];
        
        this.init();
    }

    init() {
        this.updateDashboardStats();
        this.renderEmployees();
        this.renderPerformanceTable();
        this.renderTimeOffRequests();
        this.renderProjects();
        this.setupEventListeners();
        this.populateDropdowns();
        
        // Show dashboard by default
        showSection('dashboard');
    }

    // Data Management
    saveData() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
        localStorage.setItem('performanceReviews', JSON.stringify(this.performanceReviews));
        localStorage.setItem('timeOffRequests', JSON.stringify(this.timeOffRequests));
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    addEmployee(employeeData) {
        const employee = {
            id: Date.now().toString(),
            ...employeeData,
            createdAt: new Date().toISOString(),
            avatar: this.generateAvatar(employeeData.firstName, employeeData.lastName)
        };
        
        this.employees.push(employee);
        this.saveData();
        this.updateDashboardStats();
        this.renderEmployees();
        this.populateDropdowns();
        this.addActivity(`Added new employee: ${employee.firstName} ${employee.lastName}`);
        
        return employee;
    }

    updateEmployee(id, updateData) {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.employees[index] = { ...this.employees[index], ...updateData };
            this.saveData();
            this.renderEmployees();
            this.addActivity(`Updated employee: ${this.employees[index].firstName} ${this.employees[index].lastName}`);
        }
    }

    deleteEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            this.employees = this.employees.filter(emp => emp.id !== id);
            this.saveData();
            this.updateDashboardStats();
            this.renderEmployees();
            this.populateDropdowns();
            this.addActivity(`Removed employee: ${employee.firstName} ${employee.lastName}`);
        }
    }

    addPerformanceReview(reviewData) {
        const review = {
            id: Date.now().toString(),
            ...reviewData,
            createdAt: new Date().toISOString(),
            overallRating: this.calculateOverallRating(reviewData)
        };
        
        this.performanceReviews.push(review);
        this.saveData();
        this.renderPerformanceTable();
        this.updateDashboardStats();
        
        const employee = this.employees.find(emp => emp.id === reviewData.employeeId);
        this.addActivity(`Performance review completed for ${employee?.firstName} ${employee?.lastName}`);
        
        return review;
    }

    addTimeOffRequest(requestData) {
        const request = {
            id: Date.now().toString(),
            ...requestData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.timeOffRequests.push(request);
        this.saveData();
        this.renderTimeOffRequests();
        this.updateDashboardStats();
        
        const employee = this.employees.find(emp => emp.id === requestData.employeeId);
        this.addActivity(`Time off request submitted by ${employee?.firstName} ${employee?.lastName}`);
        
        return request;
    }

    updateTimeOffStatus(id, status) {
        const request = this.timeOffRequests.find(req => req.id === id);
        if (request) {
            request.status = status;
            this.saveData();
            this.renderTimeOffRequests();
            this.updateDashboardStats();
            
            const employee = this.employees.find(emp => emp.id === request.employeeId);
            this.addActivity(`Time off request ${status} for ${employee?.firstName} ${employee?.lastName}`);
        }
    }

    addProject(projectData) {
        const project = {
            id: Date.now().toString(),
            ...projectData,
            status: 'active',
            progress: 0,
            createdAt: new Date().toISOString()
        };
        
        this.projects.push(project);
        this.saveData();
        this.renderProjects();
        this.updateDashboardStats();
        this.addActivity(`New project created: ${project.name}`);
        
        return project;
    }

    // Utility Functions
    generateAvatar(firstName, lastName) {
        return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
    }

    calculateOverallRating(reviewData) {
        const ratings = [
            reviewData.technical || 0,
            reviewData.communication || 0,
            reviewData.problemSolving || 0,
            reviewData.teamwork || 0
        ].filter(rating => rating > 0);
        
        return ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 0;
    }

    addActivity(message) {
        const activityList = document.getElementById('activityList');
        const listItem = document.createElement('li');
        listItem.textContent = `${new Date().toLocaleString()}: ${message}`;
        activityList.insertBefore(listItem, activityList.firstChild);
        
        // Keep only the last 10 activities
        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    // Dashboard Updates
    updateDashboardStats() {
        document.getElementById('totalEmployees').textContent = this.employees.length;
        document.getElementById('activeProjects').textContent = this.projects.filter(p => p.status === 'active').length;
        document.getElementById('pendingTimeOff').textContent = this.timeOffRequests.filter(r => r.status === 'pending').length;
        
        const avgRating = this.performanceReviews.length > 0 
            ? (this.performanceReviews.reduce((sum, review) => sum + parseFloat(review.overallRating || 0), 0) / this.performanceReviews.length).toFixed(1)
            : '0.0';
        document.getElementById('avgPerformance').textContent = avgRating;
    }

    // Rendering Functions
    renderEmployees() {
        const grid = document.getElementById('employeesGrid');
        grid.innerHTML = '';
        
        this.employees.forEach(employee => {
            const card = this.createEmployeeCard(employee);
            grid.appendChild(card);
        });
    }

    createEmployeeCard(employee) {
        const card = document.createElement('div');
        card.className = 'employee-card';
        
        const skills = employee.skills ? employee.skills.split(',').map(s => s.trim()) : [];
        
        card.innerHTML = `
            <div class="employee-header">
                <div class="employee-avatar">${employee.avatar}</div>
                <div class="employee-info">
                    <h3>${employee.firstName} ${employee.lastName}</h3>
                    <p>${employee.position} - ${employee.department}</p>
                </div>
            </div>
            <div class="employee-details">
                <div><strong>Email:</strong> <span>${employee.email}</span></div>
                <div><strong>Start Date:</strong> <span>${new Date(employee.startDate).toLocaleDateString()}</span></div>
                <div><strong>Salary:</strong> <span>$${employee.salary ? employee.salary.toLocaleString() : 'N/A'}</span></div>
            </div>
            <div class="employee-skills">
                ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            <div class="employee-actions">
                <button class="edit-btn" onclick="editEmployee('${employee.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteEmployee('${employee.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        return card;
    }

    renderPerformanceTable() {
        const tbody = document.getElementById('performanceTableBody');
        tbody.innerHTML = '';
        
        this.employees.forEach(employee => {
            const latestReview = this.performanceReviews
                .filter(review => review.employeeId === employee.id)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="employee-avatar" style="width: 30px; height: 30px; font-size: 0.8rem;">
                            ${employee.avatar}
                        </div>
                        ${employee.firstName} ${employee.lastName}
                    </div>
                </td>
                <td>${employee.department}</td>
                <td>${latestReview ? new Date(latestReview.createdAt).toLocaleDateString() : 'No reviews'}</td>
                <td>
                    <span class="rating">${latestReview ? '★'.repeat(Math.round(latestReview.overallRating)) : 'N/A'}</span>
                    ${latestReview ? latestReview.overallRating : ''}
                </td>
                <td>
                    <span class="rating">${latestReview ? '★'.repeat(Math.round(latestReview.technical)) : 'N/A'}</span>
                </td>
                <td>
                    <span class="rating">${latestReview ? '★'.repeat(Math.round(latestReview.communication)) : 'N/A'}</span>
                </td>
                <td>
                    <button class="btn-primary" onclick="showPerformanceReviewModal('${employee.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                        <i class="fas fa-plus"></i> Review
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderTimeOffRequests() {
        const container = document.getElementById('pendingRequests');
        container.innerHTML = '';
        
        const pendingRequests = this.timeOffRequests.filter(request => request.status === 'pending');
        
        if (pendingRequests.length === 0) {
            container.innerHTML = '<p class="text-center" style="color: #7f8c8d; padding: 2rem;">No pending time off requests</p>';
            return;
        }
        
        pendingRequests.forEach(request => {
            const employee = this.employees.find(emp => emp.id === request.employeeId);
            if (!employee) return;
            
            const requestElement = document.createElement('div');
            requestElement.className = 'timeoff-request';
            
            const startDate = new Date(request.startDate).toLocaleDateString();
            const endDate = new Date(request.endDate).toLocaleDateString();
            const duration = Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            
            requestElement.innerHTML = `
                <div class="request-info">
                    <h4>${employee.firstName} ${employee.lastName}</h4>
                    <p><strong>Type:</strong> ${request.type}</p>
                    <p><strong>Duration:</strong> ${startDate} - ${endDate} (${duration} days)</p>
                    <p><strong>Reason:</strong> ${request.reason || 'No reason provided'}</p>
                    <p><strong>Requested:</strong> ${new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="request-actions">
                    <button class="approve-btn" onclick="hrManager.updateTimeOffStatus('${request.id}', 'approved')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="reject-btn" onclick="hrManager.updateTimeOffStatus('${request.id}', 'rejected')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
            
            container.appendChild(requestElement);
        });
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        grid.innerHTML = '';
        
        this.projects.forEach(project => {
            const card = this.createProjectCard(project);
            grid.appendChild(card);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        const teamMembers = project.teamMembers || [];
        const startDate = new Date(project.startDate).toLocaleDateString();
        const endDate = new Date(project.endDate).toLocaleDateString();
        
        card.innerHTML = `
            <div class="project-header">
                <div>
                    <h3>${project.name}</h3>
                    <p style="color: #7f8c8d; font-size: 0.9rem;">${project.description || 'No description'}</p>
                </div>
                <span class="priority-badge priority-${project.priority?.toLowerCase() || 'medium'}">${project.priority || 'Medium'}</span>
            </div>
            <div class="project-progress">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Progress</span>
                    <span>${project.progress || 0}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                </div>
            </div>
            <div class="project-team">
                ${teamMembers.map(memberId => {
                    const member = this.employees.find(emp => emp.id === memberId);
                    return member ? `<div class="team-member-avatar" title="${member.firstName} ${member.lastName}">${member.avatar}</div>` : '';
                }).join('')}
            </div>
            <div style="font-size: 0.9rem; color: #7f8c8d;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                    <span>Start:</span> <span>${startDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>End:</span> <span>${endDate}</span>
                </div>
            </div>
        `;
        
        return card;
    }

    // Dropdown Population
    populateDropdowns() {
        const employeeDropdowns = ['reviewEmployee', 'timeOffEmployee'];
        
        employeeDropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;
            
            // Clear existing options except the first one
            while (dropdown.children.length > 1) {
                dropdown.removeChild(dropdown.lastChild);
            }
            
            this.employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = `${employee.firstName} ${employee.lastName}`;
                dropdown.appendChild(option);
            });
        });
        
        // Populate project team member checkboxes
        this.populateProjectTeamMembers();
    }

    populateProjectTeamMembers() {
        const container = document.getElementById('projectTeamMembers');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.employees.forEach(employee => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${employee.id}">
                ${employee.firstName} ${employee.lastName}
            `;
            container.appendChild(label);
        });
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Employee form
        const employeeForm = document.getElementById('employeeForm');
        if (employeeForm) {
            employeeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const employeeData = Object.fromEntries(formData.entries());
                
                this.addEmployee(employeeData);
                closeModal('addEmployeeModal');
                e.target.reset();
                showAlert('Employee added successfully!', 'success');
            });
        }

        // Performance review form
        const performanceForm = document.getElementById('performanceForm');
        if (performanceForm) {
            performanceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const reviewData = Object.fromEntries(formData.entries());
                
                // Get ratings from star ratings
                const ratings = {};
                document.querySelectorAll('.rating-stars').forEach(ratingGroup => {
                    const ratingType = ratingGroup.dataset.rating;
                    const activeStars = ratingGroup.querySelectorAll('span.active').length;
                    ratings[ratingType] = activeStars;
                });
                
                const finalReviewData = { ...reviewData, ...ratings };
                this.addPerformanceReview(finalReviewData);
                closeModal('performanceReviewModal');
                e.target.reset();
                this.resetStarRatings();
                showAlert('Performance review saved successfully!', 'success');
            });
        }

        // Time off form
        const timeOffForm = document.getElementById('timeOffForm');
        if (timeOffForm) {
            timeOffForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const requestData = Object.fromEntries(formData.entries());
                
                this.addTimeOffRequest(requestData);
                closeModal('timeOffModal');
                e.target.reset();
                showAlert('Time off request submitted successfully!', 'success');
            });
        }

        // Project form
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const projectData = Object.fromEntries(formData.entries());
                
                // Get selected team members
                const selectedMembers = Array.from(document.querySelectorAll('#projectTeamMembers input:checked'))
                    .map(checkbox => checkbox.value);
                projectData.teamMembers = selectedMembers;
                
                this.addProject(projectData);
                closeModal('projectModal');
                e.target.reset();
                showAlert('Project created successfully!', 'success');
            });
        }

        // Star rating functionality
        document.querySelectorAll('.rating-stars').forEach(ratingGroup => {
            const stars = ratingGroup.querySelectorAll('span');
            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i <= index);
                    });
                });
                
                star.addEventListener('mouseover', () => {
                    stars.forEach((s, i) => {
                        s.style.color = i <= index ? '#f39c12' : '#ddd';
                    });
                });
            });
            
            ratingGroup.addEventListener('mouseleave', () => {
                stars.forEach((star, index) => {
                    star.style.color = star.classList.contains('active') ? '#f39c12' : '#ddd';
                });
            });
        });
    }

    resetStarRatings() {
        document.querySelectorAll('.rating-stars span').forEach(star => {
            star.classList.remove('active');
            star.style.color = '#ddd';
        });
    }

    // Search and Filter Functions
    searchEmployees() {
        const searchTerm = document.getElementById('employeeSearch').value.toLowerCase();
        const cards = document.querySelectorAll('.employee-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    }

    filterEmployees() {
        const department = document.getElementById('departmentFilter').value;
        const cards = document.querySelectorAll('.employee-card');
        
        cards.forEach(card => {
            if (!department) {
                card.style.display = 'block';
            } else {
                const cardDepartment = card.querySelector('.employee-info p').textContent;
                card.style.display = cardDepartment.includes(department) ? 'block' : 'none';
            }
        });
    }
}

// Global Functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function showAddEmployeeModal() {
    document.getElementById('addEmployeeModal').classList.add('active');
}

function showPerformanceReviewModal(employeeId) {
    const modal = document.getElementById('performanceReviewModal');
    modal.classList.add('active');
    
    if (employeeId) {
        document.getElementById('reviewEmployee').value = employeeId;
    }
}

function showTimeOffModal() {
    document.getElementById('timeOffModal').classList.add('active');
}

function showProjectModal() {
    document.getElementById('projectModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function editEmployee(id) {
    const employee = hrManager.employees.find(emp => emp.id === id);
    if (!employee) return;
    
    // Populate form with employee data
    const form = document.getElementById('employeeForm');
    Object.keys(employee).forEach(key => {
        const input = form.querySelector(`#${key}`);
        if (input) {
            input.value = employee[key];
        }
    });
    
    // Change form submission to update instead of create
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const employeeData = Object.fromEntries(formData.entries());
        
        hrManager.updateEmployee(id, employeeData);
        closeModal('addEmployeeModal');
        form.reset();
        form.onsubmit = null; // Reset to default behavior
        showAlert('Employee updated successfully!', 'success');
    };
    
    showAddEmployeeModal();
}

function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        hrManager.deleteEmployee(id);
        showAlert('Employee deleted successfully!', 'success');
    }
}

function showTimeOffTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const content = document.getElementById('timeOffContent');
    
    switch (tabName) {
        case 'pending':
            hrManager.renderTimeOffRequests();
            break;
        case 'approved':
            renderApprovedTimeOff();
            break;
        case 'calendar':
            renderTimeOffCalendar();
            break;
    }
}

function renderApprovedTimeOff() {
    const container = document.getElementById('timeOffContent');
    const approvedRequests = hrManager.timeOffRequests.filter(request => request.status === 'approved');
    
    if (approvedRequests.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: #7f8c8d; padding: 2rem;">No approved time off requests</p>';
        return;
    }
    
    let html = '<div>';
    approvedRequests.forEach(request => {
        const employee = hrManager.employees.find(emp => emp.id === request.employeeId);
        if (!employee) return;
        
        const startDate = new Date(request.startDate).toLocaleDateString();
        const endDate = new Date(request.endDate).toLocaleDateString();
        
        html += `
            <div class="timeoff-request">
                <div class="request-info">
                    <h4>${employee.firstName} ${employee.lastName}</h4>
                    <p><strong>Type:</strong> ${request.type}</p>
                    <p><strong>Duration:</strong> ${startDate} - ${endDate}</p>
                    <p><strong>Reason:</strong> ${request.reason || 'No reason provided'}</p>
                </div>
                <div class="request-actions">
                    <span style="color: #27ae60; font-weight: bold;"><i class="fas fa-check"></i> Approved</span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function renderTimeOffCalendar() {
    const container = document.getElementById('timeOffContent');
    container.innerHTML = `
        <div class="text-center" style="padding: 2rem;">
            <h3>Team Calendar View</h3>
            <p style="color: #7f8c8d; margin-top: 1rem;">Calendar integration coming soon...</p>
            <i class="fas fa-calendar-alt" style="font-size: 4rem; color: #667eea; margin-top: 2rem;"></i>
        </div>
    `;
}

function generateReport() {
    const report = {
        timestamp: new Date().toISOString(),
        totalEmployees: hrManager.employees.length,
        departments: {},
        performanceStats: {},
        timeOffStats: {},
        projectStats: {}
    };
    
    // Department breakdown
    hrManager.employees.forEach(emp => {
        report.departments[emp.department] = (report.departments[emp.department] || 0) + 1;
    });
    
    // Performance stats
    if (hrManager.performanceReviews.length > 0) {
        const avgRating = hrManager.performanceReviews.reduce((sum, review) => sum + parseFloat(review.overallRating || 0), 0) / hrManager.performanceReviews.length;
        report.performanceStats.averageRating = avgRating.toFixed(2);
        report.performanceStats.totalReviews = hrManager.performanceReviews.length;
    }
    
    // Time off stats
    report.timeOffStats.pending = hrManager.timeOffRequests.filter(r => r.status === 'pending').length;
    report.timeOffStats.approved = hrManager.timeOffRequests.filter(r => r.status === 'approved').length;
    report.timeOffStats.rejected = hrManager.timeOffRequests.filter(r => r.status === 'rejected').length;
    
    // Project stats
    report.projectStats.total = hrManager.projects.length;
    report.projectStats.active = hrManager.projects.filter(p => p.status === 'active').length;
    
    console.log('Generated Report:', report);
    showAlert('Report generated! Check console for details.', 'success');
    
    return report;
}

function exportReport() {
    const report = generateReport();
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `hr-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('Report exported successfully!', 'success');
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Modal click outside to close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Initialize the application
let hrManager;
document.addEventListener('DOMContentLoaded', () => {
    hrManager = new HRManager();
});

// Add some sample data for demonstration
function addSampleData() {
    if (hrManager.employees.length === 0) {
        // Sample employees
        hrManager.addEmployee({
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@company.com',
            department: 'Frontend',
            position: 'Senior Frontend Developer',
            startDate: '2023-01-15',
            salary: '95000',
            skills: 'React, JavaScript, TypeScript, CSS, HTML'
        });
        
        hrManager.addEmployee({
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@company.com',
            department: 'Backend',
            position: 'Backend Developer',
            startDate: '2023-03-01',
            salary: '88000',
            skills: 'Node.js, Python, PostgreSQL, MongoDB, Docker'
        });
        
        hrManager.addEmployee({
            firstName: 'Mike',
            lastName: 'Davis',
            email: 'mike.davis@company.com',
            department: 'DevOps',
            position: 'DevOps Engineer',
            startDate: '2022-11-20',
            salary: '92000',
            skills: 'AWS, Kubernetes, Docker, Jenkins, Terraform'
        });
        
        hrManager.addEmployee({
            firstName: 'Emily',
            lastName: 'Wilson',
            email: 'emily.wilson@company.com',
            department: 'Mobile',
            position: 'Mobile Developer',
            startDate: '2023-06-10',
            salary: '86000',
            skills: 'React Native, iOS, Android, Swift, Kotlin'
        });
        
        hrManager.addEmployee({
            firstName: 'David',
            lastName: 'Brown',
            email: 'david.brown@company.com',
            department: 'QA',
            position: 'QA Engineer',
            startDate: '2023-02-28',
            salary: '75000',
            skills: 'Selenium, Jest, Cypress, Test Automation'
        });
    }
}

// Add sample data after a short delay to allow the UI to initialize
setTimeout(addSampleData, 1000);