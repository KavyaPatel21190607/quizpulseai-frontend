import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Upload, Search, FolderOpen, Download } from 'lucide-react';
import { apiClient } from '../../services/api';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  classLevel: string;
  file: {
    filename: string;
    url: string;
    size: number;
    type: string;
  };
  uploadedBy?: {
    name?: string;
  };
  createdAt?: string;
}

export default function ResourcesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    classLevel: '',
  });

  const loadResources = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.getResources(query);
      const backendResources = response?.data?.resources || [];

      const mapped: ResourceItem[] = backendResources.map((item: any) => ({
        id: String(item._id || item.id),
        title: item.title || 'Untitled resource',
        description: item.description || '',
        subject: item.subject || '',
        classLevel: item.classLevel || '',
        file: {
          filename: item.file?.filename || 'file',
          url: item.file?.url || '#',
          size: item.file?.size || 0,
          type: item.file?.type || '',
        },
        uploadedBy: item.uploadedBy,
        createdAt: item.createdAt,
      }));

      setResources(mapped);
    } catch (err: any) {
      setError(err?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      loadResources(searchQuery.trim());
    }, 250);

    return () => window.clearTimeout(id);
  }, [searchQuery]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && !form.title.trim()) {
      setForm((prev) => ({ ...prev, title: file.name }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      await apiClient.uploadResource({
        file: selectedFile,
        title: form.title,
        description: form.description,
        subject: form.subject,
        classLevel: form.classLevel,
      });

      setSelectedFile(null);
      setForm({ title: '', description: '', subject: '', classLevel: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadResources(searchQuery.trim());
    } catch (err: any) {
      setError(err?.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Resources</h1>
            <p className="text-muted-foreground">Upload and discover study material from Supabase storage</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            <Upload className="w-5 h-5" />
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </motion.div>

      <div className="bg-background border border-border rounded-xl p-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Resource title"
            className="w-full px-4 py-3 bg-accent/30 border border-border rounded-lg"
          />
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            placeholder="Subject"
            className="w-full px-4 py-3 bg-accent/30 border border-border rounded-lg"
          />
          <input
            type="text"
            value={form.classLevel}
            onChange={(e) => setForm((prev) => ({ ...prev, classLevel: e.target.value }))}
            placeholder="Class"
            className="w-full px-4 py-3 bg-accent/30 border border-border rounded-lg"
          />
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description"
            className="w-full px-4 py-3 bg-accent/30 border border-border rounded-lg"
          />
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected'}
          </div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-3 bg-accent/30 border border-border rounded-lg"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-300 text-red-700 bg-red-50">{error}</div>
        )}

        {loading ? (
          <div className="py-14 text-center text-muted-foreground">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="py-14 text-center text-muted-foreground">
            <FolderOpen className="w-16 h-16 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No resources available</p>
            <p className="text-sm mt-2">Upload a file to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <div key={resource.id} className="p-4 border border-border rounded-lg bg-accent/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{resource.description || 'No description'}</p>
                    <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-3">
                      <span>Subject: {resource.subject || 'N/A'}</span>
                      <span>Class: {resource.classLevel || 'N/A'}</span>
                      <span>Size: {formatFileSize(resource.file.size)}</span>
                      <span>By: {resource.uploadedBy?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  <a
                    href={resource.file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-accent"
                  >
                    <Download className="w-4 h-4" />
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
