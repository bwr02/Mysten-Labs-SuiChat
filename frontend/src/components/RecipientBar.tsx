import React, {useEffect, useRef, useState} from "react";
import {editContact} from "@/api/services/dbService.ts";
import {FaInfoCircle} from "react-icons/fa";
import {RecipientBarProps} from "@/types/types.ts";

export const RecipientBar: React.FC<RecipientBarProps> = ({
                                                              recipientName,
                                                              suins,
                                                              address,
                                                          }) => {
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(recipientName);

    const popupRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    const togglePopup = () => {
        // If closing the popup, also abort editing and reset input
        if (popupIsOpen) {
            setIsEditing(false);
            setEditedName(null); // Reset the name if editing was in progress
        }
        setPopupIsOpen(!popupIsOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                iconRef.current &&
                !iconRef.current.contains(event.target as Node)
            ) {
                setPopupIsOpen(false);
                setIsEditing(false); // Abort editing if clicked outside
                setEditedName(null); // Reset to original name when closing
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [recipientName]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        await editContact(address, suins, editedName);
        setIsEditing(false);
    };

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            await editContact(address, suins, editedName);
            setIsEditing(false);
        }
    };

    return (
        <div
            className="w-full bg-light-blue text-gray-200 py-4 px-6 flex items-center justify-between shadow-md sticky top-0">
            <h1 className="text-2xl font-bold flex items-center relative">
                {recipientName && recipientName !== "null"
                    ? recipientName
                    : "No Contact Selected"}
                {recipientName && recipientName !== "null" && (
                    <div ref={iconRef} className="relative inline-block">
                        <FaInfoCircle
                            className="ml-4 cursor-pointer text-lg"
                            onClick={togglePopup}
                        />
                        {popupIsOpen && (
                            <div
                                ref={popupRef}
                                className="absolute left-0 mt-5 bg-gray-600/90 text-white rounded-2xl shadow-lg w-64 p-4 z-10"
                            >
                                <div
                                    className="absolute -top-4 left-4 w-2 h-0 border-l-[10px] border-r-[10px] border-b-[16px] border-transparent border-b-gray-600/90"></div>

                                {isEditing ? (
                                    <>
                                        <input
                                            className="bg-gray-700 text-white rounded-lg p-1 mb-2 w-[80%] text-xs"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Enter New Contact Name"
                                        />
                                        <button
                                            className="absolute top-2 right-2 text-xs text-gray-300 hover:text-white"
                                            onClick={handleSaveClick}
                                        >
                                            Save
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-bold mb-2">{recipientName}</h2>
                                        <button
                                            className="absolute top-2 right-2 text-xs text-gray-300 hover:text-white"
                                            onClick={handleEditClick}
                                        >
                                            Edit
                                        </button>
                                    </>
                                )}

                                {suins && <p className="text-sm">SUINS: {suins}</p>}
                                {address && <p className="text-sm">Address: {address}</p>}
                            </div>
                        )}
                    </div>
                )}
            </h1>
        </div>
    );
};