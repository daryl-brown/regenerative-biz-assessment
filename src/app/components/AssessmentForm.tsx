'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

// Define form structure
interface AssessmentSection {
  score: number;
  evidence: string;
}

interface FormData {
  // Contact & Business Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  industry: string;
  businessSize: string;
  
  // Business Model Assessment
  resourceUse: AssessmentSection;
  wasteHandling: AssessmentSection;
  teamDevelopment: AssessmentSection;
  communityImpact: AssessmentSection;
  supplyChain: AssessmentSection;
  innovationPotential: AssessmentSection;
  
  // Value Creation Mapping
  naturalCapital: AssessmentSection;
  socialCapital: AssessmentSection;
  financialCapital: AssessmentSection;
  culturalCapital: AssessmentSection;
  knowledgeCapital: AssessmentSection;
  
  // Future Potential & Transformation
  transformationObjectives: string[];
  businessChallenge: string;
  successVision: string;
  regenerativeReadiness: string;
  supportPreferences: string[];
}

// Initial form values
const INITIAL_FORM_DATA: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  businessName: '',
  industry: '',
  businessSize: '',
  resourceUse: { score: 1, evidence: '' },
  wasteHandling: { score: 1, evidence: '' },
  teamDevelopment: { score: 1, evidence: '' },
  communityImpact: { score: 1, evidence: '' },
  supplyChain: { score: 1, evidence: '' },
  innovationPotential: { score: 1, evidence: '' },
  naturalCapital: { score: 1, evidence: '' },
  socialCapital: { score: 1, evidence: '' },
  financialCapital: { score: 1, evidence: '' },
  culturalCapital: { score: 1, evidence: '' },
  knowledgeCapital: { score: 1, evidence: '' },
  transformationObjectives: [],
  businessChallenge: '',
  successVision: '',
  regenerativeReadiness: 'Somewhat interested',
  supportPreferences: []
};

// Form steps
const FORM_STEPS = [
  { id: 1, title: 'Business Information' },
  { id: 2, title: 'Business Model Assessment' },
  { id: 3, title: 'Value Creation Mapping' },
  { id: 4, title: 'Future Potential & Transformation' }
];

// Dropdown options
const INDUSTRY_OPTIONS = [
  'Select Industry',
  'Agriculture',
  'Retail',
  'Manufacturing',
  'Food & Beverage',
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Hospitality',
  'Construction',
  'Other'
];

const BUSINESS_SIZE_OPTIONS = [
  'Select Business Size',
  '1-5 Employees',
  '6-20 Employees',
  '21-50 Employees',
  '51-100 Employees',
  '100+ Employees'
];

const TRANSFORMATION_OPTIONS = [
  'Cost Reduction',
  'New Revenue Streams',
  'Environmental Impact Improvement',
  'Social/Community Benefit',
  'Team Capability Development',
  'Innovation Capacity Enhancement',
  'Supply Chain Sustainability',
  'Operational Efficiency'
];

const READINESS_OPTIONS = [
  'Not ready at all',
  'Somewhat interested',
  'Moderately prepared',
  'Very eager to transform',
  'Already implementing regenerative practices'
];

const SUPPORT_OPTIONS = [
  'Detailed assessment report',
  'Strategy consultation',
  'Training workshops',
  'Peer networking',
  'Resource guides',
  'Ongoing mentorship'
];

const SCORE_DESCRIPTIONS = [
  'Highly Extractive (1)',
  'Minimally Sustainable (2)',
  'Maintaining Current State (3)',
  'Creating Positive Impact (4)',
  'Regenerative and Transformative (5)'
];

export function AssessmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isMember, setIsMember] = useState(false);
  const [memberId, setMemberId] = useState('');

  // Check if user is existing member and prefill data
  useEffect(() => {
    const member = searchParams.get('member');
    const id = searchParams.get('id');
    
    if (member === 'true' && id) {
      setIsMember(true);
      setMemberId(id);
      fetchMemberData(id);
    }
  }, [searchParams]);

  // Fetch member data from API
  const fetchMemberData = async (id: string) => {
    try {
      const response = await fetch(`/api/member-data?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        // Prefill form with member data
        setFormData(prev => ({
          ...prev,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          businessName: data.businessName || '',
          industry: data.industry || '',
          businessSize: data.businessSize || ''
        }));
      }
    } catch (error) {
      console.error('Failed to fetch member data:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle score dropdowns
  const handleScoreChange = (field: keyof FormData, score: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...(prev[field] as AssessmentSection), score }
    }));
  };

  // Handle evidence text areas
  const handleEvidenceChange = (field: keyof FormData, evidence: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...(prev[field] as AssessmentSection), evidence }
    }));
    
    // Clear error for this field if it exists
    const errorKey = `${field.toString()}.evidence`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Handle checkbox arrays (multi-select)
  const handleCheckboxChange = (field: 'transformationObjectives' | 'supportPreferences', value: string) => {
    setFormData(prev => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
  };

  // Validate form sections
  const validateSection = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.businessName) newErrors.businessName = 'Business name is required';
      if (!formData.industry || formData.industry === 'Select Industry') {
        newErrors.industry = 'Please select an industry';
      }
      if (!formData.businessSize || formData.businessSize === 'Select Business Size') {
        newErrors.businessSize = 'Please select a business size';
      }
    }
    
    if (step === 2) {
      const sections = ['resourceUse', 'wasteHandling', 'teamDevelopment', 'communityImpact', 'supplyChain', 'innovationPotential'] as const;
      sections.forEach(section => {
        if (!formData[section].evidence) {
          newErrors[`${section}.evidence`] = 'Please provide details for this section';
        }
      });
    }
    
    if (step === 3) {
      const sections = ['naturalCapital', 'socialCapital', 'financialCapital', 'culturalCapital', 'knowledgeCapital'] as const;
      sections.forEach(section => {
        if (!formData[section].evidence) {
          newErrors[`${section}.evidence`] = 'Please provide details for this section';
        }
      });
    }
    
    if (step === 4) {
      if (formData.transformationObjectives.length === 0) {
        newErrors.transformationObjectives = 'Please select at least one objective';
      }
      if (!formData.businessChallenge) {
        newErrors.businessChallenge = 'Please describe your business challenge';
      }
      if (!formData.successVision) {
        newErrors.successVision = 'Please share your vision of success';
      }
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save progress after first section
  const saveProgress = async () => {
    try {
      const response = await fetch('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isMember,
          memberId: isMember ? memberId : undefined,
          step: currentStep
        }),
      });
      
      if (response.ok) {
        setProgressSaved(true);
        // If it's first time saving, we might get a progress ID back
        const data = await response.json();
        if (data.progressId && !memberId) {
          setMemberId(data.progressId);
        }
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Multi-step navigation
  const handleNextStep = async () => {
    const isValid = validateSection(currentStep);
    
    if (!isValid) {
      return;
    }
    
    // Save progress after completing first section
    if (currentStep === 1) {
      await saveProgress();
    }
    
    if (currentStep < FORM_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateSection(currentStep);
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      // Generate a unique ID for tracking
      const submissionId = Date.now().toString();

      // Immediately redirect to thank you page
      router.push(`/assessment/thank-you?id=${submissionId}`);

      // Fire the submission request in the background with keepalive
      // This ensures the request completes even after page navigation
      fetch('/api/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isMember,
          memberId: memberId || undefined
        }),
        keepalive: true // Ensures request continues after navigation
      }).catch(error => {
        // Log error but don't block the user experience
        console.error('Background submission error:', error);
      });

    } catch (error) {
      console.error('Failed to submit assessment:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {FORM_STEPS.map((step) => (
            <div 
              key={step.id} 
              className={`text-sm font-medium ${
                step.id === currentStep 
                  ? 'text-blue-600' 
                  : step.id < currentStep 
                    ? 'text-green-600' 
                    : 'text-gray-400'
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / FORM_STEPS.length) * 100}%` }} 
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Business Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${formErrors.businessName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {formErrors.businessName && <p className="text-red-500 text-xs mt-1">{formErrors.businessName}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industry *</label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.industry ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {formErrors.industry && <p className="text-red-500 text-xs mt-1">{formErrors.industry}</p>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="businessSize" className="block text-sm font-medium text-gray-700">Business Size *</label>
                <select
                  id="businessSize"
                  name="businessSize"
                  value={formData.businessSize}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.businessSize ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  {BUSINESS_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {formErrors.businessSize && <p className="text-red-500 text-xs mt-1">{formErrors.businessSize}</p>}
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mt-4">
              * Required fields
            </div>
          </div>
        )}

        {/* Step 2: Business Model Assessment */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Model Assessment</h2>
            <p className="mb-6 text-gray-600">
              For each area, rate your current state and provide details about your practices.
            </p>
            
            <div className="space-y-8">
              {/* Resource Use */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Resource Use</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business currently source and use resources?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your current resource procurement and usage:
                    </label>
                    <select
                      value={formData.resourceUse.score}
                      onChange={(e) => handleScoreChange('resourceUse', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your resource practices:
                    </label>
                    <textarea
                      value={formData.resourceUse.evidence}
                      onChange={(e) => handleEvidenceChange('resourceUse', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['resourceUse.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Describe how your business sources and uses resources. What strategies do you currently employ?"
                    ></textarea>
                    {formErrors['resourceUse.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['resourceUse.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Waste Handling */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Waste Handling</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business manage waste and byproducts?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your current waste management approach:
                    </label>
                    <select
                      value={formData.wasteHandling.score}
                      onChange={(e) => handleScoreChange('wasteHandling', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your waste management:
                    </label>
                    <textarea
                      value={formData.wasteHandling.evidence}
                      onChange={(e) => handleEvidenceChange('wasteHandling', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['wasteHandling.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="How does your business currently manage waste? What happens to byproducts and unused materials?"
                    ></textarea>
                    {formErrors['wasteHandling.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['wasteHandling.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Team Development */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Team Development</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business develop team capabilities and potential?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your approach to staff growth and capability building:
                    </label>
                    <select
                      value={formData.teamDevelopment.score}
                      onChange={(e) => handleScoreChange('teamDevelopment', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your team development practices:
                    </label>
                    <textarea
                      value={formData.teamDevelopment.evidence}
                      onChange={(e) => handleEvidenceChange('teamDevelopment', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['teamDevelopment.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Describe your current practices for staff training, skill development, and career progression."
                    ></textarea>
                    {formErrors['teamDevelopment.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['teamDevelopment.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Community Impact */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Community Impact</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business interact with and impact your local community?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your business&#39;s current engagement with the community:
                    </label>
                    <select
                      value={formData.communityImpact.score}
                      onChange={(e) => handleScoreChange('communityImpact', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your community engagement:
                    </label>
                    <textarea
                      value={formData.communityImpact.evidence}
                      onChange={(e) => handleEvidenceChange('communityImpact', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['communityImpact.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="How does your business currently interact with and support your local community?"
                    ></textarea>
                    {formErrors['communityImpact.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['communityImpact.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Supply Chain */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Supply Chain Sustainability</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How sustainable is your current supply chain?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate the regenerative potential of your current supply chain:
                    </label>
                    <select
                      value={formData.supplyChain.score}
                      onChange={(e) => handleScoreChange('supplyChain', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your supply chain practices:
                    </label>
                    <textarea
                      value={formData.supplyChain.evidence}
                      onChange={(e) => handleEvidenceChange('supplyChain', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['supplyChain.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Describe your current supplier relationships and how you consider sustainability in procurement."
                    ></textarea>
                    {formErrors['supplyChain.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['supplyChain.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Innovation Potential */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Innovation Potential</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business approach innovation and improvement?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your business&#39;s approach to innovation:
                    </label>
                    <select
                      value={formData.innovationPotential.score}
                      onChange={(e) => handleScoreChange('innovationPotential', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your innovation practices:
                    </label>
                    <textarea
                      value={formData.innovationPotential.evidence}
                      onChange={(e) => handleEvidenceChange('innovationPotential', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['innovationPotential.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="How does your business generate, capture, and implement new ideas?"
                    ></textarea>
                    {formErrors['innovationPotential.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['innovationPotential.evidence']}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Value Creation Mapping */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Value Creation Mapping</h2>
            <p className="mb-6 text-gray-600">
              Assess how your business creates different forms of value.
            </p>
            
            <div className="space-y-8">
              {/* Natural Capital */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Natural Capital</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business impact environmental systems?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your environmental impact:
                    </label>
                    <select
                      value={formData.naturalCapital.score}
                      onChange={(e) => handleScoreChange('naturalCapital', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your environmental practices:
                    </label>
                    <textarea
                      value={formData.naturalCapital.evidence}
                      onChange={(e) => handleEvidenceChange('naturalCapital', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['naturalCapital.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Describe your current environmental practices and their impact."
                    ></textarea>
                    {formErrors['naturalCapital.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['naturalCapital.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Social Capital */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Capital</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business contribute to social well-being?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your social contribution:
                    </label>
                    <select
                      value={formData.socialCapital.score}
                      onChange={(e) => handleScoreChange('socialCapital', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your social impact:
                    </label>
                    <textarea
                      value={formData.socialCapital.evidence}
                      onChange={(e) => handleEvidenceChange('socialCapital', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['socialCapital.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Explain how your business supports and enhances community relationships."
                    ></textarea>
                    {formErrors['socialCapital.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['socialCapital.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Financial Capital */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Capital</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business create and distribute financial value?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your financial value creation:
                    </label>
                    <select
                      value={formData.financialCapital.score}
                      onChange={(e) => handleScoreChange('financialCapital', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your financial practices:
                    </label>
                    <textarea
                      value={formData.financialCapital.evidence}
                      onChange={(e) => handleEvidenceChange('financialCapital', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['financialCapital.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Describe your approach to financial management and value creation."
                    ></textarea>
                    {formErrors['financialCapital.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['financialCapital.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Cultural Capital */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Cultural Capital</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business contribute to cultural development?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your cultural contribution:
                    </label>
                    <select
                      value={formData.culturalCapital.score}
                      onChange={(e) => handleScoreChange('culturalCapital', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your cultural impact:
                    </label>
                    <textarea
                      value={formData.culturalCapital.evidence}
                      onChange={(e) => handleEvidenceChange('culturalCapital', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['culturalCapital.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Share how your business supports cultural knowledge, diversity, and innovation."
                    ></textarea>
                    {formErrors['culturalCapital.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['culturalCapital.evidence']}</p>}
                  </div>
                </div>
              </div>
              
              {/* Knowledge Capital */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Knowledge Capital</h3>
                <p className="text-sm text-gray-600 mb-4">
                  How does your business generate and share knowledge?
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate your knowledge generation:
                    </label>
                    <select
                      value={formData.knowledgeCapital.score}
                      onChange={(e) => handleScoreChange('knowledgeCapital', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <option key={score} value={score}>
                          {SCORE_DESCRIPTIONS[score-1]}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details about your knowledge practices:
                    </label>
                    <textarea
                      value={formData.knowledgeCapital.evidence}
                      onChange={(e) => handleEvidenceChange('knowledgeCapital', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border ${formErrors['knowledgeCapital.evidence'] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Describe your practices for learning, skill development, and knowledge transfer."
                    ></textarea>
                    {formErrors['knowledgeCapital.evidence'] && <p className="text-red-500 text-xs mt-1">{formErrors['knowledgeCapital.evidence']}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Future Potential & Transformation */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Future Potential & Transformation</h2>
            <p className="mb-6 text-gray-600">
              Let&#39;s explore your transformation goals and vision for the future.
            </p>
            
            <div className="space-y-6">
              {/* Transformation Objectives */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  What are your primary business transformation goals? (Select all that apply) *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TRANSFORMATION_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`transformation-${option}`}
                        checked={formData.transformationObjectives.includes(option)}
                        onChange={() => handleCheckboxChange('transformationObjectives', option)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`transformation-${option}`} className="ml-2 text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                {formErrors.transformationObjectives && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.transformationObjectives}</p>
                )}
              </div>
              
              {/* Business Challenge */}
              <div className="space-y-2">
                <label htmlFor="businessChallenge" className="block text-sm font-medium text-gray-700">
                  What is the most significant challenge your business is currently facing? *
                </label>
                <textarea
                  id="businessChallenge"
                  name="businessChallenge"
                  value={formData.businessChallenge}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border ${formErrors.businessChallenge ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Please provide a detailed description of your primary business obstacle"
                ></textarea>
                {formErrors.businessChallenge && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.businessChallenge}</p>
                )}
              </div>
              
              {/* Success Vision */}
              <div className="space-y-2">
                <label htmlFor="successVision" className="block text-sm font-medium text-gray-700">
                  What would success look like for your business in the next 12 months? *
                </label>
                <textarea
                  id="successVision"
                  name="successVision"
                  value={formData.successVision}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border ${formErrors.successVision ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Describe your ideal business state, including specific measurable outcomes"
                ></textarea>
                {formErrors.successVision && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.successVision}</p>
                )}
              </div>
              
              {/* Regenerative Readiness */}
              <div className="space-y-2">
                <label htmlFor="regenerativeReadiness" className="block text-sm font-medium text-gray-700">
                  How ready is your organization to embrace regenerative business practices?
                </label>
                <select
                  id="regenerativeReadiness"
                  name="regenerativeReadiness"
                  value={formData.regenerativeReadiness}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {READINESS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              {/* Support Preferences */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  What type of support would be most helpful in your business transformation journey?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SUPPORT_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`support-${option}`}
                        checked={formData.supportPreferences.includes(option)}
                        onChange={() => handleCheckboxChange('supportPreferences', option)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`support-${option}`} className="ml-2 text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mt-4">
                * Required fields
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
            >
              Previous
            </button>
          )}
          
          {currentStep < FORM_STEPS.length ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 ${isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                "Submit Assessment"
              )}
            </button>
          )}
        </div>
        
        {/* Progress Indicator */}
        <div className="text-center text-sm text-gray-500 mt-4">
          Step {currentStep} of {FORM_STEPS.length}
        </div>
        
        {/* Progress Saved Message */}
        {progressSaved && currentStep > 1 && (
          <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            Your progress has been saved. You can continue from where you left off.
          </div>
        )}
      </form>
    </div>
  );
}