import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, MapPin, Briefcase, FileText, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Person } from '../../types';

const personSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  birth_date: z.string().optional(),
  death_date: z.string().optional(),
  birth_place: z.string().optional(),
  occupation: z.string().optional(),
  bio: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other'])
});

type PersonFormData = z.infer<typeof personSchema>;

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonFormData) => Promise<void>;
  person?: Person;
  title?: string;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  person,
  title = "Add Family Member"
}) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: person ? {
      first_name: person.first_name,
      last_name: person.last_name,
      birth_date: person.birth_date?.split('T')[0] || '',
      death_date: person.death_date?.split('T')[0] || '',
      birth_place: person.birth_place || '',
      occupation: person.occupation || '',
      bio: person.bio || '',
      photo_url: person.photo_url || '',
      gender: person.gender
    } : {
      gender: 'male'
    }
  });

  const handleFormSubmit = async (data: PersonFormData) => {
    try {
      // Clean empty strings to null for optional fields
      const cleanedData = {
        ...data,
        birth_date: data.birth_date || undefined,
        death_date: data.death_date || undefined,
        birth_place: data.birth_place || undefined,
        occupation: data.occupation || undefined,
        bio: data.bio || undefined,
        photo_url: data.photo_url || undefined
      };
      
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error to user
      alert('Failed to save person. Please check the console for details.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4" />
                    <span>First Name *</span>
                  </label>
                  <input
                    {...register('first_name')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter first name"
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4" />
                    <span>Last Name *</span>
                  </label>
                  <input
                    {...register('last_name')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter last name"
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <div className="flex space-x-4">
                  {(['male', 'female', 'other'] as const).map((gender) => (
                    <label key={gender} className="flex items-center space-x-2">
                      <input
                        {...register('gender')}
                        type="radio"
                        value={gender}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="capitalize text-sm text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Birth Date</span>
                  </label>
                  <input
                    {...register('birth_date')}
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Death Date</span>
                  </label>
                  <input
                    {...register('death_date')}
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>Birth Place</span>
                </label>
                <input
                  {...register('birth_place')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="City, State, Country"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Occupation</span>
                </label>
                <input
                  {...register('occupation')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Job title or profession"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Camera className="h-4 w-4" />
                  <span>Photo URL</span>
                </label>
                <input
                  {...register('photo_url')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://example.com/photo.jpg"
                />
                {errors.photo_url && (
                  <p className="text-red-500 text-sm mt-1">{errors.photo_url.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4" />
                  <span>Biography</span>
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Tell their story..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Saving...' : person ? 'Update' : 'Add Person'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};