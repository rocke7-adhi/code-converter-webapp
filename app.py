from flask import Flask, render_template, request, jsonify
from models import AVAILABLE_MODELS, PROGRAMMING_LANGUAGES
from converter import CodeConverter
from explanation import CodeExplanation
import asyncio
from asyncio import WindowsSelectorEventLoopPolicy
asyncio.set_event_loop_policy(WindowsSelectorEventLoopPolicy())

app = Flask(__name__, static_folder='static')


converter = CodeConverter()
explanation = CodeExplanation()


@app.route('/')
def index():
    #return render_template('index.html')
    return render_template('index.html', languages=PROGRAMMING_LANGUAGES, models=AVAILABLE_MODELS)

# Code Converter
@app.route('/convert', methods=['POST'])
def convert():
    input_code = request.form['input_code']
    target_language = request.form['target_language']
    selected_model = request.form['selected_model']
    # Perform the code conversion (you need to implement this logic in CodeConverter)
    converted_code = converter.convert_code(input_code, target_language, selected_model)
    return jsonify({
        'converted_code': converted_code
    })


# Code Explanation
@app.route('/explain', methods=['POST'])
def explain():
    input_code = request.form['input_code']
    target_language = request.form['target_language']
    selected_model = request.form['selected_model']
    explanation_text = explanation.explain_code(input_code, target_language, selected_model)
    return jsonify({
        'explanation': explanation_text
        })


if __name__ == '__main__':
    app.run(debug=True)
