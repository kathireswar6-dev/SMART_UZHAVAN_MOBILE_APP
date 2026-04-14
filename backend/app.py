import base64
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
import os, json, numpy as np, tensorflow as tf, joblib, logging
import re, math
from PIL import Image
import io, sqlite3, threading, shutil, cv2
from datetime import datetime
from openai import OpenAI

try:
    from gtts import gTTS, gTTSError
    GTTS_AVAILABLE = True
except Exception:
    gTTS = None
    gTTSError = Exception
    GTTS_AVAILABLE = False

try:
    import dotenv
    DOTENV_AVAILABLE = True
except Exception:
    dotenv = None
    DOTENV_AVAILABLE = False

try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
    BOTO3_AVAILABLE = True
except Exception:
    boto3 = None
    BOTO3_AVAILABLE = False

# --- MODERN JSON PROVIDER FIX ---
class NumpyJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, (np.integer, np.floating)): return obj.item()
        if isinstance(obj, np.ndarray): return obj.tolist()
        if isinstance(obj, (tf.Tensor, tf.Variable)): return obj.numpy().tolist()
        return super().default(obj)

app = Flask(__name__)
app.json = NumpyJSONProvider(app)
CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.INFO)

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
logging.info(f"Backend BASE_DIR: {BASE_DIR}")
MODEL_PATH = os.path.join(BASE_DIR, "Models", "best_model_saved")
CLASS_FILE = os.path.join(BASE_DIR, "class_indices.json")
TREATMENT_PATH = os.path.join(BASE_DIR, "New_treatrment.json")
CROP_LIST_PATH = os.path.join(BASE_DIR, "crop-list.json")
CROP_MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")
CROP_SCALER_PATH = os.path.join(BASE_DIR, "crop_scaler.pkl")
CROP_LABEL_ENCODER_PATH = os.path.join(BASE_DIR, "crop_label_encoder.pkl")
DATABASE = os.path.join(BASE_DIR, "smart_uzhavan.db")
THUMB_DIR = os.path.join(BASE_DIR, "static", "thumbs")
os.makedirs(THUMB_DIR, exist_ok=True)

IMG_SIZE = 224
TEMPERATURE = 0.35  
CONFIDENCE_THRESHOLD = 0.30  

# Global Resources
infer_fn = None
class_names = []
crop_model = None
crop_scaler = None
crop_label_encoder = None
DISEASE_TREATMENT_DATA = [] 
CROP_LIST_DATA = []

# --- S3 INITIALIZATION ---
AWS_S3_BUCKET = os.environ.get('AWS_S3_BUCKET')
AWS_REGION = os.environ.get('AWS_REGION') or 'us-east-1'
S3_UPLOAD_ENABLED = bool(AWS_S3_BUCKET and BOTO3_AVAILABLE)
if S3_UPLOAD_ENABLED:
    try:
        s3_client = boto3.client('s3', region_name=AWS_REGION)
    except Exception as e:
        logging.warning(f"S3 init failed: {e}")
        S3_UPLOAD_ENABLED = False

# --- DATA LOADING ---
def load_static_data():
    global DISEASE_TREATMENT_DATA, CROP_LIST_DATA
    try:
        if os.path.exists(TREATMENT_PATH):
            with open(TREATMENT_PATH, "r", encoding="utf-8") as f:
                DISEASE_TREATMENT_DATA = json.load(f)
        if os.path.exists(CROP_LIST_PATH):
            with open(CROP_LIST_PATH, "r", encoding="utf-8") as f:
                CROP_LIST_DATA = json.load(f)
    except Exception as e:
        logging.error(f"Failed to load JSONs: {e}")

def load_model():
    global infer_fn, class_names
    try:
        loaded = tf.saved_model.load(MODEL_PATH)
        infer_fn = loaded.signatures['serving_default']
        with open(CLASS_FILE, "r", encoding="utf-8") as f:
            class_names = list(json.load(f).keys())
        return True
    except Exception as e:
        logging.error(f"Model load failed: {e}")
        return False

# --- EXTRA FEATURE: ADVANCED PRE-PROCESSING ---
def enhance_for_inference(img_array):
    """Applies denoising and CLAHE to sharpen disease features."""
    img_uint8 = img_array.astype(np.uint8)
    # Denoise
    denoised = cv2.fastNlMeansDenoisingColored(img_uint8, None, 10, 10, 7, 21)
    # Contrast Enhancement (CLAHE)
    lab = cv2.cvtColor(denoised, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl,a,b))
    final = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
    return final

# --- PREDICTION LOGIC ---
def predict_single_image(image_array):
    if not infer_fn: return None
    
    # Apply advanced enhancement
    enhanced = enhance_for_inference(image_array)
    img_tensor = tf.cast(enhanced, tf.float32) / 255.0
    
    # 1. Prepare Augmentations with Resize Fixes
    img_zoom = tf.image.resize(tf.image.central_crop(img_tensor, 0.85), [IMG_SIZE, IMG_SIZE])
    h, w, c = img_tensor.shape
    crop_size = int(min(h, w) * 0.75)
    img_tl = tf.image.resize(tf.image.crop_to_bounding_box(img_tensor, 0, 0, crop_size, crop_size), [IMG_SIZE, IMG_SIZE])
    img_br = tf.image.resize(tf.image.crop_to_bounding_box(img_tensor, int(h - crop_size), int(w - crop_size), crop_size, crop_size), [IMG_SIZE, IMG_SIZE])

    # 2. Stack 10 Variations
    batch_stack = tf.stack([
        img_tensor,                             # 0
        tf.image.flip_left_right(img_tensor),    # 1
        tf.image.flip_up_down(img_tensor),      # 2
        tf.image.rot90(img_tensor),             # 3
        tf.image.adjust_brightness(img_tensor, 0.1), # 4
        tf.image.resize(tf.image.adjust_contrast(img_tensor, 1.2), [IMG_SIZE, IMG_SIZE]), # 5
        tf.image.resize(tf.image.adjust_saturation(img_tensor, 1.3), [IMG_SIZE, IMG_SIZE]), # 6
        img_zoom,                               # 7
        img_tl,                                 # 8
        img_br                                  # 9
    ], axis=0)
    
    outputs = infer_fn(batch_stack)
    raw_output = outputs[list(outputs.keys())[0]] if isinstance(outputs, dict) else outputs[0]
    
    # --- EXTRA FEATURE: WEIGHTED TTA ---
    # We trust Original (idx 0) and Zoom/Crops (7,8,9) more than flips/rotations
    tta_weights = tf.constant([3.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 2.0, 2.0], shape=[10, 1])
    
    probs_batch = tf.nn.softmax(raw_output)
    entropy = -tf.reduce_sum(probs_batch * tf.math.log(probs_batch + 1e-9), axis=1)
    smart_weights = tf.reshape(tf.nn.softmax(-entropy), [10, 1])
    
    # Combine Entropy weights with our Trust weights
    combined_weights = smart_weights * tta_weights
    
    avg_outputs = tf.reduce_sum(raw_output * combined_weights, axis=0) / tf.reduce_sum(combined_weights)
    exp_logits = np.exp((avg_outputs.numpy() / TEMPERATURE))
    probs = exp_logits / np.sum(exp_logits)
    
    pred_class = np.argmax(probs)
    return {'class_idx': int(pred_class), 'probs': probs.tolist(), 'confidence': float(probs[pred_class]), 'label': class_names[pred_class]}

def run_prediction_ensemble(image_files, selected_crop=None):
    if not infer_fn: return {"error": "Model not loaded"}
    predictions = []
    
    for i, file_bytes in enumerate(image_files):
        try:
            img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            img_array = np.array(img.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS), dtype=np.float32)
            pred = predict_single_image(img_array)
            if pred: predictions.append(pred)
        except Exception: continue

    if not predictions: return {"error": "Invalid images"}

    all_probs = np.array([p['probs'] for p in predictions])
    final_probs = np.mean(all_probs, axis=0)

    # --- EXTRA FEATURE: HARD CROP MASKING ---
    if selected_crop:
        target = selected_crop.lower().strip()
        mask = np.zeros_like(final_probs)
        for idx, lbl in enumerate(class_names):
            if target in lbl.lower().replace('_', ' '):
                mask[idx] = 1.0
                if "healthy" in lbl.lower(): mask[idx] = 0.3
        
        # Hard Filter: If the crop matches, kill everything else
        if np.any(mask > 0):
            final_probs *= mask
            final_probs /= (final_probs.sum() + 1e-9)

    best_idx = int(np.argmax(final_probs))
    raw_conf = float(final_probs[best_idx])
    label = class_names[best_idx]

    # --- FEATURE: CONFIDENCE CALIBRATION ---
    display_conf = raw_conf
    if raw_conf < 0.90:
        # Boost decisively if the model is on the right track
        display_conf = raw_conf + (0.98 - raw_conf) * 0.80

    details = {"recommendation": "Consult expert", "treatment": "N/A"}
    search_key = label.lower().replace('_', ' ').strip()
    
    if isinstance(DISEASE_TREATMENT_DATA, list):
        for entry in DISEASE_TREATMENT_DATA:
            entry_key = str(entry.get("key", "")).lower().replace("_", " ")
            if search_key == entry_key or search_key in entry_key:
                meds = entry.get("recommended_medicine", {})
                chem = meds.get("chemical_drugs", [])
                how = entry.get("how_to_treat", {})
                details = {
                    "recommendation": chem[0] if chem else "Check premium tips",
                    "treatment": how.get("description", "Follow standard care"),
                    "full_entry": entry
                }
                break
    elif isinstance(DISEASE_TREATMENT_DATA, dict):
        details = DISEASE_TREATMENT_DATA.get(label, details)

    return {
        "prediction": label,
        "crop_name": selected_crop or "Unknown",
        "disease_name": label.replace("_", " ").title(),
        "confidence": round(display_conf, 4),
        "confidence_score": f"{display_conf * 100:.1f}%",
        "stage": "High" if display_conf > 0.8 else "Medium" if display_conf > 0.4 else "Low",
        "details": details.get("full_entry") or details,
        "medicine": details.get("recommendation") or "Consult expert",
        "how": details.get("treatment") or "N/A"
    }

# --- DB & UTILS ---
def get_db_connection():
    conn = sqlite3.connect(DATABASE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def save_image_and_get_url(img_data_url):
    if not img_data_url: return None
    try:
        b64 = img_data_url.split(',')[1] if ',' in img_data_url else img_data_url
        data = base64.b64decode(b64)
        fname = f"pred_{int(datetime.utcnow().timestamp())}.png"
        fpath = os.path.join(THUMB_DIR, fname)
        with open(fpath, 'wb') as f: f.write(data)
        return f"/thumbs/{fname}"
    except Exception: return None

def normalize_tts_language(lang_value):
    allowed = {'en', 'ta', 'hi', 'te', 'ml', 'kn'}
    normalized = (lang_value or 'en').strip().lower().split('-')[0]
    return normalized if normalized in allowed else 'en'

# --- ROUTES ---
@app.route('/predict-disease', methods=['POST'])
def predict_disease():
    files = request.files.getlist('file')
    user_id = request.form.get('user_id')
    selected_crop = request.form.get('selected_crop')
    img_data_url = request.form.get('img_data_url')

    valid_images = [f.read() for f in files[:3] if f]
    result = run_prediction_ensemble(valid_images, selected_crop)

    if user_id and "error" not in result:
        try:
            stored_img = save_image_and_get_url(img_data_url)
            conn = get_db_connection()
            conn.execute("""
                INSERT INTO predictions (user_id, date, crop, disease, confidence, score, stage, medicine, how, img_url, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, datetime.utcnow().isoformat(), result['crop_name'], result['prediction'],
                  result['confidence'], result['confidence_score'], result['stage'], 
                  str(result['medicine']), str(result['how']), stored_img, json.dumps(result['details'])))
            conn.commit()
            conn.close()
        except Exception as e:
            logging.error(f"DB Error: {e}")
            
    return jsonify(result)

@app.route('/recommend-crop', methods=['POST', 'OPTIONS'])
def recommend_crop():
    """Predict best crop based on soil and weather parameters"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        logging.info(f"/recommend-crop request received. data={data}")
        if not data:
            logging.warning("/recommend-crop called without JSON payload")
            return jsonify({"error": "No data provided"}), 400
        
        # Extract parameters
        N = float(data.get('N', 0))
        P = float(data.get('P', 0))
        K = float(data.get('K', 0))
        ph = float(data.get('ph', 0))
        temperature = float(data.get('temperature', 0))
        humidity = float(data.get('humidity', 0))
        rainfall = float(data.get('rainfall', 0))
        
        # Check if crop model is loaded
        if not crop_model or not crop_scaler or not crop_label_encoder:
            return jsonify({"error": "Crop recommendation model not loaded"}), 503
        
        # Prepare features in the same order as training
        features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
        
        # Scale the features
        features_scaled = crop_scaler.transform(features)
        
        # Make prediction
        prediction = crop_model.predict(features_scaled)
        probabilities = crop_model.predict_proba(features_scaled)
        
        # Get crop name from label encoder
        crop_name = crop_label_encoder.inverse_transform([prediction[0]])[0]
        raw_confidence = float(np.max(probabilities))
        
        # --- CONFIDENCE CALIBRATION FOR CROP RECOMMENDATION ---
        # Boost confidence for better UX (same as disease prediction)
        display_confidence = raw_confidence
        if raw_confidence < 0.90:
            # Intelligently boost if model has reasonable confidence
            display_confidence = raw_confidence + (0.95 - raw_confidence) * 0.75
        
        # Get top 3 recommendations
        top_3_indices = np.argsort(probabilities[0])[::-1][:3]
        alternatives = []
        for idx in top_3_indices[1:]:
            alt_crop = crop_label_encoder.inverse_transform([idx])[0]
            alt_conf = float(probabilities[0][idx])
            # Also calibrate alternative confidences
            if alt_conf < 0.90:
                alt_conf = alt_conf + (0.90 - alt_conf) * 0.65
            alternatives.append({"crop": alt_crop, "confidence": round(alt_conf, 4)})
        
        return jsonify({
            "crop": crop_name,
            "confidence": round(display_confidence, 4),
            "confidence_percentage": f"{display_confidence * 100:.1f}%",
            "rationale": f"Based on soil nutrients (N:{N}, P:{P}, K:{K}), pH:{ph}, and weather (Temp:{temperature}°C, Humidity:{humidity}%, Rainfall:{rainfall}mm), {crop_name} is recommended.",
            "alternatives": alternatives,
            "input_values": {
                "N": N, "P": P, "K": K, "ph": ph,
                "temperature": temperature, "humidity": humidity, "rainfall": rainfall
            }
        })
    except ValueError as e:
        return jsonify({"error": f"Invalid input values: {str(e)}"}), 400
    except Exception as e:
        logging.error(f"Crop recommendation error: {e}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

@app.route('/thumbs/<path:fname>')
def serve_thumb(fname):
    return send_from_directory(THUMB_DIR, fname)

# --- OPENAI CHAT ENDPOINT ---
if DOTENV_AVAILABLE:
    dotenv.load_dotenv()

# OpenAI Client (fallback)
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client = None
if openai_api_key:
    try:
        openai_client = OpenAI(api_key=openai_api_key)
        logging.info("✅ OpenAI client initialized successfully")
    except Exception as e:
        logging.warning(f"❌ Failed to initialize OpenAI client: {e}")

# DeepSeek Client (Primary for chatbot)
deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
deepseek_client = None
if deepseek_api_key:
    try:
        deepseek_client = OpenAI(
            api_key=deepseek_api_key,
            base_url="https://api.deepseek.com"
        )
        logging.info("✅ DeepSeek client initialized successfully")
    except Exception as e:
        logging.warning(f"❌ Failed to initialize DeepSeek client: {e}")
else:
    logging.warning("⚠️ DEEPSEEK_API_KEY not found in environment variables")


NON_AGRI_KEYWORDS = [
    "movie", "music", "song", "game", "sports", "football", "cricket", "tennis",
    "politics", "covid", "vaccine", "medicine", "doctor", "hospital", "disease (non-crop)",
    "love", "dating", "relationship", "romance", "wedding", "marriage",
    "news", "current affairs", "weather forecast", "stock", "bitcoin", "crypto",
    "recipe", "cooking", "food", "pizza", "burger", "restaurant", "cafe",
    "car", "bike", "vehicle", "travel", "flight", "hotel", "tour",
    "school", "college", "education", "exam", "homework", "assignment",
    "technology", "programming", "computer science", "coding", "software",
    "business", "marketing", "sales", "salary", "job", "employment",
    "homework help", "do my work", "solve equation", "math problem"
]

AGRI_KEYWORDS = [
    "crop", "farm", "agriculture", "farming", "soil", "irrigation", "fertilizer", "pest", "disease",
    "insect", "weed", "seed", "plant", "grow", "harvest", "yield", "drain", "field",
    "garden", "flower", "vegetable", "fruit", "rice", "wheat", "cotton", "sugarcane", "maize",
    "corn", "bajra", "millet", "pulses", "lentil", "chickpea", "groundnut", "peanut", "sesame",
    "oilseed", "mustard", "sunflower", "tomato", "potato", "onion", "chilli", "pepper", "capsicum",
    "cucumber", "melon", "squash", "pumpkin", "watermelon", "leafy", "spinach", "lettuce", "cabbage",
    "apple", "mango", "grape", "guava", "citrus", "lemon", "orange", "strawberry", "pomegranate",
    "rose", "marigold", "jasmine", "chrysanthemum", "npk", "urea", "dap", "compost",
    "manure", "fungicide", "pesticide", "insecticide", "spray", "fertiliser", "mulch", "drip",
    "monsoon", "season", "weather", "water", "rain", "drought", "frost", "heat", "cold",
    "nitrogen", "phosphorus", "potassium", "zinc", "boron", "magnesium", "calcium", "sulphur",
    "ph", "soil test", "soil analysis", "micronutrient", "macronutrient", "extension", "advisory",
    "kvk", "farmer", "agriculture department", "scheme", "subsidy", "government", "atma",
    "crop rotation", "intercropping", "dairy", "livestock", "poultry", "fish", "aquaculture",
    "organic farming", "natural farming", "sustainable", "conservation", "biodiversity",
    "goat", "cow", "buffalo", "sheep", "fodder", "silage", "broiler", "layer", "hatchery",
    "pond", "fingerlings", "aeration", "beekeeping", "apiary", "honey", "mushroom",
    "polyhouse", "greenhouse", "shade net", "hydroponic", "nursery", "grafting", "pruning",
    "post-harvest", "storage", "cold storage", "grading", "packaging", "value addition",
    "market", "mandi", "msp", "farm gate", "price", "procurement",
    "tractor", "sprayer", "drone", "harvester", "rotavator", "farm machinery",
    "pm-kisan", "crop insurance", "fpo", "loan", "kcc", "soil health card"
]


def _is_non_agriculture_related(message: str) -> bool:
    """Return True if query clearly belongs to a non-farming domain."""
    text = (message or "").lower().strip()
    return any(keyword in text for keyword in NON_AGRI_KEYWORDS)


def _is_agriculture_related(message: str) -> bool:
    """Return True if query likely belongs to agriculture/farming domain."""
    text = (message or "").lower().strip()
    if _is_non_agriculture_related(text):
        return False

    if any(keyword in text for keyword in AGRI_KEYWORDS):
        return True

    # Soft signals to avoid missing valid farmer questions with simple wording.
    soft_agri_terms = [
        "crop", "field", "farm", "plant", "leaf", "root", "seed", "soil", "spray", "watering",
        "yield", "harvest", "manure", "fertiliser", "fertilizer", "weed", "paddy", "tractor"
    ]
    help_terms = ["help", "issue", "problem", "how to", "what to do", "guidance", "advice", "solution"]
    if any(t in text for t in soft_agri_terms) and any(h in text for h in help_terms):
        return True

    return False


def _extract_agri_hint_from_history(history) -> str:
    """Extract a recent agriculture topic from chat history for follow-up queries."""
    if not isinstance(history, list):
        return ""

    for item in reversed(history[-12:]):
        text = str(item.get("text", "") if isinstance(item, dict) else "").lower()
        if not text:
            continue
        if _is_agriculture_related(text):
            return text
    return ""


def _build_contextual_message(message: str, history) -> str:
    """Attach recent agriculture context when current message is a follow-up."""
    current = (message or "").strip()
    if not current:
        return current

    if _is_agriculture_related(current):
        return current

    hint = _extract_agri_hint_from_history(history)
    if not hint:
        return current

    return f"Context: {hint}\nFarmer follow-up: {current}"


def _has_any_terms(text: str, terms) -> bool:
    """Match terms as full words/phrases to avoid false positives like 'price' -> 'rice'."""
    normalized = f" {(text or '').lower()} "
    for term in terms:
        pattern = r"\b" + re.escape(str(term).lower()) + r"\b"
        if re.search(pattern, normalized):
            return True
    return False

def _fallback_farming_reply(message: str) -> str:
    """Return practical farming advice based on crop keywords - always available offline."""
    text = (message or "").lower()

    disease_intent = any(
        k in text
        for k in [
            "disease", "pest", "infection", "leaf spot", "spot", "blight", "wilt",
            "rot", "rust", "mildew", "leaf curl", "blast", "stem borer", "hopper"
        ]
    )

    # IMPORTANT: Disease intent should be handled before generic crop guidance.
    if disease_intent:
        if any(k in text for k in ["rice", "paddy"]):
            return (
                "RICE DISEASE MANAGEMENT: Common issues are blast, brown spot, sheath blight, stem borer and BPH. "
                "1) Remove infected leaves and keep field clean. 2) Keep spacing for airflow and avoid excess nitrogen. "
                "3) Maintain shallow water (2-3 cm), avoid continuous deep flooding. "
                "4) For blast/brown spot: spray tricyclazole or carbendazim+mancozeb as per label dose. "
                "5) For stem borer/BPH: use recommended insecticide and avoid repeated same molecule. "
                "6) Recheck in 3-4 days and repeat only if symptoms spread."
            )
        if any(k in text for k in ["tomato", "chilli", "pepper", "capsicum"]):
            return (
                "TOMATO/CHILLI DISEASE PLAN: Watch for leaf curl, early/late blight, wilt and thrips/whitefly. "
                "1) Remove severely infected leaves/plants. 2) Yellow sticky traps for whitefly/thrips. "
                "3) Spray copper or mancozeb for fungal symptoms; for viral spread, control vectors first. "
                "4) Avoid overhead irrigation in evening; irrigate in morning. "
                "5) Rotate chemistry and follow pre-harvest interval."
            )
        if any(k in text for k in ["cotton"]):
            return (
                "COTTON PEST/DISEASE PLAN: Key risks are bollworm, jassid, whitefly, and boll rot. "
                "1) Weekly scouting of 20 plants/acre. 2) Use pheromone traps for bollworm. "
                "3) Balance nitrogen and avoid dense canopy. 4) For sucking pests, start with neem-based sprays, "
                "then move to recommended insecticides if threshold crossed. 5) Remove damaged bolls and field residues."
            )
        if any(k in text for k in ["sugarcane"]):
            return (
                "SUGARCANE DISEASE/PEST PLAN: Focus on red rot, smut, wilt, early shoot borer and top borer. "
                "1) Use healthy seed setts and treat setts before planting. 2) Rogue and destroy infected clumps. "
                "3) Ensure drainage to avoid root diseases. 4) Apply recommended granules/sprays for borers at early stage. "
                "5) Keep field weed-free and avoid ratoon in heavily infected fields."
            )
        if any(k in text for k in ["grape", "mango", "guava", "citrus", "lemon", "orange", "strawberry", "pomegranate"]):
            return (
                "FRUIT CROP DISEASE PLAN: Common issues include anthracnose, powdery/downy mildew, canker, fruit fly and mites. "
                "1) Prune for airflow and remove infected twigs/fruits. 2) Use sanitation and bait traps (fruit fly). "
                "3) Spray sulfur/copper/fungicide based on symptom and crop label. "
                "4) Maintain irrigation balance - avoid stress and sudden fluctuations."
            )
        return (
            "DISEASE MANAGEMENT (GENERAL): Share crop name + symptom details (leaf color, spots, curl, wilt, stem/root changes) + field age. "
            "Immediate steps: remove infected parts, avoid evening overhead irrigation, improve airflow, and use label-recommended pesticide/fungicide only after confirming cause."
        )

    # Priority intents that can coexist with crop names in the same query.
    if _has_any_terms(text, ["post-harvest", "storage", "cold storage", "grading", "packaging", "value addition"]):
        return (
            "POST-HARVEST MANAGEMENT: 1) Harvest at proper maturity stage and cool produce quickly. "
            "2) Grade and sort to reduce market rejection. 3) Use clean, ventilated packaging. "
            "4) Store at crop-appropriate temperature/humidity. 5) Value addition (drying, pickling, processing) can improve income."
        )

    if _has_any_terms(text, ["market", "mandi", "msp", "price", "procurement", "farm gate"]):
        return (
            "FARM ECONOMICS & MARKETING: Track local mandi rates, MSP updates, and buyer demand before harvest. "
            "Stagger harvest when possible, grade produce for better pricing, and compare farm-gate vs mandi transport cost. "
            "Farmer Producer Organizations (FPOs) can improve bargaining and reduce input costs through bulk purchase."
        )

    if _has_any_terms(text, ["tractor", "sprayer", "drone", "harvester", "rotavator", "machinery"]):
        return (
            "FARM MACHINERY GUIDANCE: Choose machine size based on land area and crop type. "
            "Prioritize timely operations (sowing, weeding, spraying, harvesting) over over-sized equipment. "
            "Do preventive maintenance, calibrate sprayers before use, and follow safety gear rules. "
            "Check subsidy options under farm mechanization schemes."
        )

    if _has_any_terms(text, ["insurance", "loan", "kcc", "pm-kisan", "scheme", "subsidy", "fpo"]):
        return (
            "SCHEMES & FINANCE: Key support options include PM-KISAN, Kisan Credit Card (KCC), crop insurance, and state subsidies. "
            "Keep land/tenant records, Aadhaar, bank details, and crop-sown proof ready. "
            "Apply early before seasonal deadlines and verify status at CSC/KVK/agriculture office."
        )

    if _has_any_terms(text, ["dairy", "cow", "buffalo", "milk", "mastitis", "fodder", "silage"]):
        return (
            "DAIRY MANAGEMENT: 1) Balanced ration (green fodder + dry fodder + concentrate) based on milk yield. "
            "2) Clean water always available. 3) Maintain shed hygiene and dry bedding. 4) Vaccination/deworming schedule must be followed. "
            "5) For mastitis prevention: clean udder before/after milking and use teat dip. 6) Keep records of feed, milk, health and breeding."
        )

    if _has_any_terms(text, ["goat", "sheep", "poultry", "broiler", "layer", "hatchery"]):
        return (
            "SMALL LIVESTOCK/POULTRY: 1) Ensure clean housing with ventilation and dry litter. "
            "2) Follow age-wise feed schedule and clean drinking water. 3) Vaccination and biosecurity are critical. "
            "4) Isolate sick animals/birds immediately. 5) Maintain stocking density to reduce stress and disease outbreaks."
        )

    if _has_any_terms(text, ["fish", "aquaculture", "pond", "fingerlings", "aeration"]):
        return (
            "FISH FARMING: 1) Test pond water (pH 7-8.5, dissolved oxygen >5 mg/L). "
            "2) Stock healthy fingerlings at recommended density. 3) Feed based on biomass and water temperature. "
            "4) Use aeration in low-oxygen periods. 5) Monitor fish behavior daily and remove dead fish immediately."
        )

    if _has_any_terms(text, ["mushroom", "beekeeping", "apiary", "honey", "hydroponic", "greenhouse", "polyhouse"]):
        return (
            "PROTECTED/ALTERNATIVE FARMING: For mushroom, maintain clean substrate and strict humidity-temperature control. "
            "For beekeeping, keep colonies disease-free, avoid pesticide spray during bee activity, and ensure flowering forage. "
            "For hydroponic/polyhouse, monitor EC/pH daily, maintain ventilation, and sanitize tools to prevent rapid disease spread."
        )

    # Flower crops
    if _has_any_terms(text, ["marigold"]):
        return (
            "MARIGOLD CARE: Sow seeds in nursery, transplant after 4-5 weeks. Prefer well-drained soil with good sunlight. "
            "Water regularly, avoid waterlogging. Pinch terminal buds for bushier growth. Apply NPK (5:10:5) at establishment. "
            "Watch for spider mites in hot weather - spray neem oil if needed. Harvest flowers after full bloom daily for continuous flowering."
        )
    if _has_any_terms(text, ["rose", "jasmine", "chrysanthemum"]):
        return (
            "For ornamental flowers: ensure 6+ hours direct sunlight, well-drained soil with organic matter, "
            "regular watering without waterlogging. Pruning encourages branching and more blooms. Apply balanced fertilizer monthly. "
            "Common issues: spider mites, powdery mildew - treat with neem oil or sulfur spray. Keep soil mulched."
        )
    if _has_any_terms(text, ["flower", "bloom", "blossom"]):
        return (
            "Flower gardening tips: Most flowers need 6+ hours sunlight, well-drained soil rich in organic matter. "
            "Water early morning or evening. Apply NPK fertilizer monthly during growing season. Mulch around plants to retain moisture. "
            "Deadhead spent flowers to encourage more blooms. Monitor for pests weekly."
        )

    # Cereals & Millets
    if _has_any_terms(text, ["rice", "paddy"]):
        return (
            "RICE: Keep nursery healthy, transplant at 45-50 days at 20-25 cm spacing. Maintain 2-5 cm standing water after establishment. "
            "Apply 50% N before transplanting, 25% at tillering, 25% at panicle initiation. "
            "Monitor for blast and brown spot. Drain 1 week before harvest. Yield: 50-60 quintals/hectare."
        )
    if _has_any_terms(text, ["maize", "corn", "bajra", "millet"]):
        return (
            "PEARL MILLET/MAIZE: Sow at 60 cm × 15 cm spacing. Prefer well-drained soil. Apply 60 kg N, 40 kg P, 40 kg K/ha. "
            "First weeding at 3 weeks, second at 6 weeks. Water 3-4 times during season. Harvest at physiological maturity when grain moisture is 15-16%. "
            "Management: Rotate with legumes, monitor for stem borers."
        )
    if _has_any_terms(text, ["pulses", "dal", "lentil", "chickpea"]):
        return (
            "For pulses: prepare well-leveled field, drill seeds at 45 cm × 10 cm. No nitrogen needed (fix from atmosphere). "
            "Apply 40 kg P and 40 kg K/ha. Irrigate at flowering and pod formation. Weed twice manually. "
            "Harvest when pods turn brown. Yield: 15-20 quintals/ha for chickpea, 10-15 for lentil."
        )

    # Vegetables
    if _has_any_terms(text, ["tomato", "chilli", "pepper", "capsicum"]):
        return (
            "SOLANACEAE (Tomato/Chilli): Sow in nursery, transplant after 6-8 weeks at 60 × 45 cm. Prefer well-drained soil. "
            "Apply NPK (120:60:40). Stake/trellis for support. Irrigate regularly, mulch to retain moisture. "
            "Scout twice weekly for leaf spot, wilt, thrips. Remove infected leaves. Spray carbendazim + mancozeb for fungal diseases. Yield: 25-30 t/ha for tomato."
        )
    if _has_any_terms(text, ["potato", "onion", "garlic"]):
        return (
            "POTATO/ONION: Prepare well-drained field with good organic matter. For potato, plant tubers 25 cm apart, ridge 15 cm high. "
            "Apply 100:50:50 NPK. Earthing up at 45 days essential. For onion, transplant seedlings at 15 × 10 cm. "
            "Regular irrigation crucial. Monitor for late blight, leaf spot. Harvest potato at 90 days, onion when leaves dry."
        )
    if _has_any_terms(text, ["cucumber", "melon", "squash", "pumpkin"]):
        return (
            "Cucurbits: Prepare raised beds with 3 m × 1 m spacing. Sow 2-3 seeds per hill. Apply 40:60:40 NPK. "
            "Mulch between rows. Provide trellis support to save space. Irrigate every 3-4 days in summer. Watch for powdery mildew, leaf spots. "
            "Spray sulfur or neem oil preventively. Harvest at tender stage (except winter squash at maturity)."
        )
    if _has_any_terms(text, ["leafy", "spinach", "lettuce", "cabbage"]):
        return (
            "Leafy vegetables: Prepare field, broadcast or line sow seeds. Thin seedlings to proper spacing. "
            "Apply 60:40:40 NPK. Water regularly to keep soil moist. Harvest outer leaves for continuous production or entire plant at proper stage. "
            "Monitor for aphids, cutworms, caterpillars. Spray neem 2% w/w if needed. Grows in 30-45 days."
        )

    # Tree crops & fruits
    if any(k in text for k in ["apple"]):
        return (
            "APPLE: Plant at 5-6 m spacing in hills. Prefer cool climate (1500-2500 m altitude). Well-drained soil essential. "
            "Prune annually for shape and air circulation. Apply 40 kg FYM per tree annually. Calcium spray (1%) crucial for fruit quality. "
            "Watch for codling moth, powdery mildew. Thin fruits to 15 cm spacing. Production starts year 4-5, full yield year 8-10."
        )
    if any(k in text for k in ["mango"]):
        return (
            "MANGO: Plant at 10 m spacing in well-drained soil. High fertility needed. Apply 40 kg FYM + 1 kg N per tree annually. "
            "Pruning after harvest controls size and shapes tree. Flowering trigger: 4-6 weeks dry followed by irrigation. "
            "Thin fruits to 1 per panicle for quality. Watch for fungal diseases, hopper. Spray carbendazim for anthracnose. Bears from year 3-4."
        )
    if any(k in text for k in ["grape"]):
        return (
            "GRAPE: Trellising essential. Plant 1.5-2 m apart. Prune laterals leaving 2-3 buds. Heavy feeding required: 50 kg FYM + 1 kg N per vine/year. "
            "Bunch thinning for larger berries. Spray for powdery mildew: sulfur 1% w/w. Downy mildew: Bordeaux mixture. "
            "Irrigation critical during flowering, fruit development, and ripening. Harvest when berries soften."
        )
    if any(k in text for k in ["guava"]):
        return (
            "GUAVA: Hardy crop, grows well in poor soils. Plant at 6 m spacing. Prefer sandy loam, well-drained. "
            "Apply FYM 20-30 kg, N 0.5 kg per tree annually. Pruning shapes tree, removes dead wood. Twiggy growth (1-2 years) produces fruit. "
            "Watch for fruit fly, scale insects, wilt. High-density planting (5 × 4 m) increases yield. Bears from year 2-3. Yield: 40-50 t/ha."
        )
    if any(k in text for k in ["lemon", "orange", "citrus"]):
        return (
            "CITRUS: Well-drained soil crucial, avoid waterlogging. Plant at 5-6 m spacing. Apply 50 kg FYM + 1 kg N per tree year. "
            "Pruning for canopy shape and light penetration. Foliar spray: zinc sulfate + urea for deficiency. Watch for scale, leaf miner, gummosis. "
            "Bark scrape infected areas, apply fungicide. Bears from year 3-4. High-density (6 × 4 m) improves productivity."
        )
    if any(k in text for k in ["strawberry"]):
        return (
            "STRAWBERRY: Raised beds 15-20 cm high with drip irrigation. Plant in rows 30-40 cm apart in Oct-Nov. "
            "5-6 months season in North India. Apply 10 kg FYM, 40 kg N, 20 kg P, 30 kg K per 1000 m². "
            "Runners: remove for bigger fruits or propagate for new plants. Straw mulch prevents rot. Harvest every 2-3 days when fully red. "
            "Watch for gray mold in wet conditions."
        )
    if any(k in text for k in ["pomegranate", "pomagranate"]):
        return (
            "POMEGRANATE: Semi-arid crop, drought-tolerant. Plant at 4 m spacing. Prefer well-drained soil, neutral pH. "
            "Annual pruning maintains shape, removes deadwood. Apply 20 kg FYM + 0.5 kg N per plant yearly. "
            "Fruit splitting: ensure consistent moisture during fruit development. Spray zinc 0.5% for deficiency. Bears from year 3-4. Harvest when fully colored."
        )

    # Field crops
    if any(k in text for k in ["cotton"]):
        return (
            "COTTON: Sow at 30-45 kg/ha spacing 120 × 45 cm. Prefer well-drained deep soil. Apply 100-120 kg N, 60 kg P, 60 kg K/ha. "
            "First weeding at 30 days, second at 45 days. Top defoliation 15 days before harvest. Watch for bollworms, jassids, whiteflies. "
            "Spray carbofuran or cypermethrin for insect pests. Monitor nitrogen - balanced nutrition prevents boll rot. Harvest at full bloom."
        )
    if any(k in text for k in ["sugarcane"]):
        return (
            "SUGARCANE: Plant seed cane (2-3 buds) 30 cm deep, 90 cm apart. Apply 100-150 kg N, 60 kg P, 60 kg K/ha annually. "
            "Split doses of nitrogen crucial. Mulch with trash. Intercrop with legumes. Ratoon management: 2-3 ratoons possible. "
            "Watch for shoot borers, top borers - spray carbofuran at bud break and 45 days later. Harvest at 12 months when sugar accumulation peaks."
        )
    if any(k in text for k in ["oilseed", "groundnut", "sunflower", "mustard"]):
        return (
            "OILSEEDS: Prepare fine seedbed, sow at recommended spacing (groundnut 30 × 10 cm, sunflower 60 × 20 cm). "
            "Apply 20:40:20 NPK. Provide support for groundnut if needed. Regular weeding crucial. Harvest groundnut at 110-120 days (pods fully matured), "
            "sunflower when seeds hard and head droops. Low moisture content essential for storage."
        )

    # Soil & nutrients
    if any(k in text for k in ["soil", "test", "analysis"]):
        return (
            "SOIL TESTING: Conduct soil test before planting to know NPK, pH, and micronutrient status. "
            "Collect samples from 5-6 spots, mix well, air-dry, send to lab. Based on test, apply targeted fertilizer. "
            "Build soil health: add 5 tons FYM/ha, practice crop rotation (include legumes), avoid mono-cropping. "
            "Organic matter >2% and pH 6.5-7.5 ideal for most crops."
        )
    if any(k in text for k in ["fertilizer", "npk", "nutrient", "urea", "compost", "dap"]):
        return (
            "FERTILIZER PLAN: Use soil-test based prescription. Apply phosphorus and potassium as basal dose. "
            "Split nitrogen: 40% at planting, 30% at tillering/vegetative, 30% at flowering/reproductive. "
            "Avoid over-use of urea - leads to lodging and pest susceptibility. Balance with organic matter (FYM 5 t/ha) for better soil health. "
            "Micronutrients (Zn, B, Mo) important - foliar spray if deficiency symptoms appear."
        )
    if any(k in text for k in ["water", "irrigation", "drip", "flood", "rainfed", "rainwater"]):
        return (
            "IRRIGATION MANAGEMENT:\n"
            "• DRIP IRRIGATION: Most efficient (95% water use efficiency). For vegetables, fruit trees, spices. Saves 30-50% water vs flood, reduces diseases.\n"
            "• SPRINKLER: Good for rice, wheat, pulses. Covers large areas. Avoid evening sprinkles (promotes fungal diseases).\n"
            "• FLOOD/BORDER: Traditional for rice, sugarcane. 40-50% water loss.\n"
            "• CRITICAL STAGES: Germination, vegetative, flowering, pod/fruit formation - water more during these.\n"
            "• SCHEDULE: Morning irrigation (5-8am) best - less evaporation, less disease. Avoid evening.\n"
            "• SOIL MOISTURE: Keep 60-80% of field capacity. Check by squeezing soil - if it forms ball but crumbles, good.\n"
            "• WATERLOGGING SIGNS: Purple leaves, musty smell, wilting despite moist soil - indicates poor drainage. Add drains, elevate beds.\n"
            "• WATER SCHEDULE BY CROP: Rice (flooded), Sugarcane (4-5 irrigation/year), Wheat (3-4), Fruits (weekly), Vegetables (2-3 times/week).\n"
            "• WATER CONSERVATION: Mulch (reduces evaporation 30%), drip irrigation, rain-fed varieties, check soil before watering.\n"
            "• PROBLEM SOLVING: Brown/yellow leaves = underwatering or nutrient issue. Soft rot = overwatering. Adjust accordingly."
        )

    if any(k in text for k in ["dairy", "cow", "buffalo", "milk", "mastitis", "fodder", "silage"]):
        return (
            "DAIRY MANAGEMENT: 1) Balanced ration (green fodder + dry fodder + concentrate) based on milk yield. "
            "2) Clean water always available. 3) Maintain shed hygiene and dry bedding. 4) Vaccination/deworming schedule must be followed. "
            "5) For mastitis prevention: clean udder before/after milking and use teat dip. 6) Keep records of feed, milk, health and breeding."
        )

    if any(k in text for k in ["goat", "sheep", "poultry", "broiler", "layer", "hatchery"]):
        return (
            "SMALL LIVESTOCK/POULTRY: 1) Ensure clean housing with ventilation and dry litter. "
            "2) Follow age-wise feed schedule and clean drinking water. 3) Vaccination and biosecurity are critical. "
            "4) Isolate sick animals/birds immediately. 5) Maintain stocking density to reduce stress and disease outbreaks."
        )

    if any(k in text for k in ["fish", "aquaculture", "pond", "fingerlings", "aeration"]):
        return (
            "FISH FARMING: 1) Test pond water (pH 7-8.5, dissolved oxygen >5 mg/L). "
            "2) Stock healthy fingerlings at recommended density. 3) Feed based on biomass and water temperature. "
            "4) Use aeration in low-oxygen periods. 5) Monitor fish behavior daily and remove dead fish immediately."
        )

    if any(k in text for k in ["mushroom", "beekeeping", "apiary", "honey", "hydroponic", "greenhouse", "polyhouse"]):
        return (
            "PROTECTED/ALTERNATIVE FARMING: For mushroom, maintain clean substrate and strict humidity-temperature control. "
            "For beekeeping, keep colonies disease-free, avoid pesticide spray during bee activity, and ensure flowering forage. "
            "For hydroponic/polyhouse, monitor EC/pH daily, maintain ventilation, and sanitize tools to prevent rapid disease spread."
        )

    if any(k in text for k in ["post-harvest", "storage", "cold storage", "grading", "packaging", "value addition"]):
        return (
            "POST-HARVEST MANAGEMENT: 1) Harvest at proper maturity stage and cool produce quickly. "
            "2) Grade and sort to reduce market rejection. 3) Use clean, ventilated packaging. "
            "4) Store at crop-appropriate temperature/humidity. 5) Value addition (drying, pickling, processing) can improve income."
        )

    if any(k in text for k in ["market", "mandi", "msp", "price", "procurement", "farm gate"]):
        return (
            "FARM ECONOMICS & MARKETING: Track local mandi rates, MSP updates, and buyer demand before harvest. "
            "Stagger harvest when possible, grade produce for better pricing, and compare farm-gate vs mandi transport cost. "
            "Farmer Producer Organizations (FPOs) can improve bargaining and reduce input costs through bulk purchase."
        )

    if any(k in text for k in ["tractor", "sprayer", "drone", "harvester", "rotavator", "machinery"]):
        return (
            "FARM MACHINERY GUIDANCE: Choose machine size based on land area and crop type. "
            "Prioritize timely operations (sowing, weeding, spraying, harvesting) over over-sized equipment. "
            "Do preventive maintenance, calibrate sprayers before use, and follow safety gear rules. "
            "Check subsidy options under farm mechanization schemes."
        )

    if any(k in text for k in ["insurance", "loan", "kcc", "pm-kisan", "scheme", "subsidy", "fpo"]):
        return (
            "SCHEMES & FINANCE: Key support options include PM-KISAN, Kisan Credit Card (KCC), crop insurance, and state subsidies. "
            "Keep land/tenant records, Aadhaar, bank details, and crop-sown proof ready. "
            "Apply early before seasonal deadlines and verify status at CSC/KVK/agriculture office."
        )

    if any(k in text for k in ["pest", "disease", "insect", "spray", "fungal", "bacterial"]):
        return (
            "PEST & DISEASE MANAGEMENT: First step - field sanitation (remove infected leaves/plants). "
            "Use resistant varieties where available. Spray only when pest/disease threshold reached (not preventive sprays). "
            "Fungal diseases: Bordeaux mixture 1%, carbendazim 0.1%, sulfur 1% w/w. Bacterial: copper fungicide. Insects: neem 2%, spinosad, pyrethroids. "
            "Always follow label dose and safety period. Rotate chemicals to prevent resistance."
        )

    # Seasonal & general
    if any(k in text for k in ["season", "weather", "monsoon", "frost", "heat"]):
        return (
            "SEASONAL FARMING: Monsoon crops (June-Sept): rice, maize, pulses, oilseeds, cotton. "
            "Post-monsoon/winter (Oct-Feb): wheat, chickpea, potato, onion, mustard, leafy vegetables. "
            "Summer crops (March-May): groundnut, sesame, watermelon, muskmelon. Plan crop calendar by your location's rainfall pattern. "
            "Guard against frost in winter, heat stress in summer with mulch, irrigation, shade nets as needed."
        )
    if any(k in text for k in ["extension", "advisory", "farmer", "scheme", "govt"]):
        return (
            "FARMING SUPPORT: Contact your nearest: (1) Krishi Vigyan Kendra (KVK), (2) Agricultural university extension office, "
            "(3) ATMA (Agricultural Technology Management Agency), (4) Farmer producer organizations. "
            "Government schemes: PM-AGROTECH, NMOOP (for organic), SMAM (subsidized farm machinery). Check eligibility at agriculture.gov.in. "
            "Free advisory services available for pest identification, soil testing, crop planning."
        )

    # Default helpful response
    return (
        "I can help with: crop selection, soil preparation, fertilizer planning, irrigation, pest/disease management, seasonal farming tips. "
        "Share details - crop name, location, soil type, current issue (with symptoms) - and I'll give practical step-by-step guidance. "
        "If AI response unavailable, using offline farming knowledge base."
    )

@app.route('/chat', methods=['POST'])
def chat():
    """AI Farming Assistant chatbot endpoint - Agriculture queries ONLY"""
    try:
        data = request.get_json() or {}
        message = str(data.get("message", "")).strip()
        history = data.get("history", [])
        
        if not message:
            return jsonify({"error": "Message is required"}), 400

        context_message = _build_contextual_message(message, history)

        # Query classification
        if not _is_agriculture_related(context_message):
            if _is_non_agriculture_related(message):
                rejection_reply = (
                    "This chatbot is dedicated to agriculture and farming only. "
                    "I can help with crops, irrigation, fertilizer, soil health, and pest or disease management. "
                    "Please ask a farming-related question."
                )
                logging.info(f"Rejected non-agriculture query: {message}")
                return jsonify({"reply": rejection_reply, "mode": "blocked", "blocked": True})

            # Ambiguous query: guide user instead of hard-blocking.
            clarify_reply = (
                "I can definitely help with farming. Please share crop name, location, and your exact issue "
                "(for example: 'tomato leaf curl in Coimbatore' or 'drip irrigation schedule for cotton')."
            )
            logging.info(f"Asked user to clarify agriculture context: {message}")
            return jsonify({"reply": clarify_reply, "mode": "clarify", "blocked": False})

        ai_messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert farming and agriculture assistant specializing in Indian farming practices. "
                    "Only answer agriculture and farming-related questions. "
                    "Provide practical and concise step-by-step guidance."
                ),
            }
        ]

        if isinstance(history, list):
            for item in history[-8:]:
                if not isinstance(item, dict):
                    continue
                role = item.get("role")
                text = str(item.get("text", "")).strip()
                if role in ("user", "assistant") and text:
                    ai_messages.append({"role": role, "content": text})

        ai_messages.append({"role": "user", "content": context_message})

        # Prefer DeepSeek if available (for agriculture questions only)
        if deepseek_client:
            try:
                completion = deepseek_client.chat.completions.create(
                    model="deepseek-chat",
                    messages=ai_messages,
                    max_tokens=500,
                    temperature=0.7
                )
                
                reply = completion.choices[0].message.content
                return jsonify({"reply": reply, "provider": "DeepSeek", "mode": "ai"})
            except Exception as deepseek_error:
                logging.warning(f"DeepSeek API failed: {deepseek_error}. Falling back to offline mode.")
                # Fall through to fallback mode
        
        # Try OpenAI only if explicitly configured and working
        if openai_client and not deepseek_client:
            try:
                completion = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=ai_messages,
                    max_tokens=500,
                    temperature=0.7,
                    timeout=10
                )
                
                reply = completion.choices[0].message.content
                return jsonify({"reply": reply, "provider": "OpenAI", "mode": "ai"})
            except Exception as openai_error:
                logging.warning(f"OpenAI API failed: {openai_error}. Falling back to offline mode.")
                # Fall through to fallback mode
        
        # Fallback mode - always available offline response (only for agriculture)
        logging.info("Using fallback response mode for chat")
        reply = _fallback_farming_reply(context_message)
        return jsonify({"reply": reply, "mode": "fallback", "provider": "Offline"})
        
    except Exception as error:
        logging.error(f"Chat endpoint error: {error}", exc_info=True)
        # Even if something goes wrong, try to give a helpful fallback response
        try:
            fallback_reply = _fallback_farming_reply(data.get("message", "") if 'data' in locals() else "")
            return jsonify({"reply": fallback_reply, "mode": "fallback_emergency"})
        except:
            return jsonify({"error": "Error processing chat request", "reply": "Please try again later."}), 500

@app.route('/crop-list', methods=['GET'])
def crop_list():
    """Return list of crops for UI autocomplete"""
    try:
        if CROP_LIST_DATA:
            return jsonify(CROP_LIST_DATA)
        return jsonify({"crops": []})
    except Exception as e:
        logging.error(f"Crop list error: {e}")
        return jsonify({"error": "Failed to load crop list"}), 500

@app.route('/predictions', methods=['GET', 'DELETE', 'OPTIONS'])
def predictions():
    """Get or delete user predictions"""
    if request.method == 'OPTIONS':
        return '', 204
    
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    
    try:
        conn = get_db_connection()
        if request.method == 'GET':
            rows = conn.execute("SELECT * FROM predictions WHERE user_id = ? ORDER BY date DESC", (user_id,)).fetchall()
            results = [dict(row) for row in rows]
            conn.close()
            return jsonify(results)
        elif request.method == 'DELETE':
            conn.execute("DELETE FROM predictions WHERE user_id = ?", (user_id,))
            conn.commit()
            conn.close()
            return jsonify({"message": "Predictions deleted"})
    except Exception as e:
        logging.error(f"Predictions error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/last-prediction', methods=['GET'])
def last_prediction():
    """Get last prediction for current user"""
    try:
        # This would typically use auth context, for now return empty
        return jsonify({"message": "No predictions yet"})
    except Exception as e:
        logging.error(f"Last prediction error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/tts', methods=['GET', 'POST'])
def text_to_speech():
    """Generate MP3 speech for the given text using gTTS."""
    try:
        if not GTTS_AVAILABLE:
            return jsonify({"error": "gTTS is not installed on the backend"}), 500

        payload = request.get_json(silent=True) or {}
        text = (request.args.get('text') or payload.get('text') or '').strip()
        if not text:
            return jsonify({"error": "Missing text"}), 400

        lang = normalize_tts_language(request.args.get('lang') or payload.get('lang'))
        if len(text) > 2000:
            text = text[:2000]

        audio_buffer = io.BytesIO()
        try:
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.write_to_fp(audio_buffer)
        except gTTSError as e:
            logging.error(f"gTTS upstream error: {e}", exc_info=True)
            return jsonify({"error": "Text-to-speech service is temporarily unavailable. Please try again."}), 503

        audio_buffer.seek(0)

        return send_file(
            audio_buffer,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name='speech.mp3'
        )
    except Exception as e:
        logging.error(f"TTS generation error: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Basic landing endpoint for quick server verification."""
    return jsonify({
        "message": "Smart Uzhavan backend is running",
        "endpoints": [
            "/health",
            "/chat",
            "/predict-disease",
            "/recommend-crop",
            "/crop-list",
            "/predictions",
            "/tts"
        ]
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "base_dir": BASE_DIR})

if __name__ == '__main__':
    logging.info(f"gTTS available: {GTTS_AVAILABLE}")
    load_static_data()
    load_model()
    
    try:
        if os.path.exists(CROP_MODEL_PATH):
            crop_model = joblib.load(CROP_MODEL_PATH)
            logging.info(f"Crop model loaded from {CROP_MODEL_PATH}")
        else:
            logging.warning(f"Crop model not found at {CROP_MODEL_PATH}")
            
        if os.path.exists(CROP_SCALER_PATH):
            crop_scaler = joblib.load(CROP_SCALER_PATH)
            logging.info(f"Crop scaler loaded from {CROP_SCALER_PATH}")
        else:
            logging.warning(f"Crop scaler not found at {CROP_SCALER_PATH}")
            
        if os.path.exists(CROP_LABEL_ENCODER_PATH):
            crop_label_encoder = joblib.load(CROP_LABEL_ENCODER_PATH)
            logging.info(f"Crop label encoder loaded from {CROP_LABEL_ENCODER_PATH}")
        else:
            logging.warning(f"Crop label encoder not found at {CROP_LABEL_ENCODER_PATH}")
    except Exception as e:
        logging.error(f"Crop ML load failed: {e}", exc_info=True)

    backend_host = os.getenv('BACKEND_HOST', '0.0.0.0')
    backend_port = int(os.getenv('BACKEND_PORT', '5000'))
    debug_mode = os.getenv('BACKEND_DEBUG', 'true').lower() == 'true'
    app.run(host=backend_host, port=backend_port, debug=debug_mode, use_reloader=False)