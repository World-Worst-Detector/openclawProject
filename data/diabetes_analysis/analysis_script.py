import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

BASE_DIR = "/workspaces/openclawProject/data/diabetes_analysis"
CSV_PATH = "/workspaces/openclawProject/data/diabetes.csv"
os.makedirs(BASE_DIR, exist_ok=True)

df = pd.read_csv(CSV_PATH)

# 1) 数据概览
overview = {
    "rows": int(df.shape[0]),
    "columns": int(df.shape[1]),
    "column_names": list(df.columns),
    "dtypes": {k: str(v) for k, v in df.dtypes.items()},
    "duplicate_rows": int(df.duplicated().sum()),
    "missing_values": {k: int(v) for k, v in df.isna().sum().items()},
}

# BMI Histogram（你要求）
plt.figure(figsize=(8, 5))
sns.histplot(df["BMI"], bins=30, kde=True, color="#f97316")
plt.title("BMI Histogram")
plt.xlabel("BMI")
plt.ylabel("Count")
plt.tight_layout()
bmi_hist_path = os.path.join(BASE_DIR, "bmi_histogram.png")
plt.savefig(bmi_hist_path, dpi=180)
plt.close()

# 0值异常处理（医学上某些字段0可视为缺失）
zero_as_missing_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
df_model = df.copy()
for col in zero_as_missing_cols:
    df_model[col] = df_model[col].replace(0, np.nan)

# 7) 相关性分析热力图
corr = df_model.corr(numeric_only=True)
outcome_corr = corr["Outcome"].drop("Outcome").sort_values(key=lambda s: s.abs(), ascending=False)

plt.figure(figsize=(9, 7))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdYlBu_r", square=True)
plt.title("Correlation Heatmap (0 -> NaN for selected medical fields)")
plt.tight_layout()
heatmap_path = os.path.join(BASE_DIR, "correlation_heatmap.png")
plt.savefig(heatmap_path, dpi=180)
plt.close()

# 8) 关键结论基础数据
class_ratio = df["Outcome"].value_counts(normalize=True).sort_index()

# 9) 基线模型
X = df_model.drop(columns=["Outcome"])
y = df_model["Outcome"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

logit = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression(max_iter=2000)),
])
logit.fit(X_train, y_train)
proba = logit.predict_proba(X_test)[:, 1]
pred = (proba >= 0.5).astype(int)

rf = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("clf", RandomForestClassifier(n_estimators=300, random_state=42)),
])
rf.fit(X_train, y_train)
proba_rf = rf.predict_proba(X_test)[:, 1]
pred_rf = (proba_rf >= 0.5).astype(int)

rf_model = rf.named_steps["clf"]
feat_imp = sorted(zip(X.columns, rf_model.feature_importances_), key=lambda t: t[1], reverse=True)

summary = {
    "overview": overview,
    "top_correlations_with_outcome": [
        {"feature": k, "corr": float(v)} for k, v in outcome_corr.head(5).items()
    ],
    "class_distribution": {
        "Outcome_0": float(class_ratio.get(0, 0)),
        "Outcome_1": float(class_ratio.get(1, 0)),
    },
    "baseline_results": {
        "logistic_regression": {
            "accuracy": float(accuracy_score(y_test, pred)),
            "f1": float(f1_score(y_test, pred)),
            "roc_auc": float(roc_auc_score(y_test, proba)),
        },
        "random_forest": {
            "accuracy": float(accuracy_score(y_test, pred_rf)),
            "f1": float(f1_score(y_test, pred_rf)),
            "roc_auc": float(roc_auc_score(y_test, proba_rf)),
        },
    },
    "rf_top_feature_importance": [
        {"feature": k, "importance": float(v)} for k, v in feat_imp[:5]
    ],
    "artifacts": {
        "bmi_histogram": bmi_hist_path,
        "heatmap": heatmap_path,
        "outcome_corr_csv": os.path.join(BASE_DIR, "outcome_correlation.csv"),
        "summary_json": os.path.join(BASE_DIR, "summary.json"),
    },
}

outcome_corr.to_csv(os.path.join(BASE_DIR, "outcome_correlation.csv"), header=["correlation"])
with open(os.path.join(BASE_DIR, "summary.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

print(json.dumps(summary, ensure_ascii=False, indent=2))
