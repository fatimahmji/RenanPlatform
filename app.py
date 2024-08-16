from flask import Flask, render_template, request, jsonify, send_file
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from Renan_run import load_model, generate_audio
import os

app = Flask(__name__)

# Load the TTS model when the server starts
config_path = "E:/new_model/config.json"
checkpoint_dir = "E:/new_model/"
model = load_model(config_path, checkpoint_dir)

# Configure Selenium WebDriver
chrome_options = ChromeOptions()
chrome_options.add_argument('--headless')  # Run in headless mode
service = ChromeService(executable_path='/path/to/chromedriver')

# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# Route for the "About" page
@app.route('/about')
def about():
    return render_template('about.html')

# Route for the "Services" page
@app.route('/services')
def services():
    return render_template('services.html')

# Route for the "Model" page
@app.route('/model')
def model_page():
    return render_template('model.html')

# Route for the "Contact" page
@app.route('/contact')
def contact():
    return render_template('contact.html')

# Route for the "Header" (corrected the function name)
@app.route('/header')
def header():
    return render_template('header.html')

# API endpoint for generating text using Selenium
@app.route('/generate-text', methods=['POST'])
def generate_text():
    input_text = request.json.get('input')
    
    # Setup WebDriver
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        driver.get('https://toolbaz.com/writer/ai-story-generator')

        # Find input field and button, and perform actions
        input_field = driver.find_element(By.ID, 'input')
        input_field.send_keys(input_text)
        
        generate_button = driver.find_element(By.ID, 'main_btn')
        generate_button.click()
        
        # Wait for the output to appear
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'output')))
        
        # Extract text from output
        output_elements = driver.find_elements(By.CSS_SELECTOR, '#output p')
        generated_text = ' '.join([element.text for element in output_elements])
    
    finally:
        driver.quit()

    return jsonify({'generated_text': generated_text})

# API endpoint for generating audio using the pre-trained model
@app.route('/generate-audio', methods=['POST'])
def generate_audio_route():
    data = request.json
    text = data.get('text')
    speaker_id = data.get('speaker_id')
    speed = data.get('speed', 'normal')
    bg_music_filename = data.get('bg_music_filename', None)
    
    output_dir = "D:/Renan_Website"
    
    # Generate audio
    generate_audio(model, speaker_id, [text], output_dir, bg_music_filename, speed)
    
    # Find the latest generated file
    files = [f for f in os.listdir(output_dir) if f.endswith('.wav')]
    latest_file = max(files, key=lambda x: os.path.getctime(os.path.join(output_dir, x)))
    output_path = os.path.join(output_dir, latest_file)
    
    return send_file(output_path, as_attachment=True, download_name="generated_audio.wav")

if __name__ == '__main__':
    app.run(debug=True)
