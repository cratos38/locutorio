#!/bin/bash
# Script para completar la migración a InsightFace

FILE="server-v4.0-insightface.py"

# Reemplazar face_recognition.face_locations en verify_identity_document
sed -i '933s/face_locations = face_recognition.face_locations(img_resized)/face_locations, insightface_faces_id = detect_faces_insightface(img_resized)/' "$FILE"

# Reemplazar face_recognition.face_encodings en verify_identity_document  
sed -i '1032s/face_encodings = face_recognition.face_encodings(img_resized, face_locations)/face_embeddings = get_face_embeddings_insightface(img_resized)/' "$FILE"

# Reemplazar face_recognition.face_distance (selfie vs ID)
sed -i '1059s/distance_selfie_to_id = face_recognition.face_distance(\[id_encoding\], selfie_encoding)\[0\]/similarity_selfie_to_id = cosine_similarity(id_embedding, selfie_embedding)/' "$FILE"
sed -i '1060s/match_selfie_to_id = distance_selfie_to_id < 0.5/match_selfie_to_id = similarity_selfie_to_id > 0.35/' "$FILE"
sed-i '1061s/confidence_selfie_to_id = round(1.0 - distance_selfie_to_id, 3)/confidence_selfie_to_id = round(similarity_selfie_to_id, 3)/' "$FILE"

# Reemplazar en blacklist endpoint
sed -i '1606s/faces = face_recognition.face_locations(img)/faces_loc, faces_obj = detect_faces_insightface(img)/' "$FILE"
sed -i '1611s/encodings = face_recognition.face_encodings(img, faces)/embeddings = get_face_embeddings_insightface(img)/' "$FILE"
sed-i '1612s/face_blacklist\[identity\] = encodings\[0\]/face_blacklist[identity] = embeddings[0]/' "$FILE"

echo "✅ Script de migración creado"
