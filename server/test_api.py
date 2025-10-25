"""
Test script for FastAPI endpoints with authentication
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"


def test_health_check():
    """Test health check endpoint"""
    print("\n=== Testing Health Check ===")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200


def test_register_patient():
    """Test patient registration"""
    print("\n=== Testing Patient Registration ===")
    data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "password123",
        "role": "patient"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200


def test_register_doctor():
    """Test doctor registration"""
    print("\n=== Testing Doctor Registration ===")
    data = {
        "name": "Dr. Jane Smith",
        "email": "dr.jane@example.com",
        "password": "doctor123",
        "role": "doctor"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200


def test_login():
    """Test login and get JWT token"""
    print("\n=== Testing Login ===")
    data = {
        "email": "john.doe@example.com",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Token received: {result['access_token'][:50]}...")
        print(f"User: {result['user']}")
        return result['access_token']
    else:
        print(f"Error: {response.text}")
        return None


def test_get_current_user(token):
    """Test getting current user info"""
    print("\n=== Testing Get Current User ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.json()


def test_update_medical_history(token, user_id):
    """Test updating medical history"""
    print("\n=== Testing Update Medical History ===")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "patient_id": "P-12345",
        "age": 45,
        "gender": "male",
        "height_cm": 178,
        "weight_kg": 84,
        "blood_type": "O+",
        "chronic_conditions": [
            {"condition": "Hypertension", "diagnosed_year": 2018, "status": "managed"}
        ],
        "allergies": ["Penicillin"],
        "current_medications": [
            {"name": "Lisinopril", "dosage": "10mg", "frequency": "once daily"}
        ]
    }
    response = requests.put(
        f"{BASE_URL}/users/{user_id}/medical-history",
        headers=headers,
        json=data
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200


def test_create_conversation(token):
    """Test creating a conversation"""
    print("\n=== Testing Create Conversation ===")
    headers = {"Authorization": f"Bearer {token}"}
    data = {"title": "Headache and Dizziness"}
    response = requests.post(
        f"{BASE_URL}/conversations",
        headers=headers,
        json=data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Conversation created: {result['id']}")
        return result['id']
    else:
        print(f"Error: {response.text}")
        return None


def test_create_prediagnosis(token, conversation_id=None):
    """Test creating a prediagnosis"""
    print("\n=== Testing Create Prediagnosis ===")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "symptoms": ["headache", "dizziness", "fatigue"],
        "duration": "3 days",
        "age": 45
    }
    if conversation_id:
        data["conversation_id"] = conversation_id

    response = requests.post(
        f"{BASE_URL}/prediagnosis",
        headers=headers,
        json=data
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"\nPrediagnosis Result:")
        print(f"  Potential Diseases: {result['potential_diseases']}")
        print(f"  Course of Action: {result['course_of_action'][:100]}...")
        print(f"  Support Messages: {result['support_messages'][:100]}...")
        return result
    else:
        print(f"Error: {response.text}")
        return None


def test_get_conversations(token):
    """Test getting all conversations"""
    print("\n=== Testing Get Conversations ===")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/conversations", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200


def test_unauthorized_access():
    """Test that endpoints are protected"""
    print("\n=== Testing Unauthorized Access ===")
    response = requests.get(f"{BASE_URL}/auth/me")
    print(f"Status: {response.status_code}")
    print(f"Should be 403 (Forbidden): {response.status_code == 403}")
    return response.status_code == 403


def run_all_tests():
    """Run all API tests"""
    print("=" * 60)
    print("FastAPI Endpoint Tests with Authentication")
    print("=" * 60)

    try:
        # Test 1: Health check
        test_health_check()

        # Test 2: Register users
        test_register_patient()
        test_register_doctor()

        # Test 3: Login
        token = test_login()
        if not token:
            print("\nLogin failed, stopping tests")
            return

        # Test 4: Get current user
        user = test_get_current_user(token)
        user_id = user.get('id')

        # Test 5: Update medical history
        test_update_medical_history(token, user_id)

        # Test 6: Create conversation
        conversation_id = test_create_conversation(token)

        # Test 7: Create prediagnosis
        test_create_prediagnosis(token, conversation_id)

        # Test 8: Get conversations
        test_get_conversations(token)

        # Test 9: Unauthorized access
        test_unauthorized_access()

        print("\n" + "=" * 60)
        print("All tests completed!")
        print("=" * 60)

    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to server")
        print("Make sure the server is running: uvicorn source.app:app --reload")
    except Exception as e:
        print(f"\nError during tests: {e}")


if __name__ == "__main__":
    run_all_tests()
