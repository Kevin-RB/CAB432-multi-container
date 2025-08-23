from flask import Flask, jsonify, request
import time
import pytesseract
from PIL import Image
import io
import base64
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = app.logger


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'message': 'Hello from Tesseract OCR API',
        'status': 'healthy',
        'service': 'tesseract',
        'timestamp': time.time()
    })


@app.route('/ocr', methods=['POST'])
def extract_text():
    logger.info('Extracting text: %s', request.method)
    try:
        # Check if request contains file or base64 data
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided. Send as file upload or base64 in JSON'}), 400
       
        # Handle file upload
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Open image directly from file stream
        image = Image.open(file.stream)
            
        # Convert to RGB if necessary (for better OCR results)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Perform OCR
        custom_oem_psm_config = r'--oem 1 --psm 6 -c preserve_interword_spaces=1'
        extracted_text = pytesseract.image_to_string(image, config=custom_oem_psm_config)
        logger.info('Text extracted successfully')
        return jsonify({
            'text': extracted_text.strip(),
            'status': 'success',
            'timestamp': time.time()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'OCR processing failed: {str(e)}',
            'status': 'error',
            'timestamp': time.time()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=False)