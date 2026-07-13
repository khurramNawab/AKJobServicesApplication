import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Save, Eye, EyeOff, Loader2, Link, PlayCircle, CheckCircle, XCircle, Upload, Trash2, Check } from 'lucide-react';
import api from '../../../services/api';

const PromoVideoView = () => {
    const [config, setConfig] = useState({ url: '', cloudinaryUrl: '', title: '', isActive: false, library: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 50 * 1024 * 1024) {
            showToast('Video is too large. Max size is 50MB.', 'error');
            return;
        }

        setUploadingVideo(true);
        const formData = new FormData();
        formData.append('video', file);

        try {
            const { data } = await api.post('/admin/promo-video/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (data.success && data.url) {
                // The new backend returns the full config with library in data.data
                setConfig(data.data);
                showToast('Video uploaded successfully to Cloudinary!', 'success');
            } else {
                showToast('Upload failed', 'error');
            }
        } catch (err) {
            console.error('Video upload error:', err);
            showToast(err.response?.data?.message || 'Video upload failed', 'error');
        } finally {
            setUploadingVideo(false);
        }
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/admin/promo-video');
                if (data.success && data.data) setConfig(data.data);
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
            await api.put('/admin/promo-video', config);
            showToast('Promo video settings saved!', 'success');
        } catch (err) {
            showToast('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Convert YouTube/Vimeo URL to embed URL
    const getEmbedUrl = (url) => {
        if (!url) return '';
        // YouTube
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?controls=0&autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}`;
        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?controls=0&autoplay=1&muted=1&loop=1`;
        return url; // already embed or cloudinary
    };

    const embedUrl = getEmbedUrl(config.url || config.cloudinaryUrl);

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
                            ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                            : 'bg-rose-600 text-white shadow-rose-600/20'
                    }`}
                >
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {toast.msg}
                </motion.div>
            )}

            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
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
                    <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Video Configuration</h3>
                        
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Video Title</label>
                            <input
                                type="text"
                                value={config.title}
                                onChange={e => setConfig(p => ({ ...p, title: e.target.value }))}
                                placeholder="Enter video title..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-[12px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
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
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-[11px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-[11px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                <label className="cursor-pointer px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0">
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
                            </div>
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <div>
                                <p className="text-white font-black text-sm uppercase tracking-tight">Show on Landing Page</p>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {config.isActive ? 'Video is visible to visitors' : 'Video is hidden from visitors'}
                                </p>
                            </div>
                            <button
                                onClick={() => setConfig(p => ({ ...p, isActive: !p.isActive }))}
                                className={`w-16 h-8 rounded-full transition-all relative ${config.isActive ? 'bg-blue-600' : 'bg-white/10 border border-white/10'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-xl ${config.isActive ? 'left-9' : 'left-1'}`} />
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <PlayCircle size={18} className="text-blue-500" /> Live Preview
                    </h3>

                    {embedUrl ? (
                        config.cloudinaryUrl && !config.url ? (
                            <div className="w-full rounded-2xl overflow-hidden bg-black relative flex justify-center items-center">
                                <video
                                    src={config.cloudinaryUrl}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-auto max-h-[400px] object-contain"
                                />
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
                        <div className="aspect-video rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-4">
                            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                <Video size={32} />
                            </div>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest text-center">
                                Paste a YouTube or Vimeo URL<br />to preview here
                            </p>
                        </div>
                    )}

                    {config.title && (
                        <p className="text-white font-black text-sm tracking-tight">{config.title}</p>
                    )}

                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${config.isActive ? 'text-emerald-400' : 'text-gray-600'}`}>
                        {config.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        {config.isActive ? 'Visible on Landing Page' : 'Hidden from Landing Page'}
                    </div>
                </div>
            </div>

            {/* Media Library Panel */}
            <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Video size={18} className="text-blue-500" /> Video Library History
                    </h3>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {config.library?.length || 0} Videos
                    </span>
                </div>

                {config.library && config.library.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {config.library.map(video => (
                            <div key={video._id} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden flex flex-col group relative">
                                {/* Active Indicator overlay */}
                                {config.cloudinaryUrl === video.url && (
                                    <div className="absolute top-3 left-3 z-10 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/20">
                                        <Check size={10} /> Active
                                    </div>
                                )}
                                
                                <div className="aspect-video bg-black relative">
                                    <video src={video.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-5 flex flex-col flex-1 gap-4">
                                    <div className="flex-1">
                                        <p className="text-white font-black text-xs uppercase tracking-wider truncate" title={video.title || 'Untitled Video'}>
                                            {video.title || 'Untitled Video'}
                                        </p>
                                        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                                            {new Date(video.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleSetActiveVideo(video)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors"
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
                    <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
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
