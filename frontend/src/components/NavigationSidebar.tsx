"use client";

import { Sidebar } from "flowbite-react";
import { HiAnnotation } from "react-icons/hi";
import { FaAddressBook } from "react-icons/fa";
import { Link } from "react-router-dom";

export function NavigationSidebar() {
  return (
    <div className="  h-screen bg-dark-blue w-12">
      <Sidebar
        aria-label="Custom sidebar"
        className=" h-full flex ">
        <Sidebar.Logo
            href="#"
            img="Sui_Symbol_Sea.svg"
            className=" my-4 mx-auto" />
        <Sidebar.Items>
          <Sidebar.ItemGroup className="!border-0">
            <Sidebar.Item
              as={Link}
              to="/messages"
              icon={HiAnnotation}
              className=" flex items-center justify-start pl-[--4px] text-2xl mt-6"
            >
              <span className="sr-only">Messages</span>
            </Sidebar.Item>
            <Sidebar.Item
              as={Link}
              to="/contacts"
              icon={FaAddressBook}
              className="flex justify-start items-center mt-2 pl-0 text-xl"
            >
              <span className="sr-only">Contacts</span>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
}
