"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Reply, MessageSquare, User, Mail, Tag, Clock, Send, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/auth";
import { PermissionGuard } from "@/components/auth/permission-guard";
import type { Contact } from "@/types";

function ReplyModal({
  open,
  onClose,
  onReply,
  contact,
}: {
  open: boolean;
  onClose: () => void;
  onReply: () => void;
  contact: Contact | null;
}) {
  const { toast } = useToast();
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!replyMessage.trim()) {
      setError("Reply message is required");
      return;
    }
    if (!contact) return;

    setSubmitting(true);
    setError("");
    try {
      await apiClient.post(`/contacts/${contact.id}/send-reply-email`, {
        reply_message: replyMessage,
      });
      toast("Reply sent successfully", "success");
      onReply();
      onClose();
      setReplyMessage("");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: { messages: string[] }[]; message?: string } } };
      if (axiosErr.response?.data?.errors) {
        setError(axiosErr.response.data.errors[0]?.messages[0] || "Failed to send reply");
      } else {
        setError(axiosErr.response?.data?.message || "Failed to send reply");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white">Reply to Contact</h2>
          <button onClick={onClose} className="rounded p-1 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 space-y-2 rounded-lg bg-background p-3 dark:bg-gray-900">
          <p className="text-sm text-text-primary dark:text-white">
            <span className="font-medium">To:</span> {contact.first_name} {contact.last_name} ({contact.email})
          </p>
          <p className="text-sm text-text-primary dark:text-white">
            <span className="font-medium">Subject:</span> {contact.subject}
          </p>
        </div>

        <div className="mb-4">
          <p className="mb-1 text-xs font-medium text-text-muted dark:text-gray-400">Original Message:</p>
          <div className="max-h-32 overflow-y-auto rounded-lg border border-border bg-background p-3 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-text-muted dark:text-gray-400">{contact.message}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-text-primary dark:text-gray-300">Reply Message *</label>
          <textarea
            value={replyMessage}
            onChange={(e) => { setReplyMessage(e.target.value); setError(""); }}
            rows={4}
            placeholder="Type your reply here..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !replyMessage.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Send className="h-4 w-4" />
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewContactContent({ contactId }: { contactId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyModalOpen, setReplyModalOpen] = useState(false);

  const fetchContact = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/contacts/${contactId}`);
      setContact(response.data.data);
    } catch {
      toast("Failed to load contact", "error");
      router.push("/contacts");
    } finally {
      setLoading(false);
    }
  }, [contactId, toast, router]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!contact) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Contact Details</h1>
          <p className="text-sm text-text-muted dark:text-gray-400">View contact message</p>
        </div>
        <nav className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
          <a href="/contacts" className="hover:text-primary">Contacts</a>
          <span>/</span>
          <span className="text-text-primary dark:text-white">View</span>
        </nav>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">
                {contact.first_name} {contact.last_name}
              </h1>
              <p className="text-sm text-text-muted dark:text-gray-400">{contact.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                contact.is_replied
                  ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
            >
              {contact.is_replied ? "Replied" : "Pending"}
            </span>
            {hasPermission("Contact Index") && !contact.is_replied && (
              <button
                onClick={() => setReplyModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                <Reply className="h-4 w-4" />
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-text-primary dark:text-white">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Name</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">
                  {contact.first_name} {contact.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <Mail className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{contact.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <Tag className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Contact Type</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">
                  {contact.contact_type?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-text-muted dark:text-gray-400">Received At</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">
                  {new Date(contact.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message & Reply */}
        <div className="rounded-xl border border-border bg-surface p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-text-primary dark:text-white">Message & Reply</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Subject</p>
              <p className="text-sm font-medium text-text-primary dark:text-white">{contact.subject}</p>
            </div>
            <div className="border-t border-border pt-4 dark:border-gray-700">
              <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Message</p>
              <div className="rounded-lg bg-background p-3 dark:bg-gray-900">
                <p className="text-sm text-text-primary dark:text-white whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>
            {contact.is_replied && contact.reply && (
              <div className="border-t border-border pt-4 dark:border-gray-700">
                <p className="mb-1 text-xs text-text-muted dark:text-gray-400">Reply</p>
                <div className="rounded-lg bg-primary/5 p-3 dark:bg-primary/10">
                  <p className="text-sm text-text-primary dark:text-white whitespace-pre-wrap">{contact.reply}</p>
                  {contact.replied_at && (
                    <p className="mt-2 text-xs text-text-muted dark:text-gray-400">
                      Replied on {new Date(contact.replied_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <ReplyModal
        open={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        onReply={fetchContact}
        contact={contact}
      />
    </div>
  );
}

export default function ViewContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard permission="Contact Index">
      <ViewContactContent contactId={id} />
    </PermissionGuard>
  );
}
