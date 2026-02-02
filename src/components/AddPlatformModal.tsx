"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
  ResponsiveModalBody,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLATFORMS, Platform, PlatformRating } from "@/types";
import { toast } from "@/hooks/use-toast";

interface AddPlatformModalProps {
  onAdd: (rating: PlatformRating) => void;
  existingPlatforms: string[];
  children: React.ReactNode;
}

export function AddPlatformModal({
  onAdd,
  existingPlatforms,
  children,
}: AddPlatformModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );
  const [rating, setRating] = useState("");
  const [deliveries, setDeliveries] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availablePlatforms = PLATFORMS.filter(
    (p) => !existingPlatforms.includes(p.id)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file", "Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", "Image must be less than 2MB");
      return;
    }

    setScreenshotName(file.name);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Compress by resizing if needed
      compressImage(base64).then(setScreenshot);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = base64;
    });
  };

  const handleSubmit = () => {
    if (!selectedPlatform || !rating || !deliveries) return;

    onAdd({
      platformId: selectedPlatform.id,
      rating: parseFloat(rating),
      totalDeliveries: parseInt(deliveries),
      joinedDate: joinedDate || new Date().toISOString(),
      verified: false,
      proofScreenshot: screenshot || undefined,
    });

    // Reset form
    setSelectedPlatform(null);
    setRating("");
    setDeliveries("");
    setJoinedDate("");
    setScreenshot(null);
    setScreenshotName("");
    setOpen(false);
  };

  const resetForm = () => {
    setSelectedPlatform(null);
    setRating("");
    setDeliveries("");
    setJoinedDate("");
    setScreenshot(null);
    setScreenshotName("");
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent className="max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Add Platform Rating</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <ResponsiveModalBody className="space-y-4">
          {/* Platform Selection */}
          {!selectedPlatform ? (
            <div className="space-y-2">
              <Label>Select Platform</Label>
              <div className="grid grid-cols-2 gap-2">
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-accent transition-colors text-left touch-target"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <Image
                        src={platform.logo}
                        alt={platform.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.parentElement!.innerHTML = `<span class="text-lg">${platform.emoji}</span>`;
                        }}
                      />
                    </div>
                    <span className="font-medium text-sm">{platform.name}</span>
                  </button>
                ))}
              </div>
              {availablePlatforms.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  All platforms added!
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Selected Platform Header */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: selectedPlatform.color }}
                >
                  <Image
                    src={selectedPlatform.logo}
                    alt={selectedPlatform.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.innerHTML = `<span class="text-2xl">${selectedPlatform.emoji}</span>`;
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold">{selectedPlatform.name}</p>
                  <button
                    onClick={() => setSelectedPlatform(null)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Change platform
                  </button>
                </div>
              </div>

              {/* Rating Input */}
              <div className="space-y-2">
                <Label htmlFor="rating">Your Rating (out of 5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  placeholder="e.g., 4.8"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>

              {/* Deliveries Input */}
              <div className="space-y-2">
                <Label htmlFor="deliveries">Total Deliveries/Trips</Label>
                <Input
                  id="deliveries"
                  type="number"
                  min="0"
                  placeholder="e.g., 1500"
                  value={deliveries}
                  onChange={(e) => setDeliveries(e.target.value)}
                />
              </div>

              {/* Joined Date */}
              <div className="space-y-2">
                <Label htmlFor="joined">When did you join? (optional)</Label>
                <Input
                  id="joined"
                  type="date"
                  value={joinedDate}
                  onChange={(e) => setJoinedDate(e.target.value)}
                />
              </div>

              {/* Screenshot Upload */}
              <div className="space-y-2">
                <Label>Screenshot Proof (optional)</Label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!screenshot ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-ring transition-colors text-center"
                    >
                      <span className="text-3xl block mb-2">📸</span>
                      <span className="text-sm text-muted-foreground">
                        Upload screenshot from {selectedPlatform.name} app
                      </span>
                      <span className="text-xs text-muted-foreground/70 block mt-1">
                        Max 2MB • JPG, PNG
                      </span>
                    </button>
                  ) : (
                    <div className="relative">
                      <img
                        src={screenshot}
                        alt="Screenshot proof"
                        className="w-full rounded-lg max-h-48 object-cover"
                      />
                      <button
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotName("");
                        }}
                        className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {screenshotName}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Adding a screenshot helps verify your rating
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!rating || !deliveries}
                className="w-full"
              >
                Add to Passport
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                {screenshot
                  ? "Screenshot will be stored with your passport"
                  : "Add a screenshot to increase trust in your rating"}
              </p>
            </>
          )}
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
