#!/usr/bin/env python3
"""
Startup script for AI Psychology Expert with Coqui TTS
This script starts both the TTS server and serves the frontend files.
"""

import os
import sys
import subprocess
import time
import threading
import webbrowser
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import TTS
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def start_tts_server():
    """Start the TTS server"""
    print("🚀 Starting TTS server...")
    try:
        # Start TTS server in a subprocess
        tts_process = subprocess.Popen([
            sys.executable, "tts_server.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Check if server is running
        if tts_process.poll() is None:
            print("✅ TTS server started successfully on http://localhost:5000")
            return tts_process
        else:
            stdout, stderr = tts_process.communicate()
            print(f"❌ TTS server failed to start:")
            print(stderr.decode())
            return None
    except Exception as e:
        print(f"❌ Error starting TTS server: {e}")
        return None

def start_frontend_server():
    """Start the frontend server"""
    print("🌐 Starting frontend server...")
    try:
        # Start HTTP server in a subprocess
        frontend_process = subprocess.Popen([
            sys.executable, "-m", "http.server", "8000"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait a moment for server to start
        time.sleep(2)
        
        # Check if server is running
        if frontend_process.poll() is None:
            print("✅ Frontend server started successfully on http://localhost:8000")
            return frontend_process
        else:
            stdout, stderr = frontend_process.communicate()
            print(f"❌ Frontend server failed to start:")
            print(stderr.decode())
            return None
    except Exception as e:
        print(f"❌ Error starting frontend server: {e}")
        return None

def open_browser():
    """Open the application in the default browser"""
    print("🌍 Opening application in browser...")
    time.sleep(3)  # Wait for servers to be ready
    try:
        webbrowser.open("http://localhost:8000")
        print("✅ Browser opened successfully")
    except Exception as e:
        print(f"⚠️  Could not open browser automatically: {e}")
        print("Please manually open: http://localhost:8000")

def monitor_servers(tts_process, frontend_process):
    """Monitor server processes and handle shutdown"""
    try:
        while True:
            # Check if TTS server is still running
            if tts_process and tts_process.poll() is not None:
                print("❌ TTS server stopped unexpectedly")
                break
            
            # Check if frontend server is still running
            if frontend_process and frontend_process.poll() is not None:
                print("❌ Frontend server stopped unexpectedly")
                break
            
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        
        # Terminate TTS server
        if tts_process:
            tts_process.terminate()
            tts_process.wait()
            print("✅ TTS server stopped")
        
        # Terminate frontend server
        if frontend_process:
            frontend_process.terminate()
            frontend_process.wait()
            print("✅ Frontend server stopped")
        
        print("👋 Application shutdown complete")

def main():
    """Main startup function"""
    print("🎯 AI Psychology Expert with Coqui TTS")
    print("=" * 50)
    
    # Check prerequisites
    check_python_version()
    if not check_dependencies():
        sys.exit(1)
    
    # Check if required files exist
    required_files = ["index.html", "script.js", "styles.css", "tts_server.py"]
    for file in required_files:
        if not Path(file).exists():
            print(f"❌ Required file not found: {file}")
            sys.exit(1)
    
    print("✅ All required files found")
    
    # Start servers
    tts_process = start_tts_server()
    if not tts_process:
        print("❌ Failed to start TTS server. Exiting.")
        sys.exit(1)
    
    frontend_process = start_frontend_server()
    if not frontend_process:
        print("❌ Failed to start frontend server. Exiting.")
        tts_process.terminate()
        sys.exit(1)
    
    # Open browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    print("\n🎉 Application started successfully!")
    print("📱 Frontend: http://localhost:8000")
    print("🔧 TTS API: http://localhost:5000")
    print("\nPress Ctrl+C to stop the application")
    print("=" * 50)
    
    # Monitor servers
    try:
        monitor_servers(tts_process, frontend_process)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    main() 