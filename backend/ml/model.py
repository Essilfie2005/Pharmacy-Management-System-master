import pandas as pd
import xgboost as xgb
import shap
import pickle
import os
import matplotlib.pyplot as plt

MODEL_PATH = os.path.join(os.path.dirname(__file__), "dropout_xgb_model.pkl")

def train_and_save_model(data_path):
    print(f"Loading data from {data_path}")
    df = pd.read_csv(data_path)
    
    # Features and target
    X = df[['attendance_rate', 'quiz_average', 'assignment_rate', 'mobile_engagement', 'financial_aid']]
    y = df['dropped_out']
    
    # Train XGBoost model
    print("Training XGBoost classifier...")
    # scale_pos_weight for class imbalance (~3:1 retained to dropped)
    model = xgb.XGBClassifier(
        n_estimators=300, 
        max_depth=6, 
        learning_rate=0.05, 
        scale_pos_weight=3.0,
        random_state=42
    )
    model.fit(X, y)
    
    # Save the model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to {MODEL_PATH}")

def load_model():
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)

def predict_risk(student_features):
    """Predict risk probability and return SHAP explanation."""
    model = load_model()
    
    # Ensure order matches training
    feature_names = ['attendance_rate', 'quiz_average', 'assignment_rate', 'mobile_engagement', 'financial_aid']
    df = pd.DataFrame([student_features], columns=feature_names)
    
    # Predict probability
    risk_prob = model.predict_proba(df)[0][1]
    
    # Generate SHAP explanation
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(df)
    
    # Generate a plot to bytes or save to disk for a specific student
    # For now, return the raw SHAP values for the frontend to render, 
    # or generate a plot and save to disk
    
    explanation = []
    for i, feature in enumerate(feature_names):
        explanation.append({
            "feature": feature,
            "value": float(df.iloc[0][feature]),
            "shap_value": float(shap_values[0][i])
        })
        
    # Sort by absolute impact
    explanation = sorted(explanation, key=lambda x: abs(x["shap_value"]), reverse=True)
    
    return {
        "risk_score": float(risk_prob),
        "is_flagged": bool(risk_prob > 0.5), # Standard threshold, can be calibrated
        "top_factors": explanation[:3] # Top 3 driving factors
    }

if __name__ == "__main__":
    data_file = os.path.join(os.path.dirname(__file__), "../data/synthetic_students.csv")
    if os.path.exists(data_file):
        train_and_save_model(data_file)
    else:
        print(f"Data file not found at {data_file}. Run synthetic_generator.py first.")
