from flask import Flask, jsonify
import time

app = Flask(__name__)

# Configure Tesseract path (if needed)
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'message': 'Hello from Tesseract OCR API',
        'status': 'healthy',
        'service': 'tesseract-ocr',
        'timestamp': time.time()
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=False)