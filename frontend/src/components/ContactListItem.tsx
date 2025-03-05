import React from 'react';
import { Contact } from '@/types/types';
import { MessageCircle, Pencil, TrashIcon } from 'lucide-react';

interface ContactListItemProps {
  contact: Contact;
  isHovered: boolean;
  onHover: (address: string | null) => void;
  onMessage: (address: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (address: string) => void;
}

export const ContactListItem: React.FC<ContactListItemProps> = ({
  contact,
  isHovered,
  onHover,
  onMessage,
  onEdit,
  onDelete
}) => {
  return (
    <li
      className="flex justify-between items-center p-3 py-8 border-b last:border-b-0 border-gray-600 relative"
      onMouseEnter={() => onHover(contact.address)}
      onMouseLeave={() => onHover(null)}
    >
      <div>
        <p className="font-semibold">{contact.name || contact.suins || contact.address}</p>
        {isHovered && (
          <>
            {contact.name && (
              <>
                <p className="text-gray-400">{contact.suins || "(No SuiNS)"}</p>
                <p className="text-gray-400">{contact.address}</p>
              </>
            )}
            {!contact.name && contact.suins && (
              <p className="text-gray-400">{contact.address}</p>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onMessage(contact.address)}
          className="p-2 rounded-full hover:bg-gray-700 transition"
          title="Send Message"
        >
          <MessageCircle size={20} className="text-gray-400"/>
        </button>

        <button
          onClick={() => onEdit(contact)}
          className="p-2 rounded-full hover:bg-gray-700 transition"
          title="Edit"
        >
          <Pencil size={20} className="text-gray-400"/>
        </button>

        <button
          onClick={() => onDelete(contact.address)}
          className="p-2 rounded-full hover:bg-gray-700 transition"
          title="Delete"
        >
          <TrashIcon size={20} className="text-red-600"/>
        </button>
      </div>
    </li>
  );
};