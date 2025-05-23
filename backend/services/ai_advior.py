import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def get_response(messages, question):
    # Add the user's question to the conversation
    temp_messages = messages + [{"role": "user", "content": question}]

    # Get the response from ChatGPT
    response = openai.ChatCompletion.create(
        model=os.getenv("OPENAI_ENGINE"), 
        messages=temp_messages,
        temperature=0.7,
        max_tokens=2000,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    assistant_message = response["choices"][0]["message"]["content"]

    return assistant_message
