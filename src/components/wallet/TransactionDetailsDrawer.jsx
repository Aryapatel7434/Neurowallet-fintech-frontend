
import { useEffect } from "react";
import {
    FaXmark,
    FaArrowDown,
    FaArrowUp,
    FaFileArrowDown,
    FaCopy,
    FaShareNodes,
    FaPrint,
} from "react-icons/fa6";

import jsPDF from "jspdf";
import { toast } from "react-toastify";

import "../../styles/transactionDetailsDrawer.css";

// =========================================================
// STATUS NORMALIZATION
// =========================================================

function normalizeStatus(status) {
    const value = String(status || "PENDING").toUpperCase();

    if (value === "FAILD") return "FAILED";

    return value;
}

// =========================================================
// CURRENCY FORMATTING
// =========================================================

function formatCurrency(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "—";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

// =========================================================
// PDF-SAFE CURRENCY FORMATTING
// jsPDF default Helvetica may not support the ₹ glyph.
// =========================================================

function formatPdfCurrency(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "Not available";
    }

    return `INR ${value.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

// =========================================================
// DATE FORMATTING
// =========================================================

function formatDateTime(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// =========================================================
// MAIN COMPONENT
// =========================================================

function TransactionDetailsDrawer({
    transaction,
    open,
    onClose,
}) {

    // -----------------------------------------------------
    // CLOSE DRAWER USING ESCAPE KEY
    // -----------------------------------------------------

    useEffect(() => {
        if (!open) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    // Do not render when drawer is closed
    if (!open || !transaction) {
        return null;
    }

    // -----------------------------------------------------
    // TRANSACTION DATA
    // -----------------------------------------------------

    const transactionId = transaction.transactionId ?? "—";

    const safeTransactionId = String(transactionId).replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
    );

    const reference = `TXN-${transactionId}`;

    const status = normalizeStatus(transaction.status);

    const timestamp = formatDateTime(transaction.timestamp);

    const amount = formatCurrency(transaction.amount);

    const pdfAmount = formatPdfCurrency(transaction.amount);

    const transactionType = transaction.type || "—";

    const category = transaction.category || "—";

    const sender = transaction.senderEmail || "—";

    const receiver = transaction.receiverEmail || "—";

    const isIncoming =
        String(transaction.type || "").toUpperCase() === "CREDIT";

    // -----------------------------------------------------
    // RECEIPT DATA
    // -----------------------------------------------------

    const receiptRows = [
        ["Reference", reference],
        ["Amount", pdfAmount],
        ["Status", status],
        ["Type", transactionType],
        ["Category", category],
        ["Sender", sender],
        ["Receiver", receiver],
        ["Date", timestamp],
    ];

    // -----------------------------------------------------
    // GENERATE PDF RECEIPT
    // -----------------------------------------------------

    const createReceipt = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageHeight = doc.internal.pageSize.getHeight();

        const left = 20;
        const right = 190;

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(23);
        doc.setTextColor(28, 75, 140);

        doc.text("NeuroWallet", left, 25);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(105, 115, 130);

        doc.text("TRANSACTION RECEIPT", left, 34);

        doc.setDrawColor(210, 220, 232);
        doc.line(left, 40, right, 40);

        // Transaction reference
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(65, 75, 90);

        doc.text("Transaction Reference", left, 53);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 45, 65);

        doc.text(
            doc.splitTextToSize(reference, 110),
            left,
            60
        );

        let y = 76;

        // Receipt information
        receiptRows.forEach(([label, value]) => {
            const lines = doc.splitTextToSize(
                String(value),
                105
            );

            const rowHeight = Math.max(
                10,
                lines.length * 5 + 4
            );

            // Add another page if content exceeds page height
            if (y + rowHeight + 20 > pageHeight) {
                doc.addPage();
                y = 25;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(90, 105, 125);

            doc.text(label, left, y);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 45, 65);

            doc.text(lines, 78, y);

            y += rowHeight;
        });

        // Footer
        if (y + 25 > pageHeight) {
            doc.addPage();
            y = 25;
        }

        doc.setDrawColor(210, 220, 232);
        doc.line(left, y + 3, right, y + 3);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120, 130, 145);

        doc.text(
            "Generated by NeuroWallet",
            left,
            y + 12
        );

        doc.text(
            "Please retain this receipt for your records.",
            left,
            y + 18
        );

        return doc;
    };

    // -----------------------------------------------------
    // DOWNLOAD RECEIPT
    // -----------------------------------------------------

    const downloadReceipt = () => {
        try {
            const doc = createReceipt();

            doc.save(
                `NeuroWallet-Receipt-${safeTransactionId}.pdf`
            );

            toast.success("Transaction receipt downloaded.");
        } catch (error) {
            console.error("Receipt download failed:", error);

            toast.error(
                "Unable to download the transaction receipt."
            );
        }
    };

    // -----------------------------------------------------
    // PRINT RECEIPT
    // -----------------------------------------------------

    const printReceipt = () => {
        try {
            const doc = createReceipt();

            doc.autoPrint();

            const pdfUrl = doc.output("bloburl");

            const printWindow = window.open(
                pdfUrl,
                "_blank"
            );

            if (!printWindow) {
                doc.save(
                    `NeuroWallet-Receipt-${safeTransactionId}.pdf`
                );

                toast.info(
                    "Pop-up blocked. Receipt downloaded instead."
                );
            }
        } catch (error) {
            console.error("Receipt printing failed:", error);

            toast.error(
                "Unable to prepare the receipt for printing."
            );
        }
    };

    // -----------------------------------------------------
    // COPY TRANSACTION REFERENCE
    // -----------------------------------------------------

    const copyTransactionId = async () => {
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error(
                    "Clipboard access is unavailable."
                );
            }

            await navigator.clipboard.writeText(reference);

            toast.success(
                "Transaction reference copied."
            );
        } catch (error) {
            console.error(
                "Copy transaction reference failed:",
                error
            );

            toast.error(
                "Unable to copy the transaction reference."
            );
        }
    };

    // -----------------------------------------------------
    // SHARE TRANSACTION
    // -----------------------------------------------------

    const shareTransaction = async () => {
        const message = [
            "NeuroWallet Transaction",
            `Reference: ${reference}`,
            `Amount: ${amount}`,
            `Status: ${status}`,
            `Type: ${transactionType}`,
            `Category: ${category}`,
            `Date: ${timestamp}`,
        ].join("\n");

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "NeuroWallet Transaction",
                    text: message,
                });
            } else if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(message);

                toast.success(
                    "Transaction summary copied for sharing."
                );
            } else {
                toast.error(
                    "Sharing is not supported by this browser."
                );
            }
        } catch (error) {
            // User cancellation is not an application error
            if (error?.name !== "AbortError") {
                console.error(
                    "Transaction sharing failed:",
                    error
                );

                toast.error(
                    "Unable to share this transaction."
                );
            }
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div
            className="drawer-overlay"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >

            <section
                className="transaction-drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="transaction-drawer-title"
            >

                {/* Drawer Header */}
                <header className="drawer-header">

                    <div>
                        <p className="drawer-eyebrow">
                            TRANSACTION RECORD
                        </p>

                        <h2 id="transaction-drawer-title">
                            Transaction details
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                        aria-label="Close transaction details"
                    >
                        <FaXmark />
                    </button>

                </header>

                {/* Drawer Body */}
                <div className="drawer-body">

                    {/* Amount and Status */}
                    <div className="drawer-amount-block">

                        <span
                            className={`drawer-direction-icon ${
                                isIncoming
                                    ? "incoming"
                                    : "outgoing"
                            }`}
                        >
                            {isIncoming
                                ? <FaArrowDown />
                                : <FaArrowUp />}
                        </span>

                        <h1 className="amount">
                            {amount}
                        </h1>

                        <span
                            className={`status ${status.toLowerCase()}`}
                        >
                            {status}
                        </span>

                        <span className="drawer-reference">
                            {reference}
                        </span>

                    </div>

                    {/* Transaction Information */}
                    <div className="drawer-section-title">
                        Transaction information
                    </div>

                    <div className="detail-row">
                        <span>Type</span>
                        <strong>{transactionType}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Category</span>
                        <strong>{category}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Sender</span>
                        <strong>{sender}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Receiver</span>
                        <strong>{receiver}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Transaction ID</span>
                        <strong>{transactionId}</strong>
                    </div>

                    <div className="detail-row">
                        <span>Date & time</span>
                        <strong>{timestamp}</strong>
                    </div>

                    {/* Receipt Actions */}
                    <div className="drawer-actions">

                        <button
                            type="button"
                            className="drawer-btn primary"
                            onClick={downloadReceipt}
                        >
                            <FaFileArrowDown />
                            Download receipt
                        </button>

                        <button
                            type="button"
                            className="drawer-btn secondary"
                            onClick={copyTransactionId}
                        >
                            <FaCopy />
                            Copy reference
                        </button>

                        <button
                            type="button"
                            className="drawer-btn secondary"
                            onClick={shareTransaction}
                        >
                            <FaShareNodes />
                            Share transaction
                        </button>

                        <button
                            type="button"
                            className="drawer-btn secondary"
                            onClick={printReceipt}
                        >
                            <FaPrint />
                            Print receipt
                        </button>

                    </div>

                    {/* Security Note */}
                    <p className="drawer-security-note">
                        Transaction details are displayed from your
                        authenticated account history.
                    </p>

                </div>

            </section>

        </div>
    );
}

export default TransactionDetailsDrawer;
