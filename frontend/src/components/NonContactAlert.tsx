import React, { useState } from 'react';
import { Alert } from 'flowbite-react';
import { HiInformationCircle, HiUserAdd, HiX } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

interface NonContactAlertProps {
  senderAddress: string;
}

export const NonContactAlert: React.FC<NonContactAlertProps> = ({ senderAddress }) => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  const handleAddContact = () => {
    navigate('/contacts', { state: { addAddress: senderAddress } });
    setDismissed(true);
  };

  if (dismissed) return null; // Hide the alert when dismissed

  return (
    <div className="fixed top-4 right-4 z-[9999] w-full max-w-[400px]">
      <Alert
        color="warning"
        style={{ backgroundColor: '#f5ebbf' }} // ✅ Restored your lighter background color
        className="rounded-lg shadow-lg"
      >
        {/* Title + Close Button in the Same Row */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HiInformationCircle className="h-5 w-5 text-yellow-900" />
            <span className="font-medium text-yellow-900">New Message from Non-Contact</span>
          </div>
          <button onClick={() => setDismissed(true)} className="text-yellow-900 hover:text-yellow-700">
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* Message Content */}
        <div className="mb-4 mt-2 text-sm text-yellow-700 break-words whitespace-normal">
          You have received a message from:
          <span className="block font-mono break-all">{senderAddress}</span>
          To decrypt it, please add this sender as a contact to ensure your security and privacy.
        </div>

        {/* Add Contact Button */}
        <div className="flex">
          <button
            type="button"
            onClick={handleAddContact}
            className="mr-2 inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
          >
            <HiUserAdd className="-ml-0.5 mr-2 h-4 w-4" />
            Add as Contact
          </button>
        </div>
      </Alert>
    </div>
  );
};
