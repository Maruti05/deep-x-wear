export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    phone_number?: string; // Optional field for user's phone number
    user_address?: string; // Optional field for user's address
    city?: string; // Optional field for user's city
    country?: string; // Optional field for user's country
    state_name?: string; // Optional field for user's state
    pin_code?: string; // Optional field for user's pin code
    user_id?: string; // Optional field for user's ID
}