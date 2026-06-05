"use client";

import { getUserDetails } from "@/lib/api/user/user.api";
import { UserData, UserDetails } from "@/lib/types/user.type";
import { useEffect, useState } from "react";

export const ViewDetailModal = ({ user }: { user: UserData }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getUserDetails(user.id);
        setUserDetails(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [user.id]);

  return (
    <div>
      {userDetails ? (
        <div>
          <p>Email: {userDetails.email}</p>
          <p>Username: {userDetails.username}</p>
          <p>Role: {userDetails.role}</p>
          <p>Status: {userDetails.isActive ? "Active" : "Inactive"}</p>
          <p>Created At: {new Date(userDetails.createdAt).toLocaleString()}</p>
          <p>Updated At: {new Date(userDetails.updatedAt).toLocaleString()}</p>
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
};
