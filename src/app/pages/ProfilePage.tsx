import { motion } from 'motion/react';
import { useRef, useState } from 'react';
import { User, Mail, Building, Calendar, Edit, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    institution: user?.institution || '',
    bio: user?.bio || '',
  });

  const syncLocalUser = (updates: { name?: string; institution?: string; bio?: string; avatar?: string }) => {
    const rawStoredUser = localStorage.getItem('quizpulse_user');
    if (!rawStoredUser) {
      return;
    }

    const storedUser = JSON.parse(rawStoredUser);
    const mergedUser = { ...storedUser, ...updates };
    localStorage.setItem('quizpulse_user', JSON.stringify(mergedUser));
  };

  const handleProfileFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaveError('');
      setIsSaving(true);

      const response = await apiClient.updateProfile({
        name: profileForm.name.trim(),
        institution: profileForm.institution.trim(),
        bio: profileForm.bio.trim(),
      });

      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setProfileForm({
          name: updatedUser.name || '',
          institution: updatedUser.institution || '',
          bio: updatedUser.bio || '',
        });
        syncLocalUser({
          name: updatedUser.name,
          institution: updatedUser.institution,
          bio: updatedUser.bio,
        });
      }

      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      institution: user?.institution || '',
      bio: user?.bio || '',
    });
    setSaveError('');
    setIsEditing(false);
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    try {
      setUploadError('');
      setIsUploadingAvatar(true);
      const response = await apiClient.uploadProfileAvatar(file);

      const uploadedAvatarUrl = response?.data?.user?.avatar || response?.data?.avatar?.url;
      if (uploadedAvatarUrl) {
        setAvatarUrl(uploadedAvatarUrl);
        syncLocalUser({ avatar: uploadedAvatarUrl });
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload profile image');
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const profileImage = avatarUrl || user?.avatar || '';
  const userName = profileForm.name || user?.name || 'User';
  const institution = profileForm.institution || user?.institution || '';
  const bio = profileForm.bio || user?.bio || '';
  const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
  const memberSince = createdAt
    ? createdAt.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-6">
            <div className="relative mb-4 sm:mb-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={userName}
                  className="w-32 h-32 rounded-full border-4 border-background object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-background bg-accent/40 flex items-center justify-center text-2xl font-semibold">
                  {initials}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <button
                onClick={handleAvatarButtonClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-60"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Edit className="w-5 h-5" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-accent disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>

          {isUploadingAvatar && (
            <p className="text-sm text-muted-foreground mb-4">Uploading profile image...</p>
          )}
          {uploadError && (
            <p className="text-sm text-red-600 mb-4">{uploadError}</p>
          )}
          {saveError && <p className="text-sm text-red-600 mb-4">{saveError}</p>}

          {/* Info */}
          <div className="space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
              <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
                <User className="w-5 h-5 text-muted-foreground" />
                {isEditing ? (
                  <input
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileFieldChange}
                    className="w-full bg-transparent outline-none font-medium"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <span className="font-medium">{userName}</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email Address</label>
              <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Institution</label>
              <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
                <Building className="w-5 h-5 text-muted-foreground" />
                {isEditing ? (
                  <input
                    name="institution"
                    value={profileForm.institution}
                    onChange={handleProfileFieldChange}
                    className="w-full bg-transparent outline-none font-medium"
                    placeholder="Enter your institution"
                  />
                ) : (
                  <span className="font-medium">{institution || 'Not set'}</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Bio</label>
              <div className="p-4 bg-accent/30 rounded-lg">
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileFieldChange}
                    className="w-full min-h-24 bg-transparent outline-none font-medium resize-y"
                    placeholder="Write something about yourself"
                    maxLength={500}
                  />
                ) : (
                  <p className="font-medium whitespace-pre-wrap">{bio || 'No bio added yet.'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Member Since</label>
              <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
