"use client";

import { useMemo, useRef } from "react";
import { downloadFile } from "@/lib/client/download";
import { monthLabel } from "@/lib/format";
import {
  buildReceiptHtml,
  receiptFileName,
  receiptLabels,
  receiptNumber,
} from "@/lib/receipt";
import type { MeterRecord } from "@/lib/types";
import { useI18n } from "./i18n-provider";
import { DownloadIcon, ReceiptIcon } from "./icons";
import { Modal } from "./modal";

interface ReceiptDialogProps {
  record: MeterRecord | null;
  onClose: () => void;
}

export function ReceiptDialog({ record, onClose }: ReceiptDialogProps) {
  const { locale, t } = useI18n();
  const frameRef = useRef<HTMLIFrameElement>(null);

  const html = useMemo(
    () => (record ? buildReceiptHtml(record, locale, receiptLabels(t, record)) : ""),
    [record, locale, t],
  );

  const handleDownload = () => {
    if (!record) return;
    downloadFile(receiptFileName(record), html, "text/html;charset=utf-8");
  };

  const handlePrint = () => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };

  return (
    <Modal
      open={record !== null}
      title={t("receipt.title")}
      size="wide"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t("common.close")}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDownload}>
            <DownloadIcon width={17} height={17} />
            {t("receipt.download")}
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            {t("receipt.print")}
          </button>
        </>
      }
    >
      {record ? (
        <div className="receipt-preview">
          <p className="receipt-preview-meta">
            <ReceiptIcon width={15} height={15} />
            <span>{monthLabel(record.period, locale)}</span>
            <span className="receipt-preview-number">{receiptNumber(record)}</span>
          </p>
          <iframe
            ref={frameRef}
            className="receipt-frame"
            title={t("receipt.title")}
            srcDoc={html}
            onLoad={(event) => {
              const frame = event.currentTarget;
              const doc = frame.contentDocument;
              if (!doc) return;
              const style = doc.defaultView?.getComputedStyle(doc.body);
              const padding = style
                ? Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
                : 0;
              const content =
                doc.querySelector(".receipt")?.getBoundingClientRect().height ??
                doc.body.scrollHeight;
              frame.style.height = `${Math.min(
                Math.ceil(content + padding + 2),
                Math.round(window.innerHeight * 0.62),
              )}px`;
            }}
          />
        </div>
      ) : null}
    </Modal>
  );
}
