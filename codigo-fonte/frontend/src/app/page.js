'use client'
import { useState, useEffect } from "react";
import { logoutUser, getUserInfo, refreshToken} from "@/utils/auth";


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
    <div>
      {user ? <h1>Welcome, {user.username}!</h1> : <h1>Welcome to the Home Page</h1>}
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleRefresh}>Refresh Token</button>
    </div>
  );
}