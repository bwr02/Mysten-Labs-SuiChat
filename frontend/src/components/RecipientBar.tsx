import React from "react";

interface RecipientBarProps {
  recipientAddress: string | null;
}

export const RecipientBar: React.FC<RecipientBarProps> = ({
  recipientAddress,
}) => {
  return (
    <div className="w-full bg-light-blue text-gray-200 py-4 px-6 flex items-center justify-between shadow-md sticky top-0">
      <h1 className="text-2xl font-bold">
        {recipientAddress
          ? `${recipientAddress.slice(0, 7)}...${recipientAddress.slice(-4)}`
          : "No Contact Selected"}
      </h1>
    </div>
  );
};
