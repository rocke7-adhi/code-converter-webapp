"""
Core conversion logic and API interaction
"""

from g4f.client import Client

class CodeConverter:
    def __init__(self):
        # Initialize the API client
        self.client = Client()
    
    def convert_code(self, input_code: str, input_language: str, target_language: str, model: str) -> str:
        """
         Convert code from input language to target language using the selected model.

        """
        # Validate input code is not empty
        if not input_code.strip():
            return "Error: Please enter some code to convert."
        # Validate input language is selected
        if not input_language:
            return "Error: Please select a input programming language"
        # Validate target language is selected
        if not target_language:
            return "Error: Please select a target programming language."
        
        # Validate model is selected    
        if not model:
            return "Error: Please select a model."

        try:
            # Create prompt for the AI model
            prompt = f"""
            Convert this {input_language} code to {target_language}. 
            Only output the converted code, no explanations:

            ```
            {input_code}
            ```
            """
            
            # Make API request to convert code
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": prompt},
                    {"role": "system", "content": "You are a code converter AI, capable of converting code from one programming language to another, and you must display only the code."}
                    #{"role": "system", "content": "You are a highly intelligent assistant that specializes in converting code between different programming languages. Your role is to understand the input code provided by the user and translate it accurately into the specified target programming language. Maintain functionality and logic from the source code in the translated code.  If the user provides incomplete or unclear input, correct the code. only display the code, no explanations."}

                ],
                temperature=0.2  # Lower temperature for more consistent outputs
            )
            
            # Return the converted code from response
            return response.choices[0].message.content
            
        except Exception as e:
            # Handle any errors during conversion
            return f"An error occurred while processing the request: {str(e)}"