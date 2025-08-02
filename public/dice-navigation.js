// Dice Navigation Enhancement Module
// Provides category switching functionality for all dice pages

const DICE_CATEGORIES = {
    'emotions': {
        name: 'Emotions & Feelings',
        file: 'Emotions & Feelings Dice.html',
        description: 'Explore emotional awareness and regulation'
    },
    'self-awareness': {
        name: 'Self-Awareness',
        file: 'Self-Awareness Dice.html',
        description: 'Build self-understanding and identity'
    },
    'empathy': {
        name: 'Empathy & Kindness',
        file: 'Empathy & Kindness Dice.html',
        description: 'Develop compassion and understanding'
    },
    'friendship': {
        name: 'Friendship & Social Skills',
        file: 'Friendship & Social Skills Dice.html',
        description: 'Strengthen peer relationships'
    },
    'problem-solving': {
        name: 'Problem Solving',
        file: 'Problem Solving Dice.html',
        description: 'Critical thinking and decision making'
    },
    'coping': {
        name: 'Coping Strategies',
        file: 'Coping Strategies Dice.html',
        description: 'Stress management and resilience'
    },
    'blank': {
        name: 'Blank Dice',
        file: 'Blank Dice.html',
        description: 'Create your own custom prompts'
    }
};

// Initialize dice navigation
function initDiceNavigation() {
    // Create navigation elements
    createCategoryDropdown();
    createBreadcrumb();
    
    // Set up event listeners
    setupNavigationEvents();
}

// Create category dropdown
function createCategoryDropdown() {
    const controls = document.querySelector('.controls');
    if (!controls) return;
    
    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'category-dropdown-container';
    
    // Create dropdown button
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'category-dropdown-btn';
    dropdownButton.innerHTML = `
        <span class="dropdown-text">🎲 All Dice Categories</span>
        <span class="dropdown-arrow">▼</span>
    `;
    
    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'category-dropdown-menu';
    
    // Add category options
    Object.entries(DICE_CATEGORIES).forEach(([key, category]) => {
        const option = document.createElement('a');
        option.href = category.file;
        option.className = 'category-option';
        option.innerHTML = `
            <span class="category-name">${category.name}</span>
            <span class="category-desc">${category.description}</span>
        `;
        dropdownMenu.appendChild(option);
    });
    
    // Assemble dropdown
    dropdownContainer.appendChild(dropdownButton);
    dropdownContainer.appendChild(dropdownMenu);
    
    // Insert at the beginning of controls
    controls.insertBefore(dropdownContainer, controls.firstChild);
}

// Create breadcrumb navigation
function createBreadcrumb() {
    const header = document.querySelector('header');
    if (!header) return;
    
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'dice-breadcrumb';
    breadcrumb.innerHTML = `
        <a href="dashboard.html" class="breadcrumb-link">🏠 Dashboard</a>
        <span class="breadcrumb-separator">›</span>
        <a href="#" class="breadcrumb-link" id="dice-category-link">🎲 Dice</a>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current" id="current-category">Current Category</span>
    `;
    
    header.insertBefore(breadcrumb, header.firstChild);
    
    // Update current category
    updateCurrentCategory();
}

// Update current category display
function updateCurrentCategory() {
    const currentFile = window.location.pathname.split('/').pop();
    const currentCategory = Object.values(DICE_CATEGORIES).find(cat => cat.file === currentFile);
    
    if (currentCategory) {
        const currentElement = document.getElementById('current-category');
        const categoryLink = document.getElementById('dice-category-link');
        
        if (currentElement) {
            currentElement.textContent = currentCategory.name;
        }
        
        if (categoryLink) {
            categoryLink.textContent = '🎲 Dice';
            categoryLink.href = 'dashboard.html#dice-section';
        }
    }
}

// Setup navigation events
function setupNavigationEvents() {
    // Dropdown toggle
    const dropdownBtn = document.querySelector('.category-dropdown-btn');
    const dropdownMenu = document.querySelector('.category-dropdown-menu');
    
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMenu.classList.toggle('show');
            dropdownBtn.querySelector('.dropdown-arrow').textContent = 
                dropdownMenu.classList.contains('show') ? '▲' : '▼';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                dropdownBtn.querySelector('.dropdown-arrow').textContent = '▼';
            }
        });
    }
    
    // Category option hover effects
    const categoryOptions = document.querySelectorAll('.category-option');
    categoryOptions.forEach(option => {
        option.addEventListener('mouseenter', () => {
            option.classList.add('hover');
        });
        
        option.addEventListener('mouseleave', () => {
            option.classList.remove('hover');
        });
    });
}

// Add CSS styles for navigation elements
function addNavigationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Category Dropdown Styles */
        .category-dropdown-container {
            position: relative;
            display: inline-block;
        }
        
        .category-dropdown-btn {
            background: linear-gradient(135deg, var(--midnight-blue), var(--sky-blue));
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .category-dropdown-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .dropdown-arrow {
            font-size: 12px;
            transition: transform 0.3s ease;
        }
        
        .category-dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            min-width: 280px;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        }
        
        .category-dropdown-menu.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .category-option {
            display: block;
            padding: 12px 16px;
            text-decoration: none;
            color: var(--border-color);
            border-bottom: 1px solid #f0f0f0;
            transition: all 0.2s ease;
        }
        
        .category-option:last-child {
            border-bottom: none;
        }
        
        .category-option:hover {
            background-color: var(--ice-blue);
            color: var(--midnight-blue);
        }
        
        .category-name {
            display: block;
            font-weight: 600;
            font-family: 'Poppins', sans-serif;
            margin-bottom: 2px;
        }
        
        .category-desc {
            display: block;
            font-size: 11px;
            color: #666;
            font-family: 'Atkinson Hyperlegible', sans-serif;
        }
        
        /* Breadcrumb Styles */
        .dice-breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 15px;
            padding: 8px 12px;
            background: var(--ice-blue);
            border-radius: 6px;
            font-size: 12px;
        }
        
        .breadcrumb-link {
            color: var(--midnight-blue);
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s ease;
        }
        
        .breadcrumb-link:hover {
            color: var(--sky-blue);
            text-decoration: underline;
        }
        
        .breadcrumb-separator {
            color: #999;
            font-weight: 400;
        }
        
        .breadcrumb-current {
            color: var(--midnight-blue);
            font-weight: 700;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .category-dropdown-menu {
                min-width: 250px;
                right: 0;
                left: auto;
            }
            
            .dice-breadcrumb {
                flex-wrap: wrap;
                gap: 4px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addNavigationStyles();
    initDiceNavigation();
}); 