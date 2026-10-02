import requests

from flask import Flask, render_template, request, jsonify


# ==========================================================
# EDUGENIE - FAST OLLAMA VERSION
# ==========================================================

app = Flask(__name__)


# ==========================================================
# OLLAMA SETTINGS
# ==========================================================

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

OLLAMA_MODEL = "llama3.2:1b"


# ==========================================================
# HOME PAGE
# ==========================================================

@app.route("/")
def home():
    return render_template("index.html")


# ==========================================================
# AI TUTOR / ASK EDUGENIE
# ==========================================================

@app.route("/ask", methods=["POST"])
def ask():

    try:

        # --------------------------------------------------
        # GET QUESTION
        # --------------------------------------------------

        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "error": "No question received."
            }), 400


        question = str(
            data.get("question", "")
        ).strip()


        if not question:
            return jsonify({
                "error": "Please enter a question."
            }), 400


        # --------------------------------------------------
        # SHORT FAST PROMPT
        # --------------------------------------------------

        prompt = f"""
You are EduGenie, a helpful college AI tutor.

Student question:
{question}

Answer clearly using simple language.

Rules:
- Explain the main idea first.
- Use short paragraphs.
- Use bullet points when useful.
- Give one simple example when useful.
- For programming questions, show a short code example.
- Do not give unnecessary information.
- Keep the answer concise but useful.
"""


        # --------------------------------------------------
        # OLLAMA REQUEST
        # --------------------------------------------------

        response = requests.post(

            OLLAMA_URL,

            json={
                "model": OLLAMA_MODEL,

                "prompt": prompt,

                "stream": False,

                "options": {

                    # Smaller output = faster response
                    "num_predict": 180,

                    # Lower randomness
                    "temperature": 0.4,

                    # Keep model context smaller
                    "num_ctx": 2048
                }
            },

            # Local model normally responds quickly,
            # but allow enough time for first model loading.
            timeout=120
        )


        # --------------------------------------------------
        # CHECK HTTP RESPONSE
        # --------------------------------------------------

        if response.status_code != 200:

            print()
            print("==========================================")
            print("          OLLAMA API ERROR")
            print("==========================================")
            print(response.text)
            print("==========================================")
            print()

            return jsonify({
                "error":
                    "Ollama returned an error. "
                    "Make sure Ollama is running."
            }), 500


        # --------------------------------------------------
        # READ JSON
        # --------------------------------------------------

        result = response.json()


        answer = str(
            result.get("response", "")
        ).strip()


        # --------------------------------------------------
        # EMPTY RESPONSE
        # --------------------------------------------------

        if not answer:

            return jsonify({
                "error":
                    "Ollama returned an empty response."
            }), 500


        # --------------------------------------------------
        # SUCCESS
        # --------------------------------------------------

        return jsonify({

            "answer": answer,

            "mode": "ollama"

        })


    # ======================================================
    # OLLAMA NOT RUNNING
    # ======================================================

    except requests.exceptions.ConnectionError:

        print()
        print("==========================================")
        print("       OLLAMA CONNECTION ERROR")
        print("==========================================")
        print("Ollama is not running.")
        print("==========================================")
        print()

        return jsonify({

            "error":
                "Ollama is not running. "
                "Please start Ollama first."

        }), 503


    # ======================================================
    # TIMEOUT
    # ======================================================

    except requests.exceptions.Timeout:

        return jsonify({

            "error":
                "EduGenie took too long to get a response "
                "from the local AI. Please try again."

        }), 504


    # ======================================================
    # INVALID JSON RESPONSE
    # ======================================================

    except ValueError:

        return jsonify({

            "error":
                "Ollama returned an invalid response."

        }), 500


    # ======================================================
    # GENERAL ERROR
    # ======================================================

    except Exception as e:

        print()
        print("==========================================")
        print("          EDUGENIE ERROR")
        print("==========================================")
        print(str(e))
        print("==========================================")
        print()

        return jsonify({

            "error":
                "Something went wrong while "
                "processing your question."

        }), 500


# ==========================================================
# START SERVER
# ==========================================================

if __name__ == "__main__":

    print()
    print("==========================================")
    print("          🎓 EDUGENIE AI")
    print("==========================================")
    print()
    print("AI Engine : Ollama")
    print("Model     : llama3.2:1b")
    print()
    print("Fast AI Tutor Mode: ENABLED")
    print()
    print("Website:")
    print("http://127.0.0.1:5000")
    print()
    print("==========================================")
    print()


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True,

        threaded=True
    )