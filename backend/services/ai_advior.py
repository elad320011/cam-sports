import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

def get_response(messages, question):
    # Add the user's question to the conversation
    messages.append({"role": "user", "content": question})

    # Get the response from ChatGPT
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini", 
        messages=messages,
        temperature=0.7,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    assistant_message = response["choices"][0]["message"]["content"]
    messages.append({"role": "assistant", "content": assistant_message})

    return assistant_message
