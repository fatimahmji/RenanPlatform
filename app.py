from flask import Flask, render_template, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os

app = Flask(__name__)

# Configure Selenium WebDriver
chrome_options = ChromeOptions()
chrome_options.add_argument('--headless')  # Run in headless mode
service = ChromeService(executable_path='/path/to/chromedriver')

# Route for main page
@app.route('/')
def index():
    return render_template('index.html')

# API endpoint for generating text
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

if __name__ == '__main__':
    app.run(debug=True)
