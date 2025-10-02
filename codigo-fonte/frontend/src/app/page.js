'use client'
import { useState, useEffect } from "react";
import { logoutUser, getUserInfo, refreshToken} from "@/utils/auth";
import TopBar from "@/app/ui/topBar";

export default function Home() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const userDetails = await getUserInfo();
      if (userDetails) {
        setUser(userDetails);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      alert("Logout successful");
    } catch (error) {
      console.error(error);
      alert("Logout failed");
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshToken();
      alert("Token refreshed successfully");
    } catch (error) {
      console.error(error);
      alert("Token refresh failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          {user ? (
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              Welcome, {user.username}!
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
              Welcome to GranaLivre
            </h1>
          )}
          
          {user && (
            <div className="space-x-4">
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200"
              >
                Logout
              </button>
              <button 
                onClick={handleRefresh}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200"
              >
                Refresh Token
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}