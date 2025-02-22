"use client";

import { Sidebar } from "flowbite-react";
import { HiAnnotation } from "react-icons/hi";
import { FaAddressBook } from "react-icons/fa";
import { Link } from "react-router-dom";

export function NavigationSidebar() {
  return (
    <div className="  h-screen bg-dark-blue w-12">
      <div>
      <Link to="messages">
        <img
            alt="Logo"
            src="Sui_Symbol_Sea.svg"
            className=" mx-0 pl-6 mt-6 flex justify-start -ml-3"
        />
      </Link>
      </div>
      <div>
      <Sidebar
        aria-label="Custom sidebar"
        className="  flex-1 ">

        <Sidebar.Items>
          <Sidebar.ItemGroup className="!border-0 ">
            <Sidebar.Item
              as={Link}
              to="/messages"
              icon={HiAnnotation}
              className=" flex items-center justify-start  text-2xl mt-2 -ml-2 hover:w-10"
            >
              <span className="sr-only">Messages</span>
            </Sidebar.Item>
            <Sidebar.Item
              as={Link}
              to="/contacts"
              icon={FaAddressBook}
              className="flex justify-start items-center mt-2 -ml-2 pl-2 text-xl hover:w-10"
            >
              <span className="sr-only">Contacts</span>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
      </div>
    </div>
  );
}
