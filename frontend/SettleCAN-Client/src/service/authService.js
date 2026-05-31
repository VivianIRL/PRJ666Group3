const API_BASE_URL = "http://localhost:5000/api";

export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }
    console.log("data from auth service call: ", data);
    return data;
}
export async function logoutUser(token) {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    const text = await response.text();
    console.log("LOGOUT RAW RESPONSE:", text);

    const data = JSON.parse(text);

    if (!response.ok) {
        throw new Error(data.message || "Logout failed");
    }

    return data;
}

export async function registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }
console.log("REGISTER RESULT:", data);
    return data;
}
