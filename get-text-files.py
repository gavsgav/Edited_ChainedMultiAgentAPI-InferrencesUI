from flask import Flask, jsonify, render_template
import os
from pathlib import Path

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-file-content/<filename>')
def get_file_content(filename):
    directory = Path('prompts')
    file_path = directory / filename
    if file_path.exists():
        with open(file_path, 'r') as file:
            content = file.read()
        return jsonify(content)
    return jsonify("File not found"), 404

@app.route('/get-text-files')
def get_text_files():
    directory = 'prompts'
    files = [f for f in os.listdir(directory) if f.endswith('.txt')]
    return jsonify(files)

if __name__ == '__main__':
    app.run(debug=True)


