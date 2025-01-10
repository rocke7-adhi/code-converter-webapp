from g4f.client import Client

class CodeExplanation:
    def __init__(self):
        self.client = Client()

    def explain_code(self, input_code: str, target_language: str, model: str) -> str:
        """
        Generate an explanation for the provided code
        """
        if not input_code.strip():
            return "No code to explain."
        if not target_language:
            return "Error: Please select a target programming language"
        if not model:
            return "Error: Please select a model."
        
        try:
            # Create a detailed prompt for code explanation
            prompt = f"""
            Explain this {target_language} code in detail:
                ```{target_language}
            {input_code}
            ```
            Please provide:
            1. Brief overview of what the code does
            2. Line-by-line explanation
            3. Important functions or methods used
            4. Any potential improvements or best practices
            """

            # Get explanation from AI
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an expert programmer. Explain code clearly and concisely."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7  # Add some creativity while maintaining accuracy
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"Error explaining code: {str(e)}" 