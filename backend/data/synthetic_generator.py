import pandas as pd
import numpy as np
from sdv.single_table import CTGANSynthesizer
from sdv.metadata import SingleTableMetadata
import os

def generate_seed_data(n_samples=200):
    """Generate realistic seed data reflecting Ghanaian public university context."""
    np.random.seed(42)
    
    # Generate realistic proxy features
    attendance_rate = np.random.normal(loc=75, scale=15, size=n_samples)
    attendance_rate = np.clip(attendance_rate, 0, 100)
    
    quiz_average = np.random.normal(loc=65, scale=20, size=n_samples)
    quiz_average = np.clip(quiz_average, 0, 100)
    
    assignment_rate = np.random.normal(loc=80, scale=20, size=n_samples)
    assignment_rate = np.clip(assignment_rate, 0, 100)
    
    # 0 = low engagement, 1 = medium, 2 = high
    mobile_engagement = np.random.choice([0, 1, 2], size=n_samples, p=[0.2, 0.5, 0.3])
    
    # Financial aid: 0 = No, 1 = Yes
    financial_aid = np.random.choice([0, 1], size=n_samples, p=[0.7, 0.3])
    
    # Determine dropout risk (0 = retained, 1 = dropped out)
    # Higher risk if attendance < 60, quiz < 50, low engagement, no financial aid
    risk_score = (
        (100 - attendance_rate) * 0.4 +
        (100 - quiz_average) * 0.3 +
        (100 - assignment_rate) * 0.1 +
        (2 - mobile_engagement) * 10 +
        (1 - financial_aid) * 10
    )
    
    # Convert risk score to binary outcome (approx 20-25% dropout rate)
    threshold = np.percentile(risk_score, 75)
    dropped_out = (risk_score >= threshold).astype(int)
    
    df = pd.DataFrame({
        'student_id': [f"UG-{str(i).zfill(4)}" for i in range(n_samples)],
        'attendance_rate': attendance_rate.round(1),
        'quiz_average': quiz_average.round(1),
        'assignment_rate': assignment_rate.round(1),
        'mobile_engagement': mobile_engagement,
        'financial_aid': financial_aid,
        'dropped_out': dropped_out
    })
    
    return df

def run_ctgan(seed_df, output_path, num_rows=500):
    """Use CTGAN to generate synthetic data based on the seed data."""
    print("Generating metadata...")
    metadata = SingleTableMetadata()
    metadata.detect_from_dataframe(data=seed_df)
    
    # Set student_id as primary key so it generates uniquely
    metadata.update_column(column_name='student_id', sdtype='id')
    
    print("Training CTGAN Synthesizer (this may take a minute)...")
    synthesizer = CTGANSynthesizer(
        metadata,
        epochs=300,
        batch_size=500,
        verbose=True
    )
    synthesizer.fit(seed_df)
    
    print(f"Generating {num_rows} synthetic records...")
    synthetic_data = synthesizer.sample(num_rows=num_rows)
    
    synthetic_data.to_csv(output_path, index=False)
    print(f"Synthetic data saved to {output_path}")

if __name__ == "__main__":
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    seed_data = generate_seed_data(n_samples=200)
    output_file = os.path.join(os.path.dirname(__file__), "synthetic_students.csv")
    run_ctgan(seed_data, output_file, num_rows=500)
