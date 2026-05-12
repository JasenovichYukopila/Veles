import pandas as pd
import numpy as np
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC, LinearSVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, f1_score
from sklearn.calibration import CalibratedClassifierCV
import seaborn as sns
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

df = pd.read_csv('../Data/datav1.csv')
print('Datos cargados:', df.shape)

X = df.drop(columns=['label', 'song_id', 'segment_type'])
y = df['label']
groups = df['song_id']

le = LabelEncoder()
y_encoded = le.fit_transform(y)
print('Clases:', le.classes_)

gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=9347234)
train_idx, test_idx = next(gss.split(X, y_encoded, groups))

X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
y_train, y_test = y_encoded[train_idx], y_encoded[test_idx]
print(f'Train: {len(X_train)}, Test: {len(X_test)}')

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

svm_rbf  = SVC(kernel='rbf',    probability=True, random_state=42)
rf       = RandomForestClassifier(n_estimators=100, random_state=42)
gb       = GradientBoostingClassifier(n_estimators=100, random_state=42)
svm_linear = SVC(kernel='linear', probability=True, random_state=42)
svm_poly   = SVC(kernel='poly', degree=3, probability=True, random_state=42)
linear_svc = CalibratedClassifierCV(LinearSVC(random_state=42, max_iter=2000))
voting = VotingClassifier(
    estimators=[
        ('svm_linear', SVC(kernel='linear', probability=True, random_state=42)),
        ('gb',         GradientBoostingClassifier(n_estimators=100, random_state=42)),
        ('rf',         RandomForestClassifier(n_estimators=100, random_state=42))
    ],
    voting='soft'
)

models = {
    'SVM_RBF': svm_rbf,
    'Random_Forest': rf,
    'Gradient_Boosting': gb,
    'SVM_Linear': svm_linear,
    'SVM_Poly': svm_poly,
    'LinearSVC': linear_svc,
    'Voting_Linear_GB_RF': voting
}

resultados = []
for name, model in models.items():
    print(f'\nEntrenando: {name}')
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro')
    print(f'Accuracy: {acc:.4f}, Macro F1: {macro_f1:.4f}')
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    resultados.append({'Modelo': name, 'Accuracy': round(acc, 4), 'Macro F1': round(macro_f1, 4)})

    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(7, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=le.classes_, yticklabels=le.classes_)
    plt.title(f'Matriz de Confusion - {name}')
    plt.ylabel('Etiqueta Real')
    plt.xlabel('Prediccion')
    plt.tight_layout()
    plt.savefig(f'../Data/confusion_matrix_{name}.png', dpi=100)
    plt.close()

df_resultados = pd.DataFrame(resultados).sort_values('Macro F1', ascending=False).reset_index(drop=True)
df_resultados.index += 1
print('\n' + '='*50)
print('       RANKING FINAL DE MODELOS')
print('='*50)
print(df_resultados.to_string())
print('\nMejor modelo por Macro F1:', df_resultados.iloc[0]['Modelo'])
df_resultados.to_csv('../Data/model_ranking.csv', index=True)