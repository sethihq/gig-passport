"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
  ResponsiveModalBody,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface QRCodeModalProps {
  url: string;
  name: string;
  children: React.ReactNode;
}

export function QRCodeModal({ url, name, children }: QRCodeModalProps) {
  const [open, setOpen] = useState(false);

  const handleDownload = () => {
    const svg = document.getElementById("passport-qr");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${name}-gig-passport-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalTrigger asChild>{children}</ResponsiveModalTrigger>
      <ResponsiveModalContent className="max-w-sm">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-center">
            Your QR Code
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <ResponsiveModalBody className="flex flex-col items-center space-y-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG
              id="passport-qr"
              value={url}
              size={200}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Scan this code to view your Gig Passport
            </p>
            <p className="text-xs text-muted-foreground/70 font-mono break-all px-4">
              {url}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} className="flex-1">
              Download QR
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success("Link copied!", "Share it with employers");
              }}
              variant="outline"
              className="flex-1"
            >
              Copy Link
            </Button>
          </div>

          {/* Use Case Hint */}
          <p className="text-xs text-muted-foreground text-center">
            Print this QR and show it to potential employers or new platforms
          </p>
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
