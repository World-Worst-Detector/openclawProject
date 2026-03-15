# SVM 模型分析报告（Diabetes）

## 1) 模型结果
- Accuracy: 0.740
- F1: 0.600
- ROC-AUC: 0.796

## 2) Feature 重要性（Permutation Importance）
以下数值表示：打乱该特征后，模型 AUC 下降幅度。越大表示越重要。

1. **Glucose**: 0.1058 ± 0.0279
2. **Age**: 0.0349 ± 0.0132
3. **BMI**: 0.0280 ± 0.0116
4. **DiabetesPedigreeFunction**: 0.0199 ± 0.0137
5. **Pregnancies**: 0.0195 ± 0.0168
6. **Insulin**: 0.0134 ± 0.0077
7. **SkinThickness**: -0.0036 ± 0.0053
8. **BloodPressure**: -0.0047 ± 0.0059

## 3) 可解释说明（给非技术同学）
- SVM 会在高维空间里找一条最能区分‘糖尿病/非糖尿病’的边界。
- 这里用 RBF 核，能处理非线性关系，所以比线性边界更灵活。
- 我们不是直接看系数，而是通过‘打乱一个特征后模型性能掉多少’来解释重要性。
- 从结果看，通常血糖（Glucose）和 BMI 等特征对判别更关键。

## 4) 特征关系与讨论
- 特征之间存在相关性（比如 BMI 与血糖、年龄之间可能有联动）。
- 非线性模型会综合这些关系，不一定能直接解释为单一线性影响。
- 因此用 permutation importance 来衡量整体贡献更稳妥。

## 5) 模型稳定性
- 5 折交叉验证 ROC-AUC 均值: 0.821
- 5 折交叉验证 ROC-AUC 标准差: 0.012
- 标准差越小，说明不同抽样下模型更稳定。

## 6) 输出文件
- svm_summary.json
- svm_feature_importance.png
- svm_roc_curve.png
