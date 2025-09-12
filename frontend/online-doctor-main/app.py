import requests

url = "https://073300478fa6.ngrok-free.app/generate-treatment"
payload = {"patient": "Patient is 38 years old. gender: Female. weight: 70.0 kg. height: 166.0 cm. BMI: Healthy. Primary disease: HIV."}
resp = requests.post(url, json=payload).json()
if "Output:" in resp['treatment_plan']:
    resp = resp['treatment_plan'].split("Output:")[1].strip()
else:
    resp = resp
print(resp)
