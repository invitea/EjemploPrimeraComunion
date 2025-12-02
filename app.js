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
    
    submitBtn.disabled = false
