import { supabase } from "@/components/admin/ProductForm";


type UserDetails = {
  full_name: string;
  email: string;
  phone_number: string;
  user_id: string;
  user_address?: string;
  city?: string;
  state_name?: string;
  pin_code?: number;
  country?: string;
  role: "USER" | "ADMIN"; 
  // map_location?: { latitude: number; longitude: number } | null;
};


 async function createUser({
  userDetails,
}: {
  userDetails: UserDetails
}) {
  const { data, error } = await supabase
    .from("users")
    .insert([userDetails]);

  if (error) {
    throw new Error(error.message || "Failed to create user");
  }

  if (!data ) {
    throw new Error("No user data returned");
  }

  return data[0];
}

export function useCreateUser() {
//   return useMutation(createUser);
return {
    mutate: createUser,
    isLoading: false, // Replace with actual loading state          
    isError: false, // Replace with actual error state
    error: null, // Replace with actual error object
    isSuccess: false, // Replace with actual success state
    data: null, // Replace with actual data returned from mutation
    reset: () => {}, // Function to reset the mutation state
    status: "idle", // Replace with actual status of the mutation   
}
}