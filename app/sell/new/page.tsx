'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Loader2, ArrowRight, ArrowLeft, Home, Image as ImageIcon, CheckCircle, X } from 'lucide-react';

interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  price_per_month: number;
  bedrooms: number;
  bathrooms: number;
  surface_area: number;
}

export default function NewPropertyPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    location: '',
    price_per_month: 0,
    bedrooms: 1,
    bathrooms: 1,
    surface_area: 0,
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (field: keyof PropertyFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (file: File) => {
    if (images.length >= 5) {
      setError('Maximum 5 images autorisées');
      return;
    }
    setImages((prev) => [...prev, file]);
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) {
      setError('Veuillez entrer un titre');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Veuillez entrer une description');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Veuillez entrer une localisation');
      return false;
    }
    if (formData.price_per_month <= 0) {
      setError('Veuillez entrer un prix valide');
      return false;
    }
    if (formData.bedrooms < 1 || formData.bedrooms > 10) {
      setError('Le nombre de chambres doit être entre 1 et 10');
      return false;
    }
    if (formData.bathrooms < 1 || formData.bathrooms > 5) {
      setError('Le nombre de salles de bain doit être entre 1 et 5');
      return false;
    }
    if (formData.surface_area <= 0) {
      setError('Veuillez entrer une surface valide');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (images.length === 0) {
      setError('Veuillez ajouter au moins une photo');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevious = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté');
        return;
      }

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price_per_month: formData.price_per_month,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          surface_area: formData.surface_area,
          owner_id: user.id,
          is_available: true,
        })
        .select()
        .single();

      if (propertyError || !property) {
        setError('Erreur lors de la création de l\'annonce');
        return;
      }

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${property.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        await supabase.from('property_images').insert({
          property_id: property.id,
          image_url: publicUrl,
          display_order: i,
        });
      }

      router.push('/sell');
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
            Créer une annonce
          </h1>
          <p className="text-[#8b8fa8]">
            Remplissez les informations pour publier votre bien
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? 'bg-[#c8a96e]' : 'bg-[rgba(255,255,255,0.12)]'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={step >= 1 ? 'text-[#c8a96e]' : 'text-[#8b8fa8]'}>
              Informations
            </span>
            <span className={step >= 2 ? 'text-[#c8a96e]' : 'text-[#8b8fa8]'}>
              Photos
            </span>
            <span className={step >= 3 ? 'text-[#c8a96e]' : 'text-[#8b8fa8]'}>
              Récapitulatif
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-[#f0f0f0]">
                Informations de base
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                    Titre de l'annonce
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                    placeholder="Appartement 3 pièces - Hydra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all resize-none"
                    placeholder="Décrivez votre bien en détail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                    placeholder="Ex: Hydra, Alger"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                      Prix par mois (DZD)
                    </label>
                    <input
                      type="number"
                      value={formData.price_per_month || ''}
                      onChange={(e) => handleInputChange('price_per_month', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                      placeholder="45000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      value={formData.surface_area || ''}
                      onChange={(e) => handleInputChange('surface_area', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] placeholder-[#4a4d5e] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                      placeholder="85"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                      Chambres
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                      Salles de bain
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl text-[#f0f0f0] focus:border-[#c8a96e] focus:outline-none focus:shadow-[0_0_0_3px_rgba(200,169,110,0.15)] transition-all"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleNext}
                  className="bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-[#f0f0f0]">
                Photos
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#f0f0f0] mb-2">
                  Ajouter des photos ({images.length}/5)
                </label>
                <div
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.files) {
                        Array.from(target.files).forEach((file) => {
                          if (images.length < 5) {
                            handleImageSelect(file);
                          }
                        });
                      }
                    };
                    input.click();
                  }}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    images.length < 5
                      ? 'border-[rgba(255,255,255,0.12)] hover:border-[#c8a96e]'
                      : 'border-[rgba(255,255,255,0.06)] cursor-not-allowed'
                  }`}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[#8b8fa8]" />
                  <p className="text-[#f0f0f0] mb-2">
                    {images.length < 5 ? 'Cliquez pour ajouter des photos' : 'Maximum atteint'}
                  </p>
                  <p className="text-[#8b8fa8] text-sm">
                    Max 5 images • 5MB par image
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleImageRemove(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  className="border border-[rgba(255,255,255,0.12)] text-[#f0f0f0] px-6 py-3 rounded-xl hover:border-[#c8a96e] hover:text-[#c8a96e] transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Précédent
                </button>
                <button
                  onClick={handleNext}
                  className="bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-[#f0f0f0]">
                Récapitulatif
              </h2>

              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2">
                    {formData.title}
                  </h3>
                  <p className="text-[#8b8fa8]">{formData.location}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#8b8fa8] text-sm">Prix</p>
                    <p className="text-[#c8a96e] font-semibold">
                      {formData.price_per_month.toLocaleString('fr-FR')} DZD/mois
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8b8fa8] text-sm">Surface</p>
                    <p className="text-[#f0f0f0] font-semibold">
                      {formData.surface_area}m²
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8b8fa8] text-sm">Chambres</p>
                    <p className="text-[#f0f0f0] font-semibold">
                      {formData.bedrooms}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#8b8fa8] text-sm">Salles de bain</p>
                    <p className="text-[#f0f0f0] font-semibold">
                      {formData.bathrooms}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[#8b8fa8] text-sm mb-2">Description</p>
                  <p className="text-[#f0f0f0] whitespace-pre-line">
                    {formData.description}
                  </p>
                </div>

                {images.length > 0 && (
                  <div>
                    <p className="text-[#8b8fa8] text-sm mb-2">Photos ({images.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={loading}
                  className="border border-[rgba(255,255,255,0.12)] text-[#f0f0f0] px-6 py-3 rounded-xl hover:border-[#c8a96e] hover:text-[#c8a96e] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Précédent
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#c8a96e] text-[#08090a] font-semibold px-6 py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Publier l'annonce
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
