import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, Save, Eye, EyeOff, Loader2, Link, PlayCircle, CheckCircle, XCircle, Upload, Trash2, Check, AlignLeft, Plus, X } from 'lucide-react';
import api from '../../../services/api';
import { useTheme } from '../../../context/ThemeContext';

const PromoVideoView = () => {
    const { theme } = useTheme();
    const [config, setConfig] = useState({
        url: '',
        cloudinaryUrl: '',
        title: '',
        description: '',
        isActive: false,
        isMuted: true, // Default to true (standard autoplay behavior)
        descriptions: [],
        library: []
    });
    const [originalConfig, setOriginalConfig] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [previewMuted, setPreviewMuted] = useState(false); // default audio to ON
    const previewVideoRef = useRef(null);

    // Try playing unmuted by default in preview. If browser blocks, fallback to muted autoplay.
    useEffect(() => {
        const vid = previewVideoRef.current;
        if (vid && config && config.cloudinaryUrl) {
            vid.muted = previewMuted;
            if (!previewMuted) {
                vid.play().catch((err) => {
                    console.warn("[Admin Preview Video] Unmuted autoplay blocked, falling back to muted autoplay:", err);
                    setPreviewMuted(true);
                    vid.muted = true;
                    vid.setAttribute('muted', '');
                    vid.play().catch(() => {});
                });
            }
        }
    }, [config.cloudinaryUrl]);

    const handlePreviewAudioToggle = () => {
        const vid = previewVideoRef.current;
        if (!vid) return;

        const newMuted = !previewMuted;
        setPreviewMuted(newMuted);

        vid.muted = newMuted;
        if (newMuted) {
            vid.setAttribute('muted', '');
        } else {
            vid.removeAttribute('muted');
            vid.volume = 1.0;
            vid.play().catch((err) => console.log('[Admin Preview] play failed:', err));
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log('[Upload] Selected file:', file.name, 'type:', file.type, 'size:', (file.size / (1024*1024)).toFixed(2), 'MB');

        setUploadingVideo(true);
        const formData = new FormData();
        formData.append('video', file);

        try {
            console.log('[Upload] Sending POST to /admin/promo-video/upload...');
            const { data } = await api.post('/admin/promo-video/upload', formData, {
                timeout: 10 * 60 * 1000, // 10 minutes for large video uploads
                onUploadProgress: (progressEvent) => {
                    const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`[Upload] Progress: ${pct}%`);
                }
            });
            console.log('[Upload] Response:', data);
            if (data.success && data.url) {
                setConfig(data.data);
                setOriginalConfig(data.data);
                showToast('Video uploaded successfully to Cloudinary!', 'success');
            } else {
                showToast(data.message || 'Upload failed', 'error');
            }
        } catch (err) {
            console.error('[Upload] FULL ERROR:', err);
            console.error('[Upload] Response data:', err.response?.data);
            console.error('[Upload] Response status:', err.response?.status);
            console.error('[Upload] Request headers:', err.config?.headers);
            showToast(err.response?.data?.message || 'Video upload failed', 'error');
        } finally {
            setUploadingVideo(false);
        }
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/admin/promo-video');
                if (data.success && data.data) {
                    setConfig(data.data);
                    setOriginalConfig(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch promo video config');
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm('Are you sure you want to delete this video from the library?')) return;
        setDeletingId(videoId);
        try {
            const { data } = await api.delete(`/admin/promo-video/library/${videoId}`);
            if (data.success && data.data) {
                setConfig(data.data);
                setOriginalConfig(data.data);
                showToast('Video deleted successfully!', 'success');
            }
        } catch (err) {
            console.error('Failed to delete video:', err);
            showToast(err.response?.data?.message || 'Failed to delete video', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetActiveVideo = (video) => {
        setConfig(p => ({ ...p, cloudinaryUrl: video.url, url: '', title: video.title || p.title }));
        showToast('Video set as active! Remember to click Save Configuration.', 'success');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            console.log('[Save] Sending config:', { url: config.url, cloudinaryUrl: config.cloudinaryUrl, title: config.title, isActive: config.isActive, description: config.description });
            const { data } = await api.put('/admin/promo-video', config);
            if (data.success && data.data) {
                setConfig(data.data);
                setOriginalConfig(data.data);
                showToast('Promo video settings saved!', 'success');
            }
        } catch (err) {
            showToast('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const hasUnsavedChanges = originalConfig && JSON.stringify(config) !== JSON.stringify(originalConfig);

    const getEmbedUrl = (url, isMuted) => {
        if (!url) return '';
        const muteParam = isMuted ? 1 : 0;
        // Support standard, sharing, embed, and query-param formats
        const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?controls=1&autoplay=1&mute=${muteParam}&loop=1&playlist=${ytMatch[1]}`;
        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=${muteParam}&loop=1&controls=1`;
        return url; // already embed or cloudinary
    };

    const embedUrl = getEmbedUrl(config.url || config.cloudinaryUrl, config.isMuted !== false);

    if (loading) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl text-left">
            
            {/* Toast */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl ${
                        toast.type === 'success'
                            ? 'bg-emerald-600 text-text-primary shadow-emerald-600/20'
                            : 'bg-rose-600 text-text-primary shadow-rose-600/20'
                    }`}
                >
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {toast.msg}
                </motion.div>
            )}

            {/* Header */}
            <div className="space-y-1">
                <h2 className={`text-3xl font-black tracking-tighter uppercase leading-none ${theme === 'dark' ? 'text-text-primary' : 'text-slate-800'}`}>
                    Promo <span className="text-blue-500">Video</span>.
                </h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">
                    Configure promotional video displayed on landing page.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Config Panel */}
                <div className="space-y-6">
                    
                    {/* Video Title */}
                    <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Video Configuration</h3>
                        
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Video Title</label>
                            <input
                                type="text"
                                value={config.title}
                                onChange={e => setConfig(p => ({ ...p, title: e.target.value }))}
                                placeholder="Enter video title..."
                                autoComplete="off"
                                className="w-full bg-white/5 border border-border-subtle rounded-2xl px-5 py-3.5 text-[12px] font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <AlignLeft size={12} /> Video Description
                            </label>
                            
                            {/* Preset Descriptions */}
                            {config.descriptions && config.descriptions.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Select a Default Description:</p>
                                    <div className="flex flex-col gap-2">
                                        {config.descriptions.map((desc, idx) => (
                                            <div key={idx} className="flex gap-2 items-start">
                                                <button
                                                    onClick={() => setConfig(p => ({ ...p, description: desc }))}
                                                    className={`flex-1 text-left px-4 py-2.5 rounded-xl text-[11px] font-medium leading-relaxed transition-all ${
                                                        config.description === desc 
                                                            ? 'bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/5'
                                                            : 'bg-gray-50 dark:bg-white/5 border border-border-subtle text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-text-primary'
                                                    }`}
                                                >
                                                    {desc}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Remove this default description?')) {
                                                            setConfig(p => ({
                                                                ...p,
                                                                descriptions: p.descriptions.filter((_, i) => i !== idx)
                                                            }));
                                                        }
                                                    }}
                                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                                                    title="Delete preset"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Preset or Custom Description */}
                            <div className="relative">
                                <textarea
                                    value={config.description}
                                    onChange={e => setConfig(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Enter or select a video description..."
                                    rows="3"
                                    className="w-full bg-white/5 border border-border-subtle rounded-2xl px-5 py-3.5 text-[12px] font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                />
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button
                                        onClick={() => setConfig(p => ({ ...p, description: '' }))}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black text-gray-400 hover:text-text-primary uppercase tracking-wider transition-colors flex items-center gap-1"
                                        title="Clear text"
                                    >
                                        <X size={10} /> Clear
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (config.description.trim() && !config.descriptions?.includes(config.description.trim())) {
                                                setConfig(p => ({
                                                    ...p,
                                                    descriptions: [...(p.descriptions || []), p.description.trim()]
                                                }));
                                                showToast('Added to presets!', 'success');
                                            }
                                        }}
                                        disabled={!config.description.trim() || config.descriptions?.includes(config.description.trim())}
                                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[9px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 disabled:opacity-50"
                                        title="Save as a new preset description"
                                    >
                                        <Plus size={10} /> Save as Preset
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Link size={12} /> YouTube / Vimeo URL
                            </label>
                            <input
                                type="url"
                                value={config.url}
                                onChange={e => setConfig(p => ({ ...p, url: e.target.value }))}
                                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                autoComplete="off"
                                className="w-full bg-white/5 border border-border-subtle rounded-2xl px-5 py-3.5 text-[11px] font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest ml-1">
                                Supports: youtube.com, youtu.be, vimeo.com
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Video size={12} /> Cloudinary Video URL (Optional)
                            </label>
                            <div className="flex gap-4">
                                <input
                                    type="url"
                                    value={config.cloudinaryUrl}
                                    onChange={e => setConfig(p => ({ ...p, cloudinaryUrl: e.target.value }))}
                                    placeholder="https://res.cloudinary.com/..."
                                    autoComplete="off"
                                    className="flex-1 bg-white/5 border border-border-subtle rounded-2xl px-5 py-3.5 text-[11px] font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <label className="cursor-pointer px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0">
                                    {uploadingVideo ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                                    {uploadingVideo ? 'Uploading...' : 'Upload File'}
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                        disabled={uploadingVideo}
                                        className="hidden"
                                    />
                                </label>
                                {config.cloudinaryUrl && (
                                    <button
                                        onClick={() => setConfig(p => ({ ...p, cloudinaryUrl: '' }))}
                                        className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-colors flex items-center justify-center shrink-0"
                                        title="Clear Cloudinary URL"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between p-5 bg-white/[0.02] dark:bg-white/[0.02] border border-border-subtle rounded-2xl">
                            <div>
                                <p className="text-text-primary font-black text-sm uppercase tracking-tight">Show on Landing Page</p>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {config.isActive ? 'Video is visible to visitors' : 'Video is hidden from visitors'}
                                </p>
                            </div>
                            <button
                                onClick={() => setConfig(p => ({ ...p, isActive: !p.isActive }))}
                                className={`w-16 h-8 rounded-full transition-all relative ${config.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-border-subtle'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-300 transition-all shadow-md ${config.isActive ? 'left-9' : 'left-1'}`} />
                            </button>
                        </div>

                        {/* Mute Toggle */}
                        <div className="flex items-center justify-between p-5 bg-white/[0.02] dark:bg-white/[0.02] border border-border-subtle rounded-2xl">
                            <div>
                                <p className="text-text-primary font-black text-sm uppercase tracking-tight">Mute Video Sound</p>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {config.isMuted ? 'Voice is OFF (Recommended for Autoplay)' : 'Voice is ON (Autoplay may be blocked by browsers)'}
                                </p>
                            </div>
                            <button
                                onClick={() => setConfig(p => ({ ...p, isMuted: !p.isMuted }))}
                                className={`w-16 h-8 rounded-full transition-all relative ${config.isMuted ? 'bg-blue-600' : 'bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-border-subtle'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-300 transition-all shadow-md ${config.isMuted ? 'left-9' : 'left-1'}`} />
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !hasUnsavedChanges}
                            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
                                hasUnsavedChanges
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 animate-pulse'
                                    : 'bg-white/5 border border-border-subtle text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Configuration' : 'Saved'}
                        </button>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 space-y-6">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-3">
                        <PlayCircle size={18} className="text-blue-500" /> Live Preview
                    </h3>

                    {embedUrl ? (
                        config.cloudinaryUrl && !config.url ? (
                            <div className="w-full rounded-2xl overflow-hidden bg-black relative flex justify-center items-center group/vid">
                                <video
                                    ref={previewVideoRef}
                                    src={config.cloudinaryUrl}
                                    autoPlay
                                    loop
                                    muted={previewMuted}
                                    playsInline
                                    className="w-full h-auto max-h-[400px] object-contain"
                                />
                                <button
                                    onClick={handlePreviewAudioToggle}
                                    className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/10 hover:bg-black/80 transition-all shadow-xl"
                                >
                                    {previewMuted ? '🔇 Tap for Audio' : '🔊 Mute'}
                                </button>
                            </div>
                        ) : (
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative">
                                <iframe
                                    src={embedUrl}
                                    title={config.title || 'Promo Video'}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full border-none"
                                />
                            </div>
                        )
                    ) : (
                        <div className="aspect-video rounded-2xl bg-white/[0.02] dark:bg-white/[0.02] border border-border-subtle flex flex-col items-center justify-center gap-4">
                            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                <Video size={32} />
                            </div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center">
                                Paste a YouTube or Vimeo URL<br />to preview here
                            </p>
                        </div>
                    )}

                    {config.title && (
                        <p className="text-text-primary font-black text-sm tracking-tight">{config.title}</p>
                    )}
                    
                    {config.description && (
                        <p className="text-gray-400 text-xs leading-relaxed">{config.description}</p>
                    )}

                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${config.isActive ? 'text-emerald-400' : 'text-gray-600'}`}>
                        {config.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {config.isActive ? 'Visible on Landing Page' : 'Hidden from Landing Page'}
                    </div>
                </div>
            </div>

            {/* Media Library Panel */}
            <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-3">
                        <Video size={18} className="text-blue-500" /> Video Library History
                    </h3>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {config.library?.length || 0} Videos
                    </span>
                </div>

                {config.library && config.library.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {config.library.map(video => (
                            <div key={video._id} className="bg-white/[0.02] dark:bg-white/[0.02] border border-border-subtle rounded-2xl overflow-hidden flex flex-col group relative">
                                {/* Active Indicator overlay */}
                                {config.cloudinaryUrl === video.url && (
                                    <div className="absolute top-3 left-3 z-10 bg-blue-500 text-text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/20">
                                        <Check size={10} /> Active
                                    </div>
                                )}
                                
                                <div className="aspect-video bg-black relative">
                                    <video src={video.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-5 flex flex-col flex-1 gap-4">
                                    <div className="flex-1">
                                        <p className="text-text-primary font-black text-xs uppercase tracking-wider truncate" title={video.title || 'Untitled Video'}>
                                            {video.title || 'Untitled Video'}
                                        </p>
                                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                                            {new Date(video.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleSetActiveVideo(video)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-text-primary text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors"
                                        >
                                            Set Active
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteVideo(video._id)}
                                            disabled={deletingId === video._id}
                                            className="w-10 h-10 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === video._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center border border-dashed border-border-subtle rounded-2xl bg-white/[0.01]">
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                            No videos in library. Upload a video to see history.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromoVideoView;
