export default function ContactsPage() {
    return (
        <div className="h-screen bg-purple-200 flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold text-black p-4">Create a New Contact</h1>
            <div className="w-full max-w-md p-4">
                <input
                    type="text"
                    placeholder="Search Contacts..."
                    className="w-full p-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>
        </div>
    );
}
