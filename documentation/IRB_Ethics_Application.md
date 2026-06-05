# Institutional Review Board (IRB) Ethics Application Draft
**Project:** Lightweight Dropout Prediction and Early Warning System
**Target:** University Ethics Committee

## 1. Data Collection & Privacy
- **Source Data:** Anonymised university registry records (attendance, quiz scores, financial aid status).
- **Anonymisation:** Student IDs are replaced with cryptographic hashes (`UG-XXXX`). No personally identifiable information (PII) such as names, birth dates, or addresses are extracted from the registry.
- **Compliance:** Full compliance with the Ghana Data Protection Act (2012). Data is stored locally on a secured MySQL database with AES-256 encryption.

## 2. Model Fairness & Bias Mitigation
- **Bias Auditing:** The model's True Positive Rate (TPR) is audited across demographic subgroups (e.g., financial aid recipients vs. non-recipients) to ensure equalised odds.
- **Algorithmic Transparency:** All risk flags are accompanied by SHAP (SHapley Additive exPlanations) visualisations, ensuring counsellors understand the causal factors behind the AI's prediction. The AI does not make autonomous decisions; it acts strictly as an advisory tool for human counsellors.

## 3. Intervention Protocol
- **Consent:** Students participating in the pilot are informed of the early-warning system at enrolment and may opt out of automated SMS alerts without penalty.
- **Action:** SMS alerts are sent strictly to trained university counsellors, not to the students directly, to avoid algorithmic anxiety.
