"""
Core conversion logic and API interaction
"""

from g4f.client import Client

class CodeConverter:
    def __init__(self):
        # Initialize the API client
        self.client = Client()
    
    def convert_code(self, input_code: str, target_language: str, model: str) -> str:
        """
        Convert code from one language to another using the specified model
        """
        # Validate input code is not empty
        if not input_code.strip():
            return "Error: Please enter some code to convert."
        
        # Validate target language is selected
        if not target_language:
            return "Error: Please select a target programming language."
        
        # Validate model is selected    
        if not model:
            return "Error: Please select a model."

        try:
            # Create prompt for the AI model
            prompt = f"""
            Convert the following code to {target_language}. 
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
                ],
                temperature=0.2  # Lower temperature for more consistent outputs
            )
            
            # Return the converted code from response
            return response.choices[0].message.content
            
        except Exception as e:
            # Handle any errors during conversion
            return f"An error occurred while processing the request: {str(e)}"