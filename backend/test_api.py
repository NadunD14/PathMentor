import requests
import json

# Test the learning path generation endpoint
def test_generate_learning_path():
    url = "http://localhost:8000/api/generate-learning-path"
    
    payload = {
        "user_profile": {
            "goal": "skill_building",
            "experience_level": "beginner",
            "topic": "React",
            "learning_style": "hands_on",
            "time_commitment": 10,
            "user_id": "test_user_123"
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("Testing learning path generation...")
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Success! Generated learning path:")
            print(f"Path ID: {result.get('path_id')}")
            print(f"Title: {result.get('learning_path', {}).get('title')}")
            print(f"Total Duration: {result.get('learning_path', {}).get('total_duration')}")
            print(f"Number of Steps: {len(result.get('learning_path', {}).get('steps', []))}")
            
            # Show first step details
            steps = result.get('learning_path', {}).get('steps', [])
            if steps:
                first_step = steps[0]
                print(f"\nFirst Step: {first_step.get('title')}")
                print(f"Description: {first_step.get('description')}")
                print(f"Resources: {len(first_step.get('resources', []))} items")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error testing API: {str(e)}")

def test_health_endpoint():
    try:
        print("Testing health endpoint...")
        response = requests.get("http://localhost:8000/health")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Health check result:")
            print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error testing health endpoint: {str(e)}")

def test_root_endpoint():
    try:
        print("Testing root endpoint...")
        response = requests.get("http://localhost:8000/")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Root endpoint result:")
            print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error testing root endpoint: {str(e)}")

if __name__ == "__main__":
    print("=== PathMentor API Test ===\n")
    
    test_root_endpoint()
    print("\n" + "="*50 + "\n")
    
    test_health_endpoint()
    print("\n" + "="*50 + "\n")
    
    test_generate_learning_path()
