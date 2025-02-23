import React, {useEffect, useRef, useState} from "react";
import {editContact, getNameByAddress, getSuiNSByAddress} from "@/api/services/contactDbService.ts";
import {FaInfoCircle} from "react-icons/fa";
import { RecipientBarProps } from "../types/types";


export const RecipientBar: React.FC<RecipientBarProps> = ({
    recipientAddress,
}) => {
    const [popupIsOpen, setPopupIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [recipientName, setRecipientName] = useState<string | null>(null);
    const [suins, setSuiNS] = useState<string | null>(null);
    const [editedName, setEditedName] = useState<string>(recipientName || '');
    const popupRef = useRef<HTMLDivElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    const togglePopup = () => {
        if (popupIsOpen) {
            setIsEditing(false);
            setEditedName('');  // Reset with empty string
        }
        setPopupIsOpen(!popupIsOpen);
    };

    useEffect(() => {
        const fetchRecipientName = async () => {
            try {
                const name = await getNameByAddress(recipientAddress);

                if (name) {
                    setRecipientName(name);
                    const suiNS = await getSuiNSByAddress(recipientAddress);

                    if (suiNS) {
                        setSuiNS(suiNS);
                    }
                    else{
                        setSuiNS(null);
                    }
                    return;
                }

                const suiNS = await getSuiNSByAddress(recipientAddress);

                if (suiNS) {
                    setRecipientName(suiNS);
                    setSuiNS(suiNS);
                    return;
                }

                // If no name or SuiNS, use the shortened address
                setRecipientName(`${recipientAddress.slice(0, 7)}...${recipientAddress.slice(-4)}`);
                setSuiNS(null);
            } catch (error) {
                console.error("Error fetching recipient name:", error);
                setRecipientName(`${recipientAddress.slice(0, 7)}...${recipientAddress.slice(-4)}`);
            }
        };

        fetchRecipientName();
    }, [recipientAddress]);

    useEffect(() => {
        const wsEditContact = new WebSocket('ws://localhost:8081');

        wsEditContact.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'edit-contact') {
                setRecipientName(data.contact.contactName);
            }
        };

        return () => {
            wsEditContact.close();
        };
    }, [setRecipientName]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                iconRef.current &&
                !iconRef.current.contains(event.target as Node)
            ) {
                setPopupIsOpen(false);
                setIsEditing(false);
                setEditedName('');  // Reset with empty string
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
        await editContact(recipientAddress, suins || undefined, editedName || undefined);
        setIsEditing(false);
    };

    const handleKeyPress = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            await editContact(recipientAddress, suins || undefined, editedName || undefined);
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
                                {recipientAddress && <p className="text-sm">Address: {recipientAddress}</p>}
                            </div>
                        )}
                    </div>
                )}
            </h1>
        </div>
    );
};