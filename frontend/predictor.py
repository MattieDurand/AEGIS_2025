import pandas as pd
import numpy as np
from sklearn.model_selection import GroupKFold, train_test_split, RandomizedSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import classification_report, mean_absolute_error
import json

# ---------- helpers ----------
def flatten_record(rec):
    # rec is one JSON dict like the example.
    out = {}
    out['age'] = rec.get('age')
    gender = rec.get('gender', {})
    out['gender'] = gender.get('category')
    wt = rec.get('weight', {})
    out['weight_kg'] = wt.get('weight_kg')
    out['height_cm'] = wt.get('height_cm')
    out['bmi_category'] = wt.get('bmi_category')
    out['ethnicity'] = rec.get('ethnicity')
    disease = rec.get('disease', {})
    out['disease_name'] = disease.get('name')
    out['disease_years_ago'] = disease.get('diagnosed_years_ago')
    # comorbidities: list → count and maybe flags for common ones
    comorbs = rec.get('comorbidities') or []
    out['comorbidity_count'] = len(comorbs)
    # treatments: for training label we assume one primary treatment per record
    treatments = rec.get('treatments') or []
    if treatments:
        # pick primary or first
        primary = treatments[0]
        out['treatment_name'] = primary.get('treatment_name')
        out['dosage_mg_per_day'] = primary.get('dosage_mg_per_day')
        out['percent_week_administered'] = primary.get('percent_week_administered')
    else:
        out['treatment_name'] = None
        out['dosage_mg_per_day'] = np.nan
        out['percent_week_administered'] = np.nan
    # genetic variants: convert to presence flags (simple)
    variants = rec.get('genetic_variants') or []
    for gv in variants:
        vname = gv.get('variant_name')
        if vname:
            # safe key
            key = f'var__{vname}'
            out[key] = 1
    return out

def build_dataframe(json_list):
    rows = [flatten_record(r) for r in json_list]
    df = pd.DataFrame(rows)
    # fill missing variant columns with 0
    df = df.fillna({c:0 for c in df.columns if c.startswith('var__')})
    # compute bmi from weight/height if missing
    if 'weight_kg' in df.columns and 'height_cm' in df.columns:
        mask = df['weight_kg'].notnull() & df['height_cm'].notnull()
        df.loc[mask, 'bmi'] = df.loc[mask, 'weight_kg'] / ( (df.loc[mask,'height_cm']/100.0)**2 )
        df['bmi'] = df['bmi'].fillna(np.nan)
    return df

# ---------- example usage ----------
# load your dataset (list of JSON objects) into `records`
# here we create an example list by repeating your sample record (replace with real data)
sample_json = {
  "age": 65,
  "gender": {"category": "Male", "intersex_condition": None},
  "weight": {"weight_kg": 75, "height_cm": 170, "bmi_category": "Healthy"},
  "ethnicity": "Hispanic",
  "disease": {"name": "Type 2 Diabetes Mellitus","diagnosed_years_ago": 6,"prognosis": "Stable"},
  "comorbidities": [],
  "treatments": [
    {"treatment_name": "Metformin","dosage_mg_per_day": 1500,"percent_week_administered": 100,"indication": "Primary"}
  ],
  "genetic_variants":[{"variant_name":"SLC22A1 rs622342","associated_risks":["Altered metformin transport"]}]
}
records = [sample_json] * 200  # replace with your dataset list

df = build_dataframe(records)

# drop rows with no label
df = df[df['treatment_name'].notnull()].reset_index(drop=True)

# create a patient_id if present; for demo, we'll simulate a patient id
df['patient_id'] = range(len(df))

# features / labels
label_col = 'treatment_name'
num_target = 'dosage_mg_per_day'

X = df.drop(columns=[label_col, num_target])
y_class = df[label_col]
y_reg = df[num_target]

# split patient-wise
train_idx, test_idx = next(GroupKFold(n_splits=5).split(X, y_class, groups=X['patient_id']))
X_train, X_test = X.iloc[train_idx].drop(columns=['patient_id']), X.iloc[test_idx].drop(columns=['patient_id'])
y_train_class, y_test_class = y_class.iloc[train_idx], y_class.iloc[test_idx]
y_train_reg, y_test_reg = y_reg.iloc[train_idx], y_reg.iloc[test_idx]

# preprocessing: define numeric and categorical columns
numeric_cols = ['age','weight_kg','height_cm','disease_years_ago','comorbidity_count','bmi']
cat_cols = ['gender','bmi_category','ethnicity','disease_name'] + [c for c in X_train.columns if c.startswith('var__')]

num_transform = Pipeline([
    ('impute', SimpleImputer(strategy='median')),
    ('scale', StandardScaler())
])
cat_transform = Pipeline([
    ('impute', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse=False))
])
preproc = ColumnTransformer([
    ('num', num_transform, [c for c in numeric_cols if c in X_train.columns]),
    ('cat', cat_transform, [c for c in cat_cols if c in X_train.columns])
])

# classifier pipeline for treatment_name
clf = Pipeline([
    ('pre', preproc),
    ('model', RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42))
])
clf.fit(X_train, y_train_class)
y_pred = clf.predict(X_test)
print("Classification report for treatment_name:")
print(classification_report(y_test_class, y_pred))

# regressor pipeline for dosage (conditioned on features; you could instead train per-drug regressors)
reg = Pipeline([
    ('pre', preproc),
    ('model', RandomForestRegressor(n_estimators=200, random_state=42))
])
# For dosage some rows might be NaN; filter
mask_train = y_train_reg.notnull()
reg.fit(X_train[mask_train], y_train_reg[mask_train])
mask_test = y_test_reg.notnull()
y_reg_pred = reg.predict(X_test[mask_test])
print("Dosage MAE:", mean_absolute_error(y_test_reg[mask_test], y_reg_pred))