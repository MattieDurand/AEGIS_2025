import os
from dotenv import load_dotenv
from google import genai
import json
import glob
from pathlib import Path
from pydantic import ValidationError
from schema_validate import PatientProfile, Disease, Treatment

load_dotenv()

# Path to your folder of JSON files
output_jsonl = Path("gemini_train.jsonl")
package_names = [f"Archive/Package_{i}" for i in range(1, 9)]

# Open the output file for writing
with output_jsonl.open("w", encoding="utf-8") as f_out:
    for package_name in package_names:
        input_folder = Path(package_name)
        print(f"Processing folder: {input_folder}")

        for file_path in glob.glob(str(input_folder / "*.json")):
            with open(file_path, "r", encoding="utf-8") as f_in:
                try:
                    raw_data = json.load(f_in)
                    
                    # Validate with Pydantic model
                    patient = PatientProfile(**raw_data)
                    
                    # Create training example:
                    # Input can be a text description; output is the schema JSON
                    input_text = (
                    f"Patient is {patient.age} years old. "
                    f"gender: {patient.gender.category}. "
                    f"weight: {patient.weight.weight_kg} kg. "
                    f"height: {patient.weight.height_cm} cm. "
                    f"BMI category: {patient.weight.bmi_category}. "
                    f"ethnicity: {patient.ethnicity}. "
                    f"primary disease: {patient.disease.name}. "
                    f"diagnosed {patient.disease.diagnosed_years_ago} years ago. "
                    f"prognosis: {patient.disease.prognosis}. "
                    f"Comorbidities: {', '.join([c.name for c in patient.comorbidities])}. "
                    f"Generate a treatment plan in JSON format. Use the exact format: Treatment: <treatment_name>, Dosage: <float> mg/day, Percent week administered: <float>%, Indication: <[Primary, Comorbidity, Other]>."
                    )

                    treatment_strings = []
                    for treatment in patient.treatments:
                        treatment_str = (
                            f"Treatment: {treatment.treatment_name}, "
                            f"Dosage: {treatment.dosage_mg_per_day} mg/day, "
                            f"Percent week administered: {treatment.percent_week_administered}%, "
                            f"Indication: {treatment.indication}"
                        )
                        treatment_strings.append(treatment_str)
                    output_text = ". ".join(treatment_strings)
                    
                    json.dump({"input": input_text, "output": output_text}, f_out)
                    f_out.write("\n")
                
                except ValidationError as e:
                    print(f"Validation failed for {file_path}:\n{e}")
                except json.JSONDecodeError:
                    print(f"Invalid JSON in file: {file_path}")