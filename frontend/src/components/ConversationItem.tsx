import React from "react";
import { SidebarConversationParams } from "../types/types";

export const ConversationItem = React.memo(({
  conv, 
  isSelected, 
  onSelect 
}: { 
  conv: SidebarConversationParams;
  isSelected: boolean;
  onSelect: () => void;
}) => (
    <div
        onClick={onSelect}
        className={`flex items-start gap-2 cursor-pointer p-2 rounded-2xl
      ${isSelected ? "bg-blue-800" : "hover:bg-gray-600"}`}>
      <img src="user.png" alt="avatar" className="w-10 h-10 rounded-full object-cover"/>
      <div className="flex flex-col flex-grow overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-gray-300 text-sm truncate max-w-[70%]">{conv.name}</div>
          <div className="text-gray-400 text-xs whitespace-nowrap">{conv.time}</div>
        </div>
      <div className="text-gray-400 text-sm line-clamp-2 max-h-10 overflow-hidden">
        {conv.message}
        </div>
      </div>
    </div>
));

ConversationItem.displayName = 'ConversationItem';