export default function SignupPage(): React.ReactElement {
    return (<div>
        <h1 className="text-4xl font-bold">Sign Up</h1>
        <p className="text-sm text-gray-500 pb-3">Say hello to the functionalities!</p>
        <h3 className="text-md mb-2">Username:</h3>
        <input type="text" className="border p-2 rounded w-full mb-4" />
        <h3 className="text-md mb-2">Email:</h3>
        <input type="email" className="border p-2 rounded w-full mb-4" />
        <h3 className="text-md mb-2">Password:</h3>
        <input type="password" className="border p-2 rounded w-full mb-4" />
        <button className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded">Sign Up</button>
    </div>
    );
}