"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

export default function QRScanner({
  onScan,
}: {
  onScan: (decodedText: string) => void;
}) {
  const scannerId = "qr-scanner-region";
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode(scannerId);

    html5QrCodeRef.current
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText: string) => {
          onScan(decodedText);
        },
        () => {}
      )
      .catch((err: any) => console.error("QR error", err));

    return () => {
      html5QrCodeRef.current
        ?.stop()
        .then(() => html5QrCodeRef.current.clear())
        .catch(() => {});
    };
  }, []);

  return <div id={scannerId} style={{ width: "100%" }} />;
}
