import React, { useState } from 'react';
import { Contact } from '@/types/types';

interface ContactFormProps {
  editingContact: Contact | null;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (address: string, suinsName: string, name: string) => Promise<void>;
  onCancel: () => void;
  onSuiNSBlur: (suinsName: string) => Promise<string | null>;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  editingContact,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
  onSuiNSBlur
}) => {
  const [name, setName] = useState(editingContact?.name || "");
  const [suinsName, setSuinsName] = useState(editingContact?.suins || "");
  const [address, setAddress] = useState(editingContact?.address || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    await onSubmit(address, suinsName, name);
  };

  const handleSuiNSBlur = async () => {
    const address = await onSuiNSBlur(suinsName);
    if (address) setAddress(address);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <label className="block mb-2 text-sm font-medium text-gray-300">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
        />
      </div>
      <div className="mb-5">
        <label className="block mb-2 text-sm font-medium text-gray-300">SuiNS Name (optional)</label>
        <input
          type="text"
          value={suinsName}
          onChange={(e) => setSuinsName(e.target.value)}
          onBlur={handleSuiNSBlur}
          className={`w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white ${editingContact ? "bg-gray-800" : ""}`}
          disabled={!!editingContact}
        />
      </div>
      <div className="mb-5">
        <label className="block mb-2 text-sm font-medium text-gray-300">Sui Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white ${editingContact ? "bg-gray-800" : ""}`}
          required
          disabled={!!editingContact}
        />
      </div>
      {error && (
        <div className="mb-4 text-sm text-red-400 break-words">
          {error}
        </div>
      )}
      <button
        type="submit"
        className={`w-full text-white font-medium rounded-lg px-5 py-2.5 ${isSubmitting ? "bg-gray-600" : "bg-blue-700 hover:bg-blue-800"}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : editingContact ? "Update Contact" : "Save Contact"}
      </button>
      <div className="mt-4 text-center">
          <p className="text-sm text-white">
              Don't have a SuiNS name?{" "}
              <a
                  href="https://suins.io/"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 font-medium"
              >
                  Register for one
              </a>
          </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-4 w-full text-center text-red-500 hover:underline"
      >
        Cancel
      </button>
    </form>
  );
}; 