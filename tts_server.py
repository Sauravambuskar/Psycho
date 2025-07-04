from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from TTS.api import TTS
import os
import tempfile
import uuid
import json
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global TTS instance
tts_models = {}
current_model = None

class TTSService:
    def __init__(self):
        self.models = {}
        self.current_model = None
        self.available_models = [
            "tts_models/en/ljspeech/tacotron2-DDC",
            "tts_models/en/ljspeech/glow-tts",
            "tts_models/en/ljspeech/fast_pitch",
            "tts_models/en/vctk/vits",
            "tts_models/multilingual/multi-dataset/xtts_v2",
            "tts_models/en/ljspeech/your_tts"
        ]
        
    def initialize_model(self, model_name=None):
        """Initialize TTS model"""
        try:
            if model_name is None:
                model_name = "tts_models/en/ljspeech/tacotron2-DDC"
            
            if model_name not in self.models:
                logger.info(f"Loading TTS model: {model_name}")
                self.models[model_name] = TTS(model_name)
                logger.info(f"Model {model_name} loaded successfully")
            
            self.current_model = model_name
            return True
        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            return False
    
    def list_models(self):
        """List available TTS models"""
        try:
            return TTS().list_models()
        except Exception as e:
            logger.error(f"Error listing models: {str(e)}")
            return []
    
    def synthesize_speech(self, text, model_name=None, speaker_wav=None, language="en"):
        """Synthesize speech from text"""
        try:
            if model_name and model_name not in self.models:
                if not self.initialize_model(model_name):
                    return None
            
            model = self.models.get(model_name, self.models.get(self.current_model))
            if not model:
                if not self.initialize_model():
                    return None
                model = self.models[self.current_model]
            
            # Create temporary file for audio output
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_file.close()
            
            # Generate speech
            if speaker_wav and os.path.exists(speaker_wav):
                # Voice cloning mode
                model.tts_to_file(
                    text=text,
                    speaker_wav=speaker_wav,
                    language=language,
                    file_path=temp_file.name
                )
            else:
                # Standard TTS mode
                model.tts_to_file(
                    text=text,
                    file_path=temp_file.name
                )
            
            return temp_file.name
            
        except Exception as e:
            logger.error(f"Error synthesizing speech: {str(e)}")
            return None

# Initialize TTS service
tts_service = TTSService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'tts_models_loaded': len(tts_service.models)
    })

@app.route('/api/tts/models', methods=['GET'])
def get_models():
    """Get available TTS models"""
    try:
        models = tts_service.list_models()
        return jsonify({
            'success': True,
            'models': models,
            'current_model': tts_service.current_model
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/tts/synthesize', methods=['POST'])
def synthesize_speech():
    """Synthesize speech from text"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        model_name = data.get('model_name')
        speaker_wav = data.get('speaker_wav')
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        # Generate speech
        audio_file = tts_service.synthesize_speech(
            text=text,
            model_name=model_name,
            speaker_wav=speaker_wav,
            language=language
        )
        
        if audio_file and os.path.exists(audio_file):
            return send_file(
                audio_file,
                mimetype='audio/wav',
                as_attachment=True,
                download_name=f'speech_{uuid.uuid4().hex[:8]}.wav'
            )
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate speech'
            }), 500
            
    except Exception as e:
        logger.error(f"Error in synthesize endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/tts/initialize', methods=['POST'])
def initialize_model():
    """Initialize a specific TTS model"""
    try:
        data = request.get_json()
        model_name = data.get('model_name')
        
        success = tts_service.initialize_model(model_name)
        
        return jsonify({
            'success': success,
            'model_name': model_name if success else None,
            'message': 'Model initialized successfully' if success else 'Failed to initialize model'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/tts/psychology-response', methods=['POST'])
def psychology_tts():
    """Generate TTS for psychology expert responses"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        voice_style = data.get('voice_style', 'professional')  # professional, warm, calm
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'Text is required'
            }), 400
        
        # Choose model based on voice style
        model_mapping = {
            'professional': 'tts_models/en/ljspeech/tacotron2-DDC',
            'warm': 'tts_models/en/vctk/vits',
            'calm': 'tts_models/en/ljspeech/glow-tts'
        }
        
        model_name = model_mapping.get(voice_style, 'tts_models/en/ljspeech/tacotron2-DDC')
        
        # Generate speech
        audio_file = tts_service.synthesize_speech(
            text=text,
            model_name=model_name
        )
        
        if audio_file and os.path.exists(audio_file):
            return send_file(
                audio_file,
                mimetype='audio/wav',
                as_attachment=True,
                download_name=f'psychology_response_{uuid.uuid4().hex[:8]}.wav'
            )
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate psychology response speech'
            }), 500
            
    except Exception as e:
        logger.error(f"Error in psychology TTS endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/tts/voice-clone', methods=['POST'])
def voice_clone():
    """Clone voice from reference audio"""
    try:
        # Check if file was uploaded
        if 'audio_file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No audio file provided'
            }), 400
        
        audio_file = request.files['audio_file']
        text = request.form.get('text', 'Hello, this is a voice cloning test.')
        
        if audio_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No audio file selected'
            }), 400
        
        # Save uploaded file temporarily
        temp_upload = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        audio_file.save(temp_upload.name)
        temp_upload.close()
        
        # Use XTTS v2 for voice cloning
        audio_file_path = tts_service.synthesize_speech(
            text=text,
            model_name="tts_models/multilingual/multi-dataset/xtts_v2",
            speaker_wav=temp_upload.name,
            language="en"
        )
        
        # Clean up uploaded file
        os.unlink(temp_upload.name)
        
        if audio_file_path and os.path.exists(audio_file_path):
            return send_file(
                audio_file_path,
                mimetype='audio/wav',
                as_attachment=True,
                download_name=f'cloned_voice_{uuid.uuid4().hex[:8]}.wav'
            )
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to clone voice'
            }), 500
            
    except Exception as e:
        logger.error(f"Error in voice clone endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Initialize default model on startup
    logger.info("Initializing TTS service...")
    tts_service.initialize_model()
    
    # Create uploads directory if it doesn't exist
    os.makedirs('uploads', exist_ok=True)
    
    logger.info("TTS server starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True) 