import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormStep1 from '../components/registration/FormStep1';
import FormStep2 from '../components/registration/FormStep2';
import FormStep3 from '../components/registration/FormStep3';
import FormStep4 from '../components/registration/FormStep4';
import FormStep5 from '../components/registration/FormStep5';
import '../styles/registration/CaseRegistration.css';

const CaseRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseNumber, setCaseNumber] = useState(null);
  
  const [formData, setFormData] = useState({
    // Step 1: Información Personal
    fullName: '',
    birthDate: '',
    age: '',
    gender: '',
    
    // Step 2: Características Físicas
    height: '',
    weight: '',
    skinColor: '',
    hairColor: '',
    eyeColor: '',
    distinctiveMarks: '',
    
    // Step 3: Información de Desaparición
    disappearanceDate: '',
    disappearanceTime: '',
    lastKnownLocation: '',
    circumstances: '',
    clothing: '',
    
    // Step 4: Contacto de Emergencia
    reporterName: '',
    relationship: '',
    contactPhone: '',
    contactEmail: '',
    additionalContact: '',
    
    // Step 5: Fotografías
    photos: {
      frontal: null,
      profile1: null,
      profile2: null
    }
  });

  const [errors, setErrors] = useState({});

  // Validaciones por paso
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es obligatorio';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    }
    
    if (!formData.age || formData.age < 0) {
      newErrors.age = 'La edad es obligatoria';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'El género es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.height || formData.height < 50 || formData.height > 250) {
      newErrors.height = 'La estatura es obligatoria (50-250 cm)';
    }
    
    if (!formData.skinColor) {
      newErrors.skinColor = 'El tono de piel es obligatorio';
    }
    
    if (!formData.hairColor) {
      newErrors.hairColor = 'El color de cabello es obligatorio';
    }
    
    if (!formData.eyeColor) {
      newErrors.eyeColor = 'El color de ojos es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.disappearanceDate) {
      newErrors.disappearanceDate = 'La fecha de desaparición es obligatoria';
    }
    
    if (!formData.lastKnownLocation.trim()) {
      newErrors.lastKnownLocation = 'El último lugar conocido es obligatorio';
    }
    
    if (!formData.circumstances.trim()) {
      newErrors.circumstances = 'Las circunstancias son obligatorias';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    
    if (!formData.reporterName.trim()) {
      newErrors.reporterName = 'El nombre del reportante es obligatorio';
    }
    
    if (!formData.relationship) {
      newErrors.relationship = 'La relación es obligatoria';
    }
    
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'El teléfono de contacto es obligatorio';
    } else if (!/^\d{10}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'El teléfono debe tener 10 dígitos';
    }
    
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'El correo electrónico no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep5 = () => {
    const newErrors = { photos: {} };
    
    if (!formData.photos.frontal) {
      newErrors.photos.frontal = 'La foto frontal es obligatoria';
    }
    
    if (!formData.photos.profile1) {
      newErrors.photos.profile1 = 'La primera foto de perfil es obligatoria';
    }
    
    if (!formData.photos.profile2) {
      newErrors.photos.profile2 = 'La segunda foto de perfil es obligatoria';
    }
    
    const hasErrors = Object.keys(newErrors.photos).length > 0;
    setErrors(hasErrors ? newErrors : {});
    return !hasErrors;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
    window.scrollTo(0, 0);
  };

  const generateCaseNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `FC-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    if (!validateStep5()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar FormData para envío multipart/form-data
      const submitData = new FormData();
      
      // Agregar campos de texto
      Object.keys(formData).forEach(key => {
        if (key !== 'photos') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Agregar fotos
      if (formData.photos.frontal) {
        submitData.append('photo_frontal', formData.photos.frontal);
      }
      if (formData.photos.profile1) {
        submitData.append('photo_profile1', formData.photos.profile1);
      }
      if (formData.photos.profile2) {
        submitData.append('photo_profile2', formData.photos.profile2);
      }

      // TODO: Reemplazar con llamada real al backend
      // const response = await fetch('/api/cases', {
      //   method: 'POST',
      //   body: submitData
      // });
      // const data = await response.json();
      
      // Simular respuesta del servidor
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedCaseNumber = generateCaseNumber();
      setCaseNumber(generatedCaseNumber);
      
      console.log('Caso registrado exitosamente:', generatedCaseNumber);
      
    } catch (error) {
      console.error('Error al registrar el caso:', error);
      alert('Ocurrió un error al registrar el caso. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FormStep1 formData={formData} setFormData={setFormData} errors={errors} />;
      case 2:
        return <FormStep2 formData={formData} setFormData={setFormData} errors={errors} />;
      case 3:
        return <FormStep3 formData={formData} setFormData={setFormData} errors={errors} />;
      case 4:
        return <FormStep4 formData={formData} setFormData={setFormData} errors={errors} />;
      case 5:
        return <FormStep5 formData={formData} setFormData={setFormData} errors={errors} />;
      default:
        return null;
    }
  };

  if (caseNumber) {
    return (
      <div className="case-registration">
        <div className="success-screen">
          <div className="success-icon">✓</div>
          <h1>¡Caso Registrado Exitosamente!</h1>
          <p className="success-message">
            El caso ha sido registrado en nuestro sistema y comenzaremos el proceso de búsqueda.
          </p>
          <div className="case-number-box">
            <span className="case-number-label">Número de Caso:</span>
            <span className="case-number-value">{caseNumber}</span>
          </div>
          <div className="success-instructions">
            <h3>¿Qué sigue?</h3>
            <ul>
              <li>Guarda el número de caso para futuras consultas</li>
              <li>Recibirás una confirmación por correo electrónico</li>
              <li>Nuestro equipo analizará las fotografías</li>
              <li>Te contactaremos si encontramos coincidencias</li>
            </ul>
          </div>
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Volver al Inicio
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/casos')}
            >
              Ver Mis Casos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="case-registration">
      <div className="registration-container">
        <div className="registration-header">
          <h1>Registrar Persona Desaparecida</h1>
          <p>Completa el formulario para reportar una persona desaparecida</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            {[1, 2, 3, 4, 5].map(step => (
              <div 
                key={step}
                className={`progress-step ${currentStep >= step ? 'active' : ''}`}
              >
                <div className="step-circle">{step}</div>
                <div className="step-label">
                  {step === 1 && 'Personal'}
                  {step === 2 && 'Física'}
                  {step === 3 && 'Desaparición'}
                  {step === 4 && 'Contacto'}
                  {step === 5 && 'Fotos'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="form-container">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              type="button"
              className="btn-secondary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              ← Anterior
            </button>
          )}
          
          <div className="nav-spacer"></div>
          
          {currentStep < 5 ? (
            <button 
              type="button"
              className="btn-primary"
              onClick={handleNext}
            >
              Siguiente →
            </button>
          ) : (
            <button 
              type="button"
              className="btn-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Registrar Caso'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseRegistration;
