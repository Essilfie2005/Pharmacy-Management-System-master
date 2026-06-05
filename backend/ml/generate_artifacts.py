import os
import pandas as pd
import numpy as np
import xgboost as xgb
import shap
import matplotlib.pyplot as plt
from sklearn.metrics import roc_curve, auc, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import pickle

def generate_artifacts():
    print("Generating Academic Artifacts for S1 and S4 Deliverables...")
    
    # 1. Setup paths
    base_dir = os.path.dirname(__file__)
    data_path = os.path.join(base_dir, "../data/synthetic_students.csv")
    model_path = os.path.join(base_dir, "dropout_xgb_model.pkl")
    artifacts_dir = os.path.join(base_dir, "academic_artifacts")
    
    os.makedirs(artifacts_dir, exist_ok=True)
    
    # 2. Load Data & Model
    df = pd.read_csv(data_path)
    X = df[['attendance_rate', 'quiz_average', 'assignment_rate', 'mobile_engagement', 'financial_aid']]
    y = df['dropped_out']
    
    # Split to get a test set for ROC
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)
        
    # --- ARTIFACT 1: ROC Curve Benchmarking (XGBoost vs Logistic Regression) ---
    print("Generating ROC Curve Benchmark...")
    y_pred_xgb = model.predict_proba(X_test)[:, 1]
    fpr_xgb, tpr_xgb, _ = roc_curve(y_test, y_pred_xgb)
    roc_auc_xgb = auc(fpr_xgb, tpr_xgb)
    
    # Train baseline LR
    lr = LogisticRegression()
    lr.fit(X_train, y_train)
    y_pred_lr = lr.predict_proba(X_test)[:, 1]
    fpr_lr, tpr_lr, _ = roc_curve(y_test, y_pred_lr)
    roc_auc_lr = auc(fpr_lr, tpr_lr)
    
    plt.figure(figsize=(8, 6))
    plt.plot(fpr_xgb, tpr_xgb, color='darkorange', lw=2, label=f'XGBoost (AUC = {roc_auc_xgb:.2f})')
    plt.plot(fpr_lr, tpr_lr, color='blue', lw=2, label=f'Logistic Regression (AUC = {roc_auc_lr:.2f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC)')
    plt.legend(loc="lower right")
    plt.savefig(os.path.join(artifacts_dir, "ROC_Benchmark.png"), dpi=300, bbox_inches='tight')
    plt.close()
    
    # --- ARTIFACT 2: SHAP Beeswarm Summary Plot ---
    print("Generating SHAP Summary Plot...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)
    
    plt.figure(figsize=(10, 6))
    shap.summary_plot(shap_values, X_test, show=False)
    plt.tight_layout()
    plt.savefig(os.path.join(artifacts_dir, "SHAP_Summary_Beeswarm.png"), dpi=300, bbox_inches='tight')
    plt.close()
    
    # --- ARTIFACT 3: SHAP Waterfall Plot for a Single Student ---
    print("Generating SHAP Waterfall Plot...")
    # Get a high-risk student
    high_risk_idx = np.argmax(y_pred_xgb)
    
    # Waterfall plot requires an Explanation object in newer SHAP versions
    # We use force_plot and save it as HTML or use standard bar plot
    plt.figure(figsize=(8, 5))
    shap.plots.bar(explainer(X_test)[high_risk_idx], show=False)
    plt.tight_layout()
    plt.savefig(os.path.join(artifacts_dir, "SHAP_Single_Student_Bar.png"), dpi=300, bbox_inches='tight')
    plt.close()

    # --- ARTIFACT 4: Fairness Metrics & Statistical Report ---
    print("Generating Statistical Analysis Report...")
    # Calculate Equalised Odds proxy for Financial Aid (privileged vs unprivileged)
    preds_binary = (y_pred_xgb > 0.5).astype(int)
    
    # Financial Aid = 1 (Privileged), 0 (Unprivileged)
    priv_idx = (X_test['financial_aid'] == 1)
    unpriv_idx = (X_test['financial_aid'] == 0)
    
    tpr_priv = np.sum((preds_binary[priv_idx] == 1) & (y_test[priv_idx] == 1)) / np.sum(y_test[priv_idx] == 1) if np.sum(y_test[priv_idx] == 1) > 0 else 0
    tpr_unpriv = np.sum((preds_binary[unpriv_idx] == 1) & (y_test[unpriv_idx] == 1)) / np.sum(y_test[unpriv_idx] == 1) if np.sum(y_test[unpriv_idx] == 1) > 0 else 0
    
    report_content = f"""
    # Predictive Early Warning System - Statistical & Fairness Report
    
    ## 1. Model Performance (XGBoost)
    - AUC-ROC: {roc_auc_xgb:.3f}
    - Accuracy: {np.mean(preds_binary == y_test):.3f}
    
    ## 2. Baseline Comparison
    - Logistic Regression AUC-ROC: {roc_auc_lr:.3f}
    - Improvement over baseline: {roc_auc_xgb - roc_auc_lr:.3f}
    
    ## 3. Fairness Metrics (Equal Opportunity)
    - True Positive Rate (Financial Aid Recipients): {tpr_priv:.3f}
    - True Positive Rate (No Financial Aid): {tpr_unpriv:.3f}
    - TPR Disparity (Difference): {abs(tpr_priv - tpr_unpriv):.3f}
    """
    
    with open(os.path.join(artifacts_dir, "Statistical_Report.md"), "w") as f:
        f.write(report_content)
        
    print(f"All artifacts generated successfully in: {artifacts_dir}")

if __name__ == "__main__":
    generate_artifacts()
