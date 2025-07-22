// File: classroom.js
// Logic for the centralized Classroom Hub.

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const resourceType = params.get('type');
    const resourceFile = params.get('file');

    const titleEl = document.getElementById('resource-title');
    const contentDisplayEl = document.getElementById('content-display');
    const controlPanelEl = document.getElementById('control-panel');

    if (!resourceFile) {
        titleEl.textContent = 'Error';
        contentDisplayEl.innerHTML = '<p>No resource specified. Please close this tab and select a resource to project from the dashboard.</p>';
        return;
    }

    try {
        const response = await fetch(resourceFile);
        if (!response.ok) throw new Error('Resource not found');
        
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        // Set the title from the fetched page's <title> tag
        titleEl.textContent = doc.querySelector('title')?.textContent.replace('(Interactive)', '').trim() || 'Classroom Mode';

        let contentToInject = null;
        
        // We need to also inject the styles for the content to ensure it's displayed correctly
        const style = doc.querySelector('style');
        if (style) {
             document.head.appendChild(style);
        }
        
        // Find the main content based on resource type
        if (resourceType === 'dice') {
            contentToInject = doc.querySelector('.dice-template-container');
            
            // Add a randomize button for dice
            const randomizeBtn = document.createElement('button');
            randomizeBtn.textContent = '🎲 Randomize Prompts';
            controlPanelEl.appendChild(randomizeBtn);
            
            // Extract prompts array from the original file's script to make the button work
            const scriptContent = doc.querySelector('script:not([src])')?.innerHTML;
            if (scriptContent) {
                // This regex finds the 'const prompts = [...]' array in the script
                const promptsMatch = scriptContent.match(/const prompts = (\[[^\]]*\]);/s);
                if (promptsMatch && promptsMatch[1]) {
                    // Using eval is generally unsafe, but here we trust the source and it's the simplest way
                    // to parse the array string which includes single quotes.
                    const prompts = eval(promptsMatch[1]);
                    
                    randomizeBtn.onclick = () => {
                        const faces = contentDisplayEl.querySelectorAll('.dice-face .prompt');
                        const shuffled = [...prompts].sort(() => 0.5 - Math.random());
                        faces.forEach((face, i) => {
                            if (shuffled[i]) face.textContent = shuffled[i];
                        });
                    };
                }
            }

        } else if (resourceType === 'scenarios') {
            contentToInject = doc.querySelector('.card-container');
            // Add flip functionality to the loaded cards
            if(contentToInject) {
                contentToInject.addEventListener('click', (e) => {
                    const cardContainer = e.target.closest('.scenario-card-container');
                    if(cardContainer) {
                        cardContainer.classList.toggle('flipped');
                    }
                });
            }
        }
        
        if (contentToInject) {
            contentDisplayEl.innerHTML = contentToInject.outerHTML;
        } else {
            contentDisplayEl.innerHTML = `<p>Could not load the content for this resource.</p>`;
        }

    } catch (error) {
        console.error('Error loading resource:', error);
        titleEl.textContent = 'Error';
        contentDisplayEl.innerHTML = `<p>There was an error loading the resource: ${error.message}</p>`;
    }
});
