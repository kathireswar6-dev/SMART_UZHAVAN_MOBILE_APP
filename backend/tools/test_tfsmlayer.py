# Test TFSMLayer wrapping for a SavedModel directory.
# Run inside the backend venv. Set CHECK_MODEL_PATH env var to override.
# Example (PowerShell):
#   $env:CHECK_MODEL_PATH='K:\Project\New_Training_Results\Models\final_model_saved'
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
#   .\venv\Scripts\Activate.ps1
#   python .\tools\test_tfsmlayer.py
import os, sys, traceback
try:
    import tensorflow as tf
except Exception as e:
    print('Failed to import TensorFlow:', e)
    sys.exit(2)

path = os.environ.get('CHECK_MODEL_PATH') or os.environ.get('DISEASE_MODEL_PATH') or r"K:\Project\New_Training_Results\Models\final_model_saved"
path = os.path.abspath(path)
print('Testing TFSMLayer wrap for:', path)
print('Exists:', os.path.exists(path))

try:
    print('Attempting to create TFSMLayer...')
    try:
        layer = tf.keras.layers.TFSMLayer(path, call_endpoint='serving_default')
    except Exception as e:
        print('TFSMLayer init with call_endpoint failed, trying default constructor...')
        layer = tf.keras.layers.TFSMLayer(path)

    print('Creating Keras Input and calling layer...')
    inp = tf.keras.Input(shape=(224,224,3))
    out = layer(inp)
    model = tf.keras.Model(inputs=inp, outputs=out)
    print('TFSMLayer wrap succeeded. Model summary:')
    try:
        model.summary()
    except Exception as e:
        print('Model summary failed:', e)
    # Try a tiny predict pass
    import numpy as np
    test = np.zeros((1,224,224,3), dtype=np.float32)
    try:
        preds = model.predict(test)
        print('Predict call succeeded. Output type/shape:', type(preds), getattr(preds, 'shape', None))
    except Exception as e:
        print('Predict failed:')
        traceback.print_exc()
except Exception as e:
    print('TFSMLayer wrap failed with exception:')
    traceback.print_exc()

print('Done')
