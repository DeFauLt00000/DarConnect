'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { Loader2, Save, Trash2, X, Image as ImageIcon, CheckCircle } from 'lucide-react';

interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  price_per_month: number;
  bedrooms: number;
  bathrooms: number;
  surface_area: number;
  is_available: boolean;
}

interface PropertyImage {
  id: string;
  image_url: string;
  display_order: number;
}

export default function EditPropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    location: '',
    price_per_month: 0,
    bedrooms: 1,
    bathrooms: 1,
    surface_area: 0,
    is_available: true,
  });
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error || !property) {
        router.push('/sell');
        return;
      }

      if (property.owner_id !== user.id) {
        router.push('/sell');
        return;
      }

      setFormData({
        title: property.title,
        description: property.description || '',
        location: property.location,
        price_per_month: property.price_per_month,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        surface_area: property.surface_area || 0,
        is_available: property.is_available ?? true,
      });

      const { data: images } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('display_order', { ascending: true });

      if (images) {
        setExistingImages(images);
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PropertyFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (file: File) => {
    const totalImages = existingImages.length + newImages.length;
    if (totalImages >= 5) {
      setError('Maximum 5 images autorisées');
      return;
    }
    setNewImages((prev) => [...prev, file]);
  };

  const handleNewImageRemove = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExistingImageRemove = async (imageId: string) => {
    try {
      const image = existingImages.find((img) => img.id === imageId);
      if (!image) return;

      const { error: deleteError } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (deleteError) {
        setError('Erreur lors de la suppression de l\'image');
        return;
      }

      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setError('Une erreur est survenue');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Vous devez être connecté');
        return;
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          price_per_month: formData.price_per_month,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          surface_area: formData.surface_area,
          is_available: formData.is_available,
        })
        .eq('id', propertyId);

      if (updateError) {
        setError('Erreur lors de la mise à jour de l\'annonce');
        return;
      }

      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${propertyId}/${Date.now()}-${file.name}`;

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
          property_id: propertyId,
          image_url: publicUrl,
          display_order: existingImages.length + i,
        });
      }

      setNewImages([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      await fetchProperty();
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      for (const image of existingImages) {
        const filePath = image.image_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('property-images')
            .remove([`${propertyId}/${filePath}`]);
        }
      }

      await supabase.from('property_images').delete().eq('property_id', propertyId);

      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (deleteError) {
        setError('Erreur lors de la suppression de l\'annonce');
        return;
      }

      router.push('/sell');
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c8a96e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#f0f0f0]">
            Modifier l'annonce
          </h1>
          <p className="text-[#8b8fa8]">
            Mettez à jour les informations de votre bien
          </p>
        </div>

        <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 mb-8">
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

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => handleInputChange('is_available', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[rgba(255,255,255,0.12)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#c8a96e] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c8a96e]" />
              </label>
              <span className="text-[#f0f0f0]">Disponible à la location</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 text-[#f0f0f0]">
            Photos ({existingImages.length + newImages.length}/5)
          </h2>

          {existingImages.length > 0 && (
            <div className="mb-6">
              <p className="text-[#8b8fa8] text-sm mb-4">Photos existantes</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url}
                      alt="Property"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleExistingImageRemove(image.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newImages.length > 0 && (
            <div className="mb-6">
              <p className="text-[#8b8fa8] text-sm mb-4">Nouvelles photos</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleNewImageRemove(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingImages.length + newImages.length < 5 && (
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
                      if (existingImages.length + newImages.length < 5) {
                        handleImageSelect(file);
                      }
                    });
                  }
                };
                input.click();
              }}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all border-[rgba(255,255,255,0.12)] hover:border-[#c8a96e]"
            >
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[#8b8fa8]" />
              <p className="text-[#f0f0f0] mb-2">
                Cliquez pour ajouter des photos
              </p>
              <p className="text-[#8b8fa8] text-sm">
                Max 5 images • 5MB par image
              </p>
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e] px-4 py-3 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Annonce mise à jour avec succès</span>
          </motion.div>
        )}

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#c8a96e] text-[#08090a] font-semibold py-3 rounded-xl hover:bg-[#d4b87a] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Enregistrer
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="border border-[rgba(239,68,68,0.3)] text-[#ef4444] px-6 py-3 rounded-xl hover:bg-[rgba(239,68,68,0.1)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            Supprimer
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111318] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#f0f0f0]">
                Supprimer l'annonce
              </h2>
              <p className="text-[#8b8fa8] mb-6">
                Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 border border-[rgba(255,255,255,0.12)] text-[#f0f0f0] py-3 rounded-xl hover:border-[#c8a96e] hover:text-[#c8a96e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-[#ef4444] text-white py-3 rounded-xl hover:bg-[#dc2626] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
