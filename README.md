# AI Psychology Expert with Coqui TTS

A comprehensive AI psychology expert application with advanced text-to-speech capabilities using Coqui TTS. This application provides a virtual therapy session experience with realistic voice synthesis and voice cloning features.

## Features

### 🎯 Core Features
- **AI Psychology Expert**: Virtual therapist with specialized psychology knowledge
- **Video Call Interface**: Simulated video call experience with AI expert
- **Real-time Chat**: Interactive conversation with AI responses
- **Session Management**: Start/stop therapy sessions with timer

### 🎤 Advanced TTS Features
- **Coqui TTS Integration**: High-quality text-to-speech using state-of-the-art models
- **Multiple Voice Styles**: Professional, Warm, and Calm voice personalities
- **Voice Cloning**: Clone any voice from audio samples using XTTS v2
- **Audio Queue Management**: Smooth audio playback with queuing system
- **Fallback Support**: Browser speech synthesis when TTS server unavailable

### 🤖 AI Replica Management
- **Tavus Integration**: Create AI video replicas for enhanced experience
- **Voice Cloning**: Test voice cloning with uploaded audio files
- **Replica Training**: Monitor training status of AI replicas

## Technology Stack

### Frontend
- **HTML5/CSS3**: Modern responsive interface
- **JavaScript (ES6+)**: Interactive functionality
- **Bootstrap 5**: UI framework
- **Font Awesome**: Icons

### Backend
- **Python 3.8+**: Server-side processing
- **Flask**: Web framework
- **Coqui TTS**: Text-to-speech engine
- **PyTorch**: Deep learning framework

### TTS Models
- **Tacotron2-DDC**: Professional voice synthesis
- **VITS**: Multi-speaker voice synthesis
- **Glow-TTS**: Fast and high-quality synthesis
- **XTTS v2**: Advanced voice cloning

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js (optional, for development)
- Modern web browser with audio support

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PSY
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the TTS server**
   ```bash
   python tts_server.py
   ```
   The server will start on `http://localhost:5000`

4. **Open the application**
   - Open `index.html` in your web browser
   - Or serve it using a local server:
     ```bash
     python -m http.server 8000
     ```
     Then visit `http://localhost:8000`

## Usage

### Starting a Session
1. Click "Start Session" to begin a therapy session
2. Allow camera and microphone access when prompted
3. The AI expert will greet you and begin the session

### TTS Controls
- **Enable/Disable TTS**: Toggle text-to-speech functionality
- **Voice Styles**: Choose between Professional, Warm, or Calm voice
- **Voice Cloning**: Upload audio to clone a specific voice

### Voice Cloning
1. Upload an audio file (WAV, MP3, etc.)
2. Click "Test Voice Clone" to generate speech in the cloned voice
3. The system will play back the cloned voice for verification

### AI Replicas
1. Click "Create New Replica" to create an AI video replica
2. Provide training video URL and replica name
3. Monitor training progress in the replica list

## API Endpoints

### TTS Server (`http://localhost:5000`)

#### Health Check
```
GET /health
```

#### List TTS Models
```
GET /api/tts/models
```

#### Synthesize Speech
```
POST /api/tts/synthesize
Content-Type: application/json

{
    "text": "Hello world",
    "model_name": "tts_models/en/ljspeech/tacotron2-DDC",
    "language": "en"
}
```

#### Psychology Response TTS
```
POST /api/tts/psychology-response
Content-Type: application/json

{
    "text": "How are you feeling today?",
    "voice_style": "professional"
}
```

#### Voice Cloning
```
POST /api/tts/voice-clone
Content-Type: multipart/form-data

audio_file: [audio file]
text: "Hello, this is a voice cloning test"
```

## Configuration

### Voice Styles
The application supports three voice styles:
- **Professional**: Tacotron2-DDC model - Clear, authoritative voice
- **Warm**: VITS model - Friendly, approachable voice
- **Calm**: Glow-TTS model - Soothing, therapeutic voice

### TTS Models
Available TTS models can be configured in `tts_server.py`:
```python
self.available_models = [
    "tts_models/en/ljspeech/tacotron2-DDC",
    "tts_models/en/ljspeech/glow-tts",
    "tts_models/en/ljspeech/fast_pitch",
    "tts_models/en/vctk/vits",
    "tts_models/multilingual/multi-dataset/xtts_v2",
    "tts_models/en/ljspeech/your_tts"
]
```

## Troubleshooting

### TTS Server Issues
- **Port already in use**: Change port in `tts_server.py`
- **Model loading errors**: Check internet connection for model downloads
- **Memory issues**: Use smaller models or increase system memory

### Browser Issues
- **Audio not playing**: Check browser audio permissions
- **CORS errors**: Ensure TTS server is running on correct port
- **File upload issues**: Check file format and size limits

### Performance Optimization
- **Slow TTS**: Use faster models like Glow-TTS
- **High memory usage**: Limit concurrent TTS requests
- **Audio quality**: Adjust model parameters for balance

## Development

### Adding New Voice Styles
1. Add model mapping in `tts_server.py`
2. Update frontend voice style buttons
3. Test with different text samples

### Custom TTS Models
1. Place custom models in appropriate directory
2. Update model list in TTSService class
3. Test model compatibility

### Frontend Customization
- Modify `styles.css` for UI changes
- Update `script.js` for functionality changes
- Customize `index.html` for layout changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Coqui TTS](https://github.com/coqui-ai/TTS) - Advanced text-to-speech toolkit
- [Tavus](https://tavus.com) - AI video replica platform
- [Bootstrap](https://getbootstrap.com) - UI framework
- [Font Awesome](https://fontawesome.com) - Icons

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

---

**Note**: This application is for educational and demonstration purposes. It is not intended to replace professional psychological therapy. 