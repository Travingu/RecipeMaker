import ollama from 'ollama'

const video = document.getElementById('camera-feed');
const placeholder = document.getElementById('placeholder');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const captureBtn = document.getElementById('capture-btn');
const capturedImages = document.getElementById('captured-images');
let stream = null;

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        video.srcObject = stream;
        video.style.display = 'block';
        placeholder.style.display = 'none';
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        captureBtn.style.display = 'inline-block';
    } catch (err) {
        console.error('Error accessing camera:', err);
        placeholder.textContent = 'Error: Could not access camera';
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    video.srcObject = null;
    video.style.display = 'none';
    placeholder.style.display = 'flex';
    placeholder.textContent = 'Camera feed will appear here';
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    captureBtn.style.display = 'none';
}

function captureImage() {
    if (!stream) {
        return;
    }

    const canvas = document.createElement('canvas');
    const scaleFactor = 0.5;
    canvas.width = video.videoWidth * scaleFactor;
    canvas.height = video.videoHeight * scaleFactor;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgContainer = document.createElement('div');
    imgContainer.className = 'captured-image-container';

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.className = 'captured-image';
    img.alt = 'Captured image';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-image-btn';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function() {
        capturedImages.removeChild(imgContainer);
        updateGenerateButton();
    });

    imgContainer.appendChild(img);
    imgContainer.appendChild(removeBtn);
    capturedImages.appendChild(imgContainer);
    updateGenerateButton();
}

const response = await ollama.chat({
  model: 'llama3.2-vision',
  messages: [{
    role: 'chef',
    content: 'What different ingredients are in this image? What recipes can you make using these ingredients? What is the cooking time and serving sizefor the recipe? Tell me the entire recipe like I was going to make it',
    images: [img.src]
  }]
})

console.log(response)

function updateGenerateButton() {
    const images = capturedImages.querySelectorAll('.captured-image-container');
    let generateBtn = document.getElementById('generate-btn');
    
    if (images.length > 0) {
        if (!generateBtn) {
            generateBtn = document.createElement('button');
            generateBtn.id = 'generate-btn';
            generateBtn.className = 'camera-btn generate-recipes-btn';
            generateBtn.textContent = 'Generate Recipes';
            captureBtn.parentNode.insertBefore(generateBtn, captureBtn.nextSibling);
        }
    } else {
        if (generateBtn) {
            generateBtn.remove();
        }
    }
}

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);
captureBtn.addEventListener('click', captureImage);

document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'generate-btn') {
        document.getElementById('recipe-panel').classList.add('open');
    }
    if (e.target && e.target.id === 'close-panel-btn') {
        document.getElementById('recipe-panel').classList.remove('open');
    }
    
    // Toggle recipe dropdowns
    const recipeTitle = e.target.closest('.recipe-title');
    if (recipeTitle) {
        const recipeItem = recipeTitle.parentElement;
        recipeItem.classList.toggle('active');
    }
});
