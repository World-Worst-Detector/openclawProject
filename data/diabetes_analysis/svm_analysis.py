import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.inspection import permutation_importance
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, roc_curve

BASE_DIR = "/workspaces/openclawProject/data/diabetes_analysis"
CSV_PATH = "/workspaces/openclawProject/data/diabetes.csv"
os.makedirs(BASE_DIR, exist_ok=True)

df = pd.read_csv(CSV_PATH)

# Treat impossible zeros as missing
zero_as_missing_cols = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]
for col in zero_as_missing_cols:
    df[col] = df[col].replace(0, np.nan)

X = df.drop(columns=["Outcome"])
y = df["Outcome"]
feature_names = list(X.columns)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

svm = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
    ("clf", SVC(kernel="rbf", C=1.0, gamma="scale", probability=True, random_state=42)),
])

svm.fit(X_train, y_train)
proba = svm.predict_proba(X_test)[:, 1]
pred = (proba >= 0.5).astype(int)

metrics = {
    "accuracy": float(accuracy_score(y_test, pred)),
    "f1": float(f1_score(y_test, pred)),
    "roc_auc": float(roc_auc_score(y_test, proba)),
}

# Stability via 5-fold CV ROC-AUC
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(svm, X, y, cv=cv, scoring="roc_auc")
stability = {
    "cv_roc_auc_scores": [float(v) for v in cv_scores],
    "cv_roc_auc_mean": float(np.mean(cv_scores)),
    "cv_roc_auc_std": float(np.std(cv_scores)),
}

# Permutation feature importance on test set
perm = permutation_importance(
    svm, X_test, y_test, scoring="roc_auc", n_repeats=20, random_state=42
)
importance_pairs = sorted(
    zip(feature_names, perm.importances_mean, perm.importances_std),
    key=lambda x: x[1],
    reverse=True,
)

# Plot feature importance
top_features = [x[0] for x in importance_pairs]
top_importances = [x[1] for x in importance_pairs]

plt.figure(figsize=(9, 5))
plt.barh(top_features[::-1], top_importances[::-1], color="#7c3aed")
plt.title("SVM Permutation Feature Importance (ROC-AUC drop)")
plt.xlabel("Importance")
plt.tight_layout()
fi_path = os.path.join(BASE_DIR, "svm_feature_importance.png")
plt.savefig(fi_path, dpi=180)
plt.close()

# ROC curve
fpr, tpr, _ = roc_curve(y_test, proba)
plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, label=f"SVM AUC={metrics['roc_auc']:.3f}", color="#2563eb")
plt.plot([0, 1], [0, 1], "--", color="gray")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("SVM ROC Curve")
plt.legend()
plt.tight_layout()
roc_path = os.path.join(BASE_DIR, "svm_roc_curve.png")
plt.savefig(roc_path, dpi=180)
plt.close()

summary = {
    "model": "SVM (RBF)",
    "metrics": metrics,
    "stability": stability,
    "feature_importance": [
        {"feature": f, "importance_mean": float(m), "importance_std": float(s)}
        for f, m, s in importance_pairs
    ],
    "artifacts": {
        "feature_importance_plot": fi_path,
        "roc_curve_plot": roc_path,
    },
}

summary_path = os.path.join(BASE_DIR, "svm_summary.json")
with open(summary_path, "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)

# Human-readable explanation report
report_path = os.path.join(BASE_DIR, "svm_report.md")
with open(report_path, "w", encoding="utf-8") as f:
    f.write("# SVM 模型分析报告（Diabetes）\n\n")
    f.write("## 1) 模型结果\n")
    f.write(f"- Accuracy: {metrics['accuracy']:.3f}\n")
    f.write(f"- F1: {metrics['f1']:.3f}\n")
    f.write(f"- ROC-AUC: {metrics['roc_auc']:.3f}\n\n")

    f.write("## 2) Feature 重要性（Permutation Importance）\n")
    f.write("以下数值表示：打乱该特征后，模型 AUC 下降幅度。越大表示越重要。\n\n")
    for i, (feat, mean_imp, std_imp) in enumerate(importance_pairs[:8], start=1):
        f.write(f"{i}. **{feat}**: {mean_imp:.4f} ± {std_imp:.4f}\n")

    f.write("\n## 3) 可解释说明（给非技术同学）\n")
    f.write("- SVM 会在高维空间里找一条最能区分‘糖尿病/非糖尿病’的边界。\n")
    f.write("- 这里用 RBF 核，能处理非线性关系，所以比线性边界更灵活。\n")
    f.write("- 我们不是直接看系数，而是通过‘打乱一个特征后模型性能掉多少’来解释重要性。\n")
    f.write("- 从结果看，通常血糖（Glucose）和 BMI 等特征对判别更关键。\n")

    f.write("\n## 4) 特征关系与讨论\n")
    f.write("- 特征之间存在相关性（比如 BMI 与血糖、年龄之间可能有联动）。\n")
    f.write("- 非线性模型会综合这些关系，不一定能直接解释为单一线性影响。\n")
    f.write("- 因此用 permutation importance 来衡量整体贡献更稳妥。\n")

    f.write("\n## 5) 模型稳定性\n")
    f.write(f"- 5 折交叉验证 ROC-AUC 均值: {stability['cv_roc_auc_mean']:.3f}\n")
    f.write(f"- 5 折交叉验证 ROC-AUC 标准差: {stability['cv_roc_auc_std']:.3f}\n")
    f.write("- 标准差越小，说明不同抽样下模型更稳定。\n")

    f.write("\n## 6) 输出文件\n")
    f.write("- svm_summary.json\n")
    f.write("- svm_feature_importance.png\n")
    f.write("- svm_roc_curve.png\n")

print(json.dumps(summary, ensure_ascii=False, indent=2))
