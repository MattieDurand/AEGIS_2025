import json
from typing import List, Optional, Literal

from enum import Enum
from typing import Annotated, Any

from pydantic import BaseModel, Field, confloat, conint, validator
from pydantic.config import ConfigDict

class Gender(BaseModel):
    category: Literal["Male", "Female", "Other"]
    intersex_condition: Optional[Literal["Klinefelter", "Turner", "Other", "Androgen Insensitivity Syndrome", "Klinefelter Syndrome"]] = None

class Weight(BaseModel):
    weight_kg: Annotated[float, Field(gt=0)]
    height_cm: Annotated[float, Field(gt=0)]
    bmi_category: Literal["Underweight", "Healthy", "Normal", "Overweight", "Obese"]

class Disease(BaseModel):
    name: str
    diagnosed_years_ago: Annotated[float, Field(ge=0)]
    prognosis: Literal["Stable", "Improving", "Worsening", "Terminal", "Unknown"]


class Comorbidity(BaseModel):
    name: str
    diagnosed_years_ago: Annotated[float, Field(ge=0)]
    prognosis: Literal["Stable", "Improving", "Worsening", "Terminal", "Unknown"]


class Treatment(BaseModel):
    treatment_name: str
    dosage_mg_per_day: Optional[Annotated[float, Field(ge=0)]] = None
    percent_week_administered: Optional[Annotated[float, Field(ge=0)]] = 0
    indication: Literal["Primary", "Comorbidity", "Other", "Secondary"]


class GeneticVariant(BaseModel):
    variant_name: Optional[str] = None
    associated_risks: Optional[List[str]] = None
    
    @validator('variant_name', pre=True, always=True)
    def map_variant_to_variant_name(cls, v: Any, values: Any):
        if 'gene' in values and 'variant' in values:
            return f"{values['gene']} {values['variant']}"
        
        # This fallback is not needed if 'variant_name' is not in the original data,
        # but it's good practice to handle it.
        if 'variant_name' in values:
            return values['variant_name']
            
        return v

    @validator('associated_risks', pre=True, always=True)
    def map_effect_to_associated_risks(cls, v: Any, values: Any):
        if 'effect' in values:
            return [values['effect']]
        return v


class PatientProfile(BaseModel):
    """
    This is the description of the main model
    """

    model_config = ConfigDict(title='Main')

    age: Annotated[int, Field(ge=0)]
    gender: Gender
    weight: Weight
    ethnicity: Literal["South Asian", "East Asian", "Black", "White", "Hispanic", "Indigenous Australian",
        "Middle Eastern", "Mixed", "Indigenous", "Other", "White European", "African", "Hispanic/Latino"]
    disease: Disease
    comorbidities: List[Comorbidity]
    treatments: List[Treatment]
    genetic_variants: List[GeneticVariant]
    snap: int = Field(
        default=42,
        title='The Snap',
        description='this is the value of snap',
        gt=30,
        lt=50,
    )


main_model_schema = PatientProfile.model_json_schema()