import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Certificate } from '../../types';
import { X, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface CertificateViewerProps {
  eventId: number;
  eventTitle: string;
  onClose: () => void;
}

export default function CertificateViewer({ eventId, eventTitle, onClose }: CertificateViewerProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCerts() {
      const { data: certs, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('event_id', eventId);
        
      if (error || !certs) {
        console.error("Failed to load certs", error);
        setLoading(false);
        return;
      }
      
      const mappedCerts: Certificate[] = certs.map(c => ({
        id: c.id,
        eventId: c.event_id,
        fileName: c.file_name,
        mimeType: c.mime_type,
        storagePath: c.storage_path
      }));
      
      setCertificates(mappedCerts);
      
      const urls: Record<string, string> = {};
      for (const cert of mappedCerts) {
        const { data } = await supabase.storage
          .from('certificates')
          .createSignedUrl(cert.storagePath, 3600);
          
        if (data) {
          urls[cert.id!] = data.signedUrl;
        }
      }
      setObjectUrls(urls);
      setLoading(false);
    }
    loadCerts();
  }, [eventId]);

  const next = () => setCurrentIndex(i => Math.min(i + 1, certificates.length - 1));
  const prev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17212B]/40 backdrop-blur-sm">
        <div className="bg-[#FCFBF9] p-6 border border-[var(--color-border)] rounded-sm shadow-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[var(--color-text-accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-text-primary)]">Loading certificates...</span>
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return null;
  }

  const currentCert = certificates[currentIndex];
  const currentUrl = objectUrls[currentCert.id!];
  const isImage = currentCert.mimeType.startsWith('image/');
  const isPdf = currentCert.mimeType === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17212B]/60 p-4">
      <div className="bg-[#FCFBF9] border border-[var(--color-border)] rounded-sm shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] bg-white z-10 shrink-0">
          <div>
            <h2 className="text-lg font-serif text-[var(--color-text-primary)]">Proof for {eventTitle}</h2>
            <p className="editorial-subhead text-[var(--color-text-secondary)] mt-1">
              {currentCert.fileName} ({currentIndex + 1} of {certificates.length})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={currentUrl}
              download={currentCert.fileName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-widest uppercase text-[var(--color-text-primary)] bg-white border border-[var(--color-border-dark)] hover:bg-[#F5F1E7] rounded-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <button onClick={onClose} className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-white border border-[var(--color-border)] rounded-sm transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-auto bg-[#FDFBF8] p-6 flex items-center justify-center relative min-h-[400px]">
          {isImage && (
            <img 
              src={currentUrl} 
              alt={currentCert.fileName} 
              className="max-w-full max-h-full object-contain shadow-md rounded-sm border border-[var(--color-border-dark)] bg-white p-2"
            />
          )}
          
          {isPdf && (
            <iframe 
              src={`${currentUrl}#toolbar=0`} 
              title={currentCert.fileName}
              className="w-full h-full min-h-[60vh] rounded-sm border border-[var(--color-border-dark)] shadow-md bg-white p-1"
            />
          )}

          {!isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
              <FileText className="w-16 h-16 mb-4 text-[var(--color-border-dark)]" />
              <p className="text-sm">Preview not available for this file type.</p>
              <a href={currentUrl} target="_blank" rel="noreferrer" className="text-[var(--color-text-accent)] hover:underline mt-2 text-sm font-medium">
                Download to view
              </a>
            </div>
          )}

          {/* Navigation Arrows */}
          {certificates.length > 1 && (
            <>
              <button 
                onClick={prev} 
                disabled={currentIndex === 0}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-2 bg-white/90 shadow-sm border border-[var(--color-border-dark)] text-[var(--color-text-primary)] rounded-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={next} 
                disabled={currentIndex === certificates.length - 1}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-white/90 shadow-sm border border-[var(--color-border-dark)] text-[var(--color-text-primary)] rounded-sm hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
