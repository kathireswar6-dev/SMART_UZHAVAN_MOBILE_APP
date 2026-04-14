#!/usr/bin/env python3
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

# Correct CSV path
CSV_PATH = r"K:\MyProject\crop-disease-app\backend\Crop_recommendation.csv"

MODEL_OUT = r"K:\Project\crop_suggestion_model\crop_model.pkl"
SCALER_OUT = r"K:\Project\crop_suggestion_model\crop_scaler.pkl"
ENCODER_OUT = r"K:\Project\crop_suggestion_model\crop_label_encoder.pkl"


print("📥 Loading dataset...")
df = pd.read_csv(CSV_PATH)

required_columns = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall", "label"]

if not all(col in df.columns for col in required_columns):
    raise ValueError(f"CSV missing required columns. Must include: {required_columns}")

print(f"✔ Loaded {len(df)} rows.")

X = df[["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]].values
y = df["label"].values

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_encoded, test_size=0.2, random_state=42
)

print("🌾 Training RandomForestClassifier...")
model = RandomForestClassifier(
    n_estimators=500,
    max_depth=None,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

print("📊 Evaluating model...")
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print(f"\n🔥 Accuracy: {acc*100:.2f}%")
print("\n📌 Classification Report:\n")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

print("\n💾 Saving model...")
joblib.dump(model, MODEL_OUT)
joblib.dump(scaler, SCALER_OUT)
joblib.dump(label_encoder, ENCODER_OUT)

print("\n🎉 Training complete!")
print(f"📦 Model saved to: {MODEL_OUT}")
print(f"📦 Scaler saved to: {SCALER_OUT}")
print(f"📦 LabelEncoder saved to: {ENCODER_OUT}")
