---
title: Veles Classifier
emoji: 🎵
colorFrom: purple
colorTo: pink
sdk: docker
app_file: app.py
pinned: false
---

# Veles Classifier

ML-powered music genre classifier. Accepts audio files and returns a genre prediction with confidence.

**Endpoint:** `POST /classify`

**Model:** VotingClassifier (SVM + GradientBoosting + RandomForest) trained on acoustic features via librosa.

**Warmup:** Model is downloaded from HuggingFace Hub on startup.