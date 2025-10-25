from source.ml_models.suggestions import generate_prediagnosis
import json

# Sample patient data for testing
test_data = {
    "symptoms": ["headache", "dizziness", "fatigue"],
    "duration": "3 days",
    "severity": "moderate",
    "age": 45,
}

sample_history = {
    "patient_id": "P-20451",
    "name": "John Doe",
    "age": 45,
    "gender": "male",
    "height_cm": 178,
    "weight_kg": 84,
    "blood_type": "O+",
    "chronic_conditions": [
        {"condition": "Hypertension", "diagnosed_year": 2018, "status": "managed"},
        {"condition": "Type 2 Diabetes", "diagnosed_year": 2021, "status": "controlled"},
    ],
    "allergies": ["Penicillin"],
    "current_medications": [
        {"name": "Lisinopril", "dosage": "10mg", "frequency": "once daily"},
        {"name": "Metformin", "dosage": "500mg", "frequency": "twice daily"},
    ]
}

print("Testing generate_prediagnosis function...")
print("=" * 60)
print("\nInput Data:")
print(json.dumps(test_data, indent=2))
print("\n" + "=" * 60)

# Call the function
result = generate_prediagnosis(test_data, sample_history)

if result:
    print("\nPrediagnosis Result:")
    print("=" * 60)
    print(f"\nPotential Diseases:\n{result['potential_diseases']}")
    print(f"\nCourse of Action:\n{result['course_of_action']}")
    print(f"\nSupport Messages:\n{result['support_messages']}")
    print(f"\nRecommended Practitioners:\n{result['recommended_practitioners']}")
    print("\n" + "=" * 60)
    print("\nFull JSON Response:")
    print(json.dumps(result, indent=2))
else:
    print("\nError: Failed to generate prediagnosis")
