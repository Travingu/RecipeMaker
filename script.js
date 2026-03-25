// Function to display the Ollama response on the webpage
function displayRecipeResponse(responseText) {
    const recipeContent = document.getElementById('recipe-content');
    
    // Split response into individual recipes using numbers like "1.", "2.", etc.
    // This regex matches lines starting with a number followed by a period
    const recipePattern = /(\d+\.\s*[\s\S]*?)(?=(\d+\.\s)|$)/g;
    
    let recipesHTML = '';
    let match;
    let recipeCount = 0;
    
    // Try to find numbered recipes
    while ((match = recipePattern.exec(responseText)) !== null) {
        recipeCount++;
        const recipeText = match[1].trim();
        // Format the recipe text with line breaks
        const formattedRecipe = recipeText
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        recipesHTML += `<div class="recipe-box"><h3>Recipe ${recipeCount}</h3><p>${formattedRecipe}</p></div>`;
    }
    
    // If no numbered recipes found, display as a single recipe
    if (recipeCount === 0) {
        const formattedText = responseText
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        recipesHTML = `<div class="recipe-box"><p>${formattedText}</p></div>`;
    }
    
    recipeContent.innerHTML = recipesHTML;
}

// Handle ingredients form submission
document.getElementById('ingredients-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const ingredients = document.getElementById('ingredients-input').value.trim();
    if (!ingredients) {
        alert('Please enter some ingredients');
        return;
    }

    const recipeContent = document.getElementById('recipe-content');
    const recipePanel = document.getElementById('recipe-panel');
    
    // Show loading state
    recipeContent.innerHTML = '<div class="loading">Analyzing your ingredients and generating recipes...</div>';

    console.log('Generating response');

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'codellama',
                prompt: `I have the following ingredients: ${ingredients}. What recipes can I make with these? Please provide the full recipe including ingredients list, cooking time, serving size, and step-by-step instructions. Make sure that only names of recipes start with 1., 2., etc. While other steps use *, whitespace, or + signs to indicate that they are not recipe names.`,
                stream: false
            })
        });
        
        const data = await response.json();
        console.log('Ollama Response:', data);
        
        // Display the response on the webpage
        recipePanel.classList.add('open');
        displayRecipeResponse(data.response);

    } catch (error) {
        console.error('Error generating recipes:', error);
        recipePanel.classList.add('open');
        recipeContent.innerHTML = '<div class="error">Sorry, there was an error generating recipes. Please try again.</div>';
    }
});



// Smooth scroll to ingredients section when clicking the button
document.querySelector('a[href="#ingredients"]').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('ingredients').scrollIntoView({ behavior: 'smooth' });
});