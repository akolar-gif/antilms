"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImagePicker() {
  const [tab, setTab] = useState<"upload" | "stock">("upload");
  const [stockImages, setStockImages] = useState<{id: string, download_url: string}[]>([]);
  const [selectedStockUrl, setSelectedStockUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load stock images when switching to stock tab
  useEffect(() => {
    if (tab === "stock" && stockImages.length === 0) {
      loadStockImages();
    }
  }, [tab]);

  const loadStockImages = async () => {
    setIsLoadingStock(true);
    try {
      const randomPage = Math.floor(Math.random() * 50) + 1;
      const res = await fetch(`https://picsum.photos/v2/list?page=${randomPage}&limit=9`);
      const data = await res.json();
      setStockImages(data);
    } catch (error) {
      console.error("Failed to load stock images", error);
    } finally {
      setIsLoadingStock(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedStockUrl(""); // Clear stock selection
    }
  };

  const handleStockSelect = (url: string) => {
    setSelectedStockUrl(url);
    setPreviewUrl(url);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
            tab === "upload" ? "bg-white text-royal-blue border-b-2 border-royal-blue" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Upload className="w-4 h-4" /> Upload
        </button>
        <button
          type="button"
          onClick={() => setTab("stock")}
          className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 ${
            tab === "stock" ? "bg-white text-royal-blue border-b-2 border-royal-blue" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Stock Image
        </button>
      </div>

      <div className="p-4">
        {/* Hidden inputs to pass data to the form action */}
        <input 
          type="file" 
          name="courseImage" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange}
          className="hidden"
        />
        <input type="hidden" name="stockImageUrl" value={selectedStockUrl} />

        {/* Upload Tab Empty State */}
        {tab === "upload" && !previewUrl && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-100 hover:border-royal-blue transition-all group"
          >
            <div className="w-12 h-12 bg-royal-blue/10 text-royal-blue rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">Click to browse your files</p>
            <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP (max 5MB)</p>
          </div>
        )}

        {/* Upload Tab Preview */}
        {tab === "upload" && previewUrl && !selectedStockUrl && (
          <div className="relative mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-md border border-slate-200" />
            <Button 
              type="button" 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2 h-7 px-2 text-xs"
              onClick={() => {
                setPreviewUrl("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Remove
            </Button>
          </div>
        )}

        {/* Stock Tab Grid */}
        {tab === "stock" && (
          <div>
            {isLoadingStock ? (
              <div className="flex items-center justify-center h-32 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {stockImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleStockSelect(img.download_url)}
                    className={`relative w-full aspect-video rounded-md overflow-hidden border-2 transition-all ${
                      selectedStockUrl === img.download_url ? "border-emerald-green ring-2 ring-emerald-green/30" : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.download_url} alt="Stock" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-2 text-right">
              <button type="button" onClick={loadStockImages} className="text-xs text-royal-blue hover:underline">
                ↻ Load More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
