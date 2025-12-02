// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCTh8kPdvu-6Z5_cckNts22VrhdUTLVspM",
  authDomain: "invitea-f7331.firebaseapp.com",
  projectId: "invitea-f7331",
  storageBucket: "invitea-f7331.firebasestorage.app",
  messagingSenderId: "145115727672",
  appId: "1:145115727672:web:d1d89c20bf946b9e2663cd",
  measurementId: "G-8JS1MDZVGQ"
};

// Variables globales
let db;

// Utilidades
function getDynamicDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateString = tomorrow.toLocaleDateString('es-MX', options);
  return dateString.charAt(0).toUpperCase() + dateString.slice(1);
}

function preloadImage(url) {
  const img = new Image();
  img.src = url;
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  if (!phone) return true;
  return phone.replace(/\D/g, '').length === 10;
}

function formatPhone(value) {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0,2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0,2)}) ${numbers.slice(2,6)}-${numbers.slice(6,10)}`;
}

async function checkEmailExists(email) {
  if (!email || !isValidEmail(email)) return false;
  try {
    const snapshot = await db.collection('ejemploprimeracomunion_panel')
      .where('email', '==', email.toLowerCase().trim())
      .get();
    return !snapshot.empty;
  } catch (error) {
    console.warn('Error checking email:', error);
    return false;
  }
}

function showError(input, errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  input.classList.add('error');
}

function clearError(input, errorElement) {
  errorElement.style.display = 'none';
  input.classList.remove('error', 'warning');
}

// Modal Functions
function openModal() {
  const modal = document.getElementById('rsvpModal');
  const nameInput = document.getElementById('name');
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => nameInput.focus(), 100);
}

function closeModal() {
  const modal = document.getElementById('rsvpModal');
  const form = document.getElementById('rsvpForm');
  const thankYou = document.getElementById('thankYouMessage');
  const submitBtn = document.getElementById('submitBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  
  const inputs = [
    { id: 'name', error: 'nameError' },
    { id: 'email', error: 'emailError', dupError: 'emailDuplicateError' },
    { id: 'phone', error: 'phoneError' },
    { id: 'adults', error: 'adultsError' },
    { id: 'children', error: 'childrenError' }
  ];
  
  modal.classList.remove('active');
  document.body.style.overflow = '';
  
  setTimeout(() => {
    thankYou.style.display = 'none';
    form.style.display = 'block';
    form.reset();
    
    document.getElementById('adults').value = 1;
    document.getElementById('children').value = 0;
    
    inputs.forEach(input => {
      const errorElement = document.getElementById(input.error);
      const inputElement = document.getElementById(input.id);
      
      if (errorElement) errorElement.style.display = 'none';
      if (inputElement) inputElement.classList.remove('error', 'warning');
      
      if (input.dupError) {
        const dupError = document.getElementById(input.dupError);
        if (dupError) dupError.style.display = 'none';
      }
    });
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Confirmación';
    loadingSpinner.style.display = 'none';
  }, 300);
}

// Event Listeners Setup
function setupEventListeners() {
  const openBtn = document.getElementById('openRsvp');
  const modal = document.getElementById('rsvpModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('rsvpForm');
  const submitBtn = document.getElementById('submitBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const adultsInput = document.getElementById('adults');
  const childrenInput = document.getElementById('children');
  
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const emailDuplicateError = document.getElementById('emailDuplicateError');
  const phoneError = document.getElementById('phoneError');
  const adultsError = document.getElementById('adultsError');
  const childrenError = document.getElementById('childrenError');
  
  // Open modal
  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }
  
  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
  
  // Phone formatting
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = formatPhone(e.target.value);
      if (e.target.value && !isValidPhone(e.target.value)) {
        showError(phoneInput, phoneError, '10 dígitos requeridos');
      } else {
        clearError(phoneInput, phoneError);
      }
    });
  }
  
  // Email validation
  if (emailInput) {
    emailInput.addEventListener('blur', async (e) => {
      const value = e.target.value.trim();
      
      if (value && !isValidEmail(value)) {
        showError(emailInput, emailError, 'Email inválido');
        if (emailDuplicateError) emailDuplicateError.style.display = 'none';
        return;
      }
      
      if (value) {
        const exists = await checkEmailExists(value);
        if (exists) {
          if (emailDuplicateError) {
            emailDuplicateError.style.display = 'block';
          }
          if (emailError) {
            emailError.style.display = 'none';
          }
          emailInput.classList.add('warning');
        } else {
          clearError(emailInput, emailError);
          if (emailDuplicateError) {
            emailDuplicateError.style.display = 'none';
          }
        }
      } else {
        clearError(emailInput, emailError);
        if (emailDuplicateError) {
          emailDuplicateError.style.display = 'none';
        }
      }
    });
  }
  
  // Form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!db) {
        alert('Error de conexión. Por favor, inténtalo de nuevo.');
        return;
      }
      
      let isValid = true;
      
      // Validate name
      if (!nameInput.value || nameInput.value.trim().length < 3) {
        showError(nameInput, nameError, 'Nombre requerido (mínimo 3 caracteres)');
        isValid = false;
      }
      
      // Validate email
      const emailValue = emailInput.value.trim();
      if (emailValue && !isValidEmail(emailValue)) {
        showError(emailInput, emailError, 'Email inválido');
        isValid = false;
      } else if (emailValue && await checkEmailExists(emailValue)) {
        if (emailDuplicateError) emailDuplicateError.style.display = 'block';
        isValid = false;
      }
      
      // Validate phone
      if (phoneInput.value && !isValidPhone(phoneInput.value)) {
        showError(phoneInput, phoneError, 'Teléfono inválido (10 dígitos requeridos)');
        isValid = false;
      }
      
      // Validate adults
      if (!adultsInput.value || parseInt(adultsInput.value) < 1) {
        showError(adultsInput, adultsError, 'Mínimo 1 adulto');
        isValid = false;
      }
      
      // Validate children
      if (childrenInput.value && parseInt(childrenInput.value) < 0) {
        showError(childrenInput, childrenError, 'No puede ser negativo');
        isValid = false;
      }
      
      if (!isValid) return;
      
      // Submit form
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      if (loadingSpinner) loadingSpinner.style.display = 'block';
      
      try {
        await db.collection('ejemploprimeracomunion_panel').add({
          nombre: nameInput.value.trim(),
          email: emailValue || 'No proporcionado',
          telefono: phoneInput.value || 'No proporcionado',
          adultos: parseInt(adultsInput.value),
          ninos: parseInt(childrenInput.value),
          dispositivo: navigator.userAgent,
          pantalla: `${window.innerWidth}x${window.innerHeight}`,
          fecha: new Date().toLocaleString('es-MX'),
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        form.style.display = 'none';
        const thankYou = document.getElementById('thankYouMessage');
        if (thankYou) thankYou.style.display = 'block';
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        
        setTimeout(closeModal, 2000);
      } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al enviar la confirmación. Por favor, inténtalo de nuevo.');
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Confirmación';
        if (loadingSpinner) loadingSpinner.style.display = 'none';
      }
    });
  }
}

// Initialize application
function initializeApp() {
  // Set dynamic date
  const dateElement = document.getElementById('dynamicDate');
  if (dateElement) {
    dateElement.textContent = getDynamicDate();
  }
  
  // Preload image
  preloadImage('https://i.ibb.co/MyswS4v6/image.jpg');
  
  // Initialize Firebase
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization error:', error);
  }
  
  // Setup event listeners
  setupEventListeners();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
