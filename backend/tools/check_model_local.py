"""
Simple diagnostic script to test loading the model at DISEASE_MODEL_PATH.
Run inside your backend venv:

cd K:\MyProject\crop-disease-app\backend
venv\Scripts\activate.bat   (or Activate.ps1 in PowerShell)
python tools\check_model_local.py

This will try tf.saved_model.load and tf.keras.models.load_model and print signatures and a small inference test.
"""
import os, sys, json, traceback
try:
    import tensorflow as tf
    import numpy as np
except Exception as e:
    print("ERROR: Failed to import TensorFlow — ensure your venv has the correct TF version installed:", e)
    sys.exit(2)

# If you want to override the path at runtime, set env var CHECK_MODEL_PATH
DEFAULT = os.path.join(os.path.dirname(__file__), '..', 'Models', 'high_accuracy_model.keras')
DISEASE_MODEL_PATH = os.environ.get('CHECK_MODEL_PATH') or os.environ.get('DISEASE_MODEL_PATH') or DEFAULT
DISEASE_MODEL_PATH = os.path.abspath(DISEASE_MODEL_PATH)

print("Checking model path:", DISEASE_MODEL_PATH)
print("Exists:", os.path.exists(DISEASE_MODEL_PATH))
if os.path.exists(DISEASE_MODEL_PATH):
    print("Directory listing (first 50 entries):")
    try:
        for i, name in enumerate(sorted(os.listdir(DISEASE_MODEL_PATH))):
            if i >= 50:
                break
            print(" -", name)
    except Exception as e:
        print("Failed listing:", e)

# Try tf.saved_model.load()
print('\nAttempting tf.saved_model.load()...')
try:
    sm = tf.saved_model.load(DISEASE_MODEL_PATH)
    print('tf.saved_model.load() succeeded. Object type:', type(sm))
    sigs = getattr(sm, 'signatures', None)
    print('signatures:', repr(sigs))
    if sigs:
        try:
            if 'serving_default' in sigs:
                print('serving_default found. Signature repr:')
                print(sigs['serving_default'])
                # Try calling with a dummy input if signature expects an image tensor
                test = np.zeros((1,224,224,3), dtype=np.float32)
                try:
                    out = sigs['serving_default'](tf.constant(test, dtype=tf.float32))
                    print('Call succeeded. Output type:', type(out))
                    # If dict-like, print keys and shapes
                    if isinstance(out, dict):
                        for k,v in out.items():
                            try:
                                print(' -', k, getattr(v, 'shape', type(v)))
                            except: print(' -', k, '->', type(v))
                    else:
                        try: print(' - result shape:', out.shape)
                        except: print(' - result type repr:', repr(out))
                except Exception as e:
                    print('serving_default call failed:', e)
        except Exception as e:
            print('Error inspecting signatures:', e)
except Exception as e:
    print('tf.saved_model.load() failed:')
    traceback.print_exc()

# Try tf.keras.models.load_model()
print('\nAttempting tf.keras.models.load_model()...')
try:
    km = tf.keras.models.load_model(DISEASE_MODEL_PATH)
    print('tf.keras.models.load_model() succeeded. Keras model summary:')
    try:
        km.summary()
    except Exception:
        print(' (summary unavailable)')
    # Try a small predict
    try:
        test = np.zeros((1,224,224,3), dtype=np.float32)
        preds = km.predict(test)
        print('predict() succeeded. output shape/type:', type(preds), getattr(preds, 'shape', None))
    except Exception as e:
        print('predict() failed:', e)
except Exception as e:
    print('tf.keras.models.load_model() failed:')
    traceback.print_exc()

print('\nDone. If both loaders failed, please paste the above tracebacks here.')