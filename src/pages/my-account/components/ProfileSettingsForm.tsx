import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UpdateUserPayload } from '../service/api';
import { fetchUserProfile, updateUser, uploadUserAvatar } from '../service/api';
import { useToast } from '../../../contexts/ToastContext';
import { UserCircle } from 'lucide-react';

type Props = { userId: string; token: string; onUpdated?: (u: any) => void; formId?: string };

const schema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  date_of_birth: z.string().date('Invalid date').optional().or(z.literal('')).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  province: z.string().max(100).optional(),
  address_line: z.string().max(255).optional(),
  district: z.string().max(100).optional(),
  sector: z.string().max(100).optional(),
  cell: z.string().max(100).optional(),
  village: z.string().max(100).optional(),
  location: z
    .object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
});

type FormValues = z.infer<typeof schema>;

const ProfileSettingsForm: React.FC<Props> = ({ userId, token, onUpdated, formId = 'profile-settings-form' }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: {} });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchUserProfile(token);
        const data = res.data;
        if (!data) return;
        const dob = (data.date_of_birth || data.dateOfBirth || '').toString().slice(0, 10) || '';
        let lat: number | undefined;
        let lng: number | undefined;
        // Normalize location from different backend shapes
        const g = data.location?.geometry || data.location;
        if (g?.type === 'Point' && Array.isArray(g.coordinates)) {
          lng = Number(g.coordinates[0]);
          lat = Number(g.coordinates[1]);
        } else if (Array.isArray(g)) {
          // Some APIs may return [lng, lat]
          lng = Number(g[0]);
          lat = Number(g[1]);
        } else if (g?.lat != null && g?.lng != null) {
          lat = Number(g.lat);
          lng = Number(g.lng);
        }

        reset({
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          date_of_birth: dob || undefined,
          gender: data.gender as any,
          province: data.province,
          // Map various API keys to address_line
          address_line: data.address_line || data.addressLine || data.address,
          district: data.district,
          sector: data.sector,
          cell: data.cell,
          village: data.village,
          location: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
        });
        setAvatarUrl(data.profileImageUrl || data.profile_image || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, reset]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const payload: UpdateUserPayload = {
        ...values,
        location: values.location && values.location.lat !== undefined && values.location.lng !== undefined ? { lat: values.location.lat, lng: values.location.lng } : undefined,
      };
      const res = await updateUser(userId, payload, token);
      if (res.success) {
        onUpdated?.(res.data);
        alert('Profile updated');
        setSaving(false);
        return;
      }
      alert(res as any);
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file: File) => {
    try {
      setSaving(true);
      const res = await uploadUserAvatar(userId, file, token);
      const url = res?.data?.profileImageUrl || res?.data?.data?.profileImageUrl;
      if (url) {
        setAvatarUrl(url);
        onUpdated?.(res.data);
      }
    } finally {
      setSaving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));
      setValue('location.lat', lat, { shouldDirty: true });
      setValue('location.lng', lng, { shouldDirty: true });
    });
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Top action bar */}
      <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-white/80 backdrop-blur flex justify-end">
        <button
          type="submit"
          disabled={!isDirty || saving}
          className="px-4 py-2 rounded-xl bg-my-primary text-white shadow-sm hover:brightness-110 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div className="flex flex-col items-center gap-2">
          {avatarUrl ? (
            <img src={avatarUrl} className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-2 ring-white/20" />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center dark:from-slate-800 dark:to-slate-700">
              <UserCircle className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400 dark:text-slate-500" />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              const preview = URL.createObjectURL(f);
              setAvatarUrl(preview);
              upload(f);
            }
          }} />
          <button type="button" className="px-3 py-2 rounded-lg border text-sm dark:border-slate-700 dark:text-slate-100" onClick={() => fileRef.current?.click()} disabled={saving}>Upload avatar</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 flex-1 w-full">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">First Name</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('firstName')} />
            {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message as any}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Last Name</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('lastName')} />
            {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message as any}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Bio</label>
            <textarea className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" rows={3} maxLength={500} {...register('bio')} />
            {errors.bio && <p className="text-xs text-red-600">{errors.bio.message as any}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Date of Birth</label>
            <input type="date" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('date_of_birth')} />
            {errors.date_of_birth && <p className="text-xs text-red-600">{errors.date_of_birth.message as any}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Gender</label>
            <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('gender')}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-xs text-red-600">{errors.gender.message as any}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Province</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('province')} />
            {errors.province && <p className="text-xs text-red-600">{errors.province.message as any}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Address Line</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('address_line')} />
            {errors.address_line && <p className="text-xs text-red-600">{errors.address_line.message as any}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">District</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('district')} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Sector</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('sector')} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Cell</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('cell')} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-slate-300">Village</label>
            <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" {...register('village')} />
          </div>

          {/* Hidden geo fields - maintained in form state */}
          <input type="hidden" {...register('location.lat')} />
          <input type="hidden" {...register('location.lng')} />
          <div className="md:col-span-2">
            <button type="button" className="px-3 py-2 rounded-lg border dark:border-slate-700 dark:text-slate-100" onClick={useCurrentLocation}>Use current location</button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="px-4 py-2 rounded-xl bg-primary-600 text-white disabled:opacity-50" disabled={!isDirty || saving}>Save Profile</button>
      </div>
      {/* Bottom action */}
      <div className="sticky bottom-0 z-10 -mx-6 px-6 py-3 flex justify-end">
        {/* <button
          type="submit"
          disabled={!isDirty || saving}
          className="px-4 py-2 rounded-xl  text-white  bg-my-primary font-semibold shadow hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button> */}
      </div>
    </form>
  );
};

export default ProfileSettingsForm;


