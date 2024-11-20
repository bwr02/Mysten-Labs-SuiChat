"use client";

import { Sidebar } from "flowbite-react";
import { HiAnnotation } from "react-icons/hi";
import { FaAddressBook } from "react-icons/fa";

export function SidePanel() {
  return (
    <div className="h-screen relative" style={{ width: "48px" }}>
      <Sidebar
        aria-label="Custom sidebar"
        className="h-full flex flex-col justify-between items-center absolute inset-0"
        style={{
          width: "48px",
          minWidth: "48px",
          maxWidth: "48px",
          borderRight: "1px solid rgb(255, 255, 255)" }}
      >
        <Sidebar.Logo href="#" img="Sui_Symbol_Sea.svg" className="w-8 h-8" />
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item
              href="#"
              icon={HiAnnotation}
              className="flex justify-start items-center p-2 mt-8"
            >
              <span className="hidden">Messages</span>
            </Sidebar.Item>
            <Sidebar.Item
              href="#"
              icon={FaAddressBook}
              className="flex justify-start items-center p-2 mt-4"
            >
              <span className="hidden">Contacts</span>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
}
