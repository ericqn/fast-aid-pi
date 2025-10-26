import os
import anthropic
from dotenv import load_dotenv
import json

load_dotenv()

ANTH_API_KEY = os.getenv('ANTH_API_KEY')

client = anthropic.Anthropic(
    api_key=ANTH_API_KEY
)

def extract_json_from_text(text):
    """Extract JSON from text that might contain markdown code blocks or extra text."""
    # Try to find JSON in markdown code blocks
    if "```json" in text:
        start = text.find("```json") + 7
        end = text.find("```", start)
        json_str = text[start:end].strip()
    elif "```" in text:
        start = text.find("```") + 3
        end = text.find("```", start)
        json_str = text[start:end].strip()
    else:
        # Try to find JSON object by looking for { and }
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            json_str = text[start:end].strip()
        else:
            json_str = text.strip()

    return json_str

def generate_prediagnosis(patient_data, medical_history: None):
    system_prompt = """
        You are a medical expert trying to prediagnose a patient and eventually send that data
        to a doctor for further investigation. Your job is to locate their potential diseases,
        recommend a light course of action while waiting for the doctor's response, offer some stress
        relief messages, and recommend which types of practitioners to see. Your recommended course of actions
        should not be exhaustive and create unnecessary stress.

        Return your answer in a valid JSON structure strictly following these given keys, although the values may be longer or shorter.
        Return ONLY the JSON object without any markdown formatting or additional text.
        {
            "potential_diseases" : "stroke, heart disease, lung cancer, etc.",
            "course_of_action" : "I recommend you to reduce the amount of sugar and carbohydrate intake. Additionally, you can move around your right arm for better blood circulation.",
            "support_messages" : "Your symptoms are highly treatable and your local physicians have great ratings!",
            "recommended_practitioners" : "general physician, orthopedic, ER"
        }
    """

    user_content = f'Generate a prediagnosis based on the following data: {patient_data}'
    if medical_history:
        user_content += f'\nand on the given patient medical history: {medical_history}'
    try:
        response = client.messages.create(
            model = "claude-3-5-haiku-20241022",
            max_tokens = 2000,
            temperature = 0.1,
            system = system_prompt,
            messages = [
                {"role": "user", "content": user_content}
            ]
        )

        text_response = response.content[0].text
        # Extract JSON from the response (handles markdown code blocks)
        json_str = extract_json_from_text(text_response)
        prediagnosis_data = json.loads(json_str)

        required_fields = ["potential_diseases", "course_of_action", "support_messages", "recommended_practitioners"]
        for field in required_fields:
            if field not in prediagnosis_data:
                raise ValueError(f'Missing required field: {field}')
            
        return prediagnosis_data

    except Exception as e:
        print(f"Error generating prediagnosis: {e}")
        return None