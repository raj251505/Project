

// Interests and skills data
const interests = [
    "Technology", "Healthcare", "Business", "Education", "Arts", 
    "Science", "Engineering", "Marketing", "Finance", "Design", "Data", "AI",
    "Writing", "Research", "Management", "Sales", "Analytics",
    "Psychology", "Mathematics", "Problem Solving", "Creativity", "Strategy", "Innovation"
];

const skills = [
    "Programming", "Data Analysis", "Project Management", "Communication", "EHR Systems", "Data Management", 
    "Leadership", "Creativity", "Critical Thinking", "IT Skills", "Healthcare Regulations",
    "Teamwork", "Time Management", "Public Speaking", "Writing", "Machine Learning", "Python", "Deep Learning",
    "Research", "Design", "Marketing", "Sales", "Customer Service", "Statistics",
    "Analytics", "Tensorflow", "Scikit-learn", "Technical Skills", "Interpersonal Skills"
];

// DOM elements
const interestsContainer = document.getElementById('interests-container');
const skillsContainer = document.getElementById('skills-container');
const recommendBtn = document.getElementById('recommend-btn');
const loadingElement = document.getElementById('loading');
const resultsContainer = document.getElementById('results-container');
const careerResults = document.getElementById('career-results');
const compareBtn = document.getElementById('compare-btn');
const comparisonContainer = document.getElementById('comparison-container');
const comparisonTable = document.getElementById('comparison-table');
const saveBtn = document.getElementById('save-btn');

// Initialize the app
function initApp() {
    // Populate interests
    interests.forEach(interest => {
        const interestElement = document.createElement('div');
        interestElement.className = 'skill-tag';
        interestElement.textContent = interest;
        interestElement.addEventListener('click', () => {
            // Limit selection to 5 interests
            const selectedInterests = document.querySelectorAll('#interests-container .skill-tag.selected');
            if (selectedInterests.length < 5 || interestElement.classList.contains('selected')) {
                interestElement.classList.toggle('selected');
            } else {
                alert('Please select a maximum of 5 interests');
            }
        });
        interestsContainer.appendChild(interestElement);
    });

    // Populate skills
    skills.forEach(skill => {
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-tag';
        skillElement.textContent = skill;
        skillElement.addEventListener('click', () => {
            // Limit selection to 5 skills
            const selectedSkills = document.querySelectorAll('#skills-container .skill-tag.selected');
            if (selectedSkills.length < 5 || skillElement.classList.contains('selected')) {
                skillElement.classList.toggle('selected');
            } else {
                alert('Please select a maximum of 5 skills');
            }
        });
        skillsContainer.appendChild(skillElement);
    });

    // Add event listeners
    recommendBtn.addEventListener('click', generateRecommendations);
    compareBtn.addEventListener('click', toggleComparison);
    saveBtn.addEventListener('click', saveResults);
}

// Calculate career match percentage
function calculateCareerMatch(career, userData) {
    let matchScore = 0;
    let maxPossibleScore = 0;

    // Skills match (30% weight)
    const skillsWeight = 30;
    const userSkills = userData.skills || [];
    const careerSkills = career.skills || [];
    
    let skillsMatch = 0;
    userSkills.forEach(skill => {
        if (careerSkills.includes(skill)) {
            skillsMatch++;
        }
    });
    
    const skillsScore = skillsMatch / Math.max(userSkills.length, 1) * skillsWeight;
    matchScore += skillsScore;
    maxPossibleScore += skillsWeight;

    // Interests match (25% weight)
    const interestsWeight = 25;
    const userInterests = userData.interests || [];
    const careerInterests = career.interests || [];
    
    let interestsMatch = 0;
    userInterests.forEach(interest => {
        if (careerInterests.includes(interest)) {
            interestsMatch++;
        }
    });
    
    const interestsScore = interestsMatch / Math.max(userInterests.length, 1) * interestsWeight;
    matchScore += interestsScore;
    maxPossibleScore += interestsWeight;

    // Education match (15% weight)
    const educationWeight = 15;
    const educationLevels = {
        "highschool": 0,
        "associate": 1,
        "bachelor": 2,
        "master": 3,
        "phd": 4
    };
    
    const userEducationLevel = educationLevels[userData.education] || 0;
    const requiredEducationLevel = educationLevels[career.minEducation] || 0;
    
    let educationScore = 0;
    if (userEducationLevel >= requiredEducationLevel) {
        educationScore = educationWeight;
    } else {
        // Partial credit if close to required level
        const difference = requiredEducationLevel - userEducationLevel;
        educationScore = Math.max(0, educationWeight - (difference * 5));
    }
    
    matchScore += educationScore;
    maxPossibleScore += educationWeight;

    // Experience match (10% weight)
    const experienceWeight = 10;
    const experienceLevels = {
        "0": 0,
        "1": 1,
        "3": 2,
        "5": 3,
        "10": 4
    };
    
    const userExperienceLevel = experienceLevels[userData.experience] || 0;
    const requiredExperienceLevel = experienceLevels[career.experienceLevel] || 0;
    
    let experienceScore = 0;
    if (userExperienceLevel >= requiredExperienceLevel) {
        experienceScore = experienceWeight;
    } else {
        // Partial credit based on how close
        experienceScore = (userExperienceLevel / Math.max(requiredExperienceLevel, 1)) * experienceWeight;
    }
    
    matchScore += experienceScore;
    maxPossibleScore += experienceWeight;

    // Work environment match (10% weight)
    const environmentWeight = 10;
    const userEnvironment = userData.workEnvironment;
    const careerEnvironments = career.workEnvironment || [];
    
    let environmentScore = 0;
    if (userEnvironment && careerEnvironments.includes(userEnvironment)) {
        environmentScore = environmentWeight;
    } else if (userEnvironment && careerEnvironments.length > 0) {
        // Partial credit if some flexibility exists
        environmentScore = environmentWeight * 0.5;
    }
    
    matchScore += environmentScore;
    maxPossibleScore += environmentWeight;

    // Salary expectation match (10% weight)
    const salaryWeight = 10;
    const userSalary = userData.salaryExpectation;
    const careerSalary = career.salaryRange;
    
    const salaryLevels = {
        "entry": 0,
        "mid": 1,
        "senior": 2,
        "executive": 3
    };
    
    let salaryScore = 0;
    if (userSalary && careerSalary) {
        const userSalaryLevel = salaryLevels[userSalary] || 0;
        const careerSalaryLevel = salaryLevels[careerSalary] || 0;
        
        if (userSalaryLevel <= careerSalaryLevel) {
            salaryScore = salaryWeight;
        } else {
            // Partial credit based on how close
            const difference = userSalaryLevel - careerSalaryLevel;
            salaryScore = Math.max(0, salaryWeight - (difference * 3));
        }
    }
    
    matchScore += salaryScore;
    maxPossibleScore += salaryWeight;

    // Calculate final percentage
    const finalPercentage = Math.min(100, Math.round((matchScore / maxPossibleScore) * 100));
    
    return finalPercentage;
}

// Generate career recommendations
function generateRecommendations() {
    // Validate form
    const name = document.getElementById('name').value;
    const education = document.getElementById('education').value;
    const experience = document.getElementById('experience').value;
    const workEnvironment = document.getElementById('work-environment').value;
    const salaryExpectation = document.getElementById('salary-expectation').value;
    
    if (!name || !education || !experience || !workEnvironment || !salaryExpectation) {
        alert('Please fill in all required fields');
        return;
    }
    
    const selectedInterests = Array.from(document.querySelectorAll('#interests-container .skill-tag.selected'))
        .map(el => el.textContent);
        
    const selectedSkills = Array.from(document.querySelectorAll('#skills-container .skill-tag.selected'))
        .map(el => el.textContent);
        
    if (selectedInterests.length < 3 || selectedSkills.length < 3) {
        alert('Please select at least 3 interests and 3 skills');
        return;
    }

    // Show loading animation
    loadingElement.style.display = 'block';
    resultsContainer.style.display = 'none';
    comparisonContainer.style.display = 'none';

    // Prepare user data
    const userData = {
        name,
        education,
        experience,
        workEnvironment,
        salaryExpectation,
        interests: selectedInterests,
        skills: selectedSkills
    };

    // Simulate AI processing time
    setTimeout(() => {
        // Calculate matches for all careers
        const careersWithMatches = careerDatabase.map(career => {
            const match = calculateCareerMatch(career, userData);
            return {
                ...career,
                match
            };
        });

        // Sort careers by match percentage (descending)
        const sortedCareers = careersWithMatches.sort((a, b) => b.match - a.match);

        // Clear previous results
        careerResults.innerHTML = '';

        // Display top 5 careers
        sortedCareers.slice(0, 5).forEach(career => {
            const careerCard = document.createElement('div');
            careerCard.className = 'career-card';
            careerCard.innerHTML = `
                <div class="career-title">${career.title} <span style="font-size: 0.9rem; color: #6c757d; font-weight: normal;">(${career.category})</span></div>
                <div class="career-match">${career.match}% Match</div>
                <div class="career-description">${career.description}</div>
                <div class="career-details">
                    <div class="detail-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Avg. Salary: ${career.salary}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Job Growth: ${career.growth}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span>Education: ${career.education}</span>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${career.match}%"></div>
                    </div>
                </div>
            `;
            careerResults.appendChild(careerCard);
        });

        // Store results for comparison
        window.currentResults = sortedCareers.slice(0, 5);

        // Hide loading and show results
        loadingElement.style.display = 'none';
        resultsContainer.style.display = 'block';
    }, 2000);
}

// Toggle career comparison
function toggleComparison() {
    if (!window.currentResults || window.currentResults.length === 0) {
        alert('Please generate recommendations first');
        return;
    }

    if (comparisonContainer.style.display === 'block') {
        comparisonContainer.style.display = 'none';
        compareBtn.innerHTML = '<i class="fas fa-balance-scale"></i> Compare Careers';
    } else {
        // Build comparison table
        comparisonTable.innerHTML = `
            <thead>
                <tr>
                    <th>Career</th>
                    <th>Match</th>
                    <th>Avg. Salary</th>
                    <th>Job Growth</th>
                    <th>Key Skills</th>
                    <th>Min Education</th>
                </tr>
            </thead>
            <tbody>
                ${window.currentResults.map(career => `
                    <tr>
                        <td><strong>${career.title}</strong></td>
                        <td>${career.match}%</td>
                        <td>${career.salary}</td>
                        <td>${career.growth}</td>
                        <td>${career.skills.slice(0, 3).join(', ')}</td>
                        <td>${career.minEducation.charAt(0).toUpperCase() + career.minEducation.slice(1)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        comparisonContainer.style.display = 'block';
        compareBtn.innerHTML = '<i class="fas fa-times"></i> Hide Comparison';
    }
}

// Save results (simulated)
function saveResults() {
    if (!window.currentResults || window.currentResults.length === 0) {
        alert('Please generate recommendations first');
        return;
    }
    
    const userName = document.getElementById('name').value || 'User';
    alert(`Career recommendations for ${userName} have been saved! You can access them anytime from your profile.`);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);