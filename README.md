# NarcoLinkAI | SEVA Innovation Hackathon 2026

**Submitted by Team Apogee:**

- Suravi Jha
- Sudhanshu Shekhar
- Palak Jain
- Soumya Sourav Das
- Devyanshi Bansal
- Tushar Mathur

---

## Overview

NarcoLinkAI is an AI system that helps investigators spot illicit drug activity in coded online content, and trace it back to its sources on the dark web. It has two modules:

| Module | Purpose |
|---|---|
| **Detector** | Analyses text, images, or image + caption posts for drug trade signals, including coded slang. |
| **Extractor** | An autonomous agent that searches and crawls `.onion` sites and writes a structured intelligence report. |

---

## How the Detector Works

```
Text / Image / Image + Caption
        │
        ├─ Image ──► Vision LLM (OCR, substances, packaging, risk verdict)
        │            + ResNet50 image embedding
        │
        ├─ Text  ──► Slang decoder (LLM slang extraction + MiniLM vector "alchemy")
        │
        ▼
Rule-based scoring engine
  1. VLM risk override   (High / Medium / Low)
  2. Bloom filter        (fast slang pre-screen over 1,700+ terms)
  3. Vector similarity   (slang vs. drug-name embeddings)
        │
        ▼
Decision (Threat / Clean) + confidence + detected slang + substances + explanation
```

**Vector alchemy:** `V_word − V_innocent_context + V_criminal_intent ≈ V_drug`. A word like "snow" is re-read in a criminal context to see whether it lands near a drug.

**Scoring:** the final score combines the vision model's risk level, Bloom-filter slang hits and vector similarity. The decision is a threat when the score is above `0.60`. The small fusion network in `bloom_filter.py` is **not** used for scoring.

## How the Extractor Works

1. The LLM refines the query for dark-web search engines.
2. It queries 11 `.onion` search engines in parallel through Tor.
3. The LLM filters the results to the most relevant seeds.
4. It crawls the seeds and the links they contain (depth 2).
5. The LLM writes a Markdown report: summary, source links, artifacts (vendors, contacts, crypto), insights and next steps.

The whole run is time-capped. The limits are constants at the top of `zoro.py`:

| Stage | Cap |
|---|---|
| Each search engine request | 12 s |
| Whole search stage | 18 s |
| Each page fetch | 15 s |
| Each crawl level | 20 s |
| Whole crawl | 60 s |

Whatever finished within the cap is used for the report.

---

## Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **ML:** PyTorch, torchvision (ResNet50), sentence-transformers (all-MiniLM-L6-v2)
- **LLMs:** OpenRouter. `xiaomi/mimo-v2.5` is used for text, slang and report generation, and for the image step. `google/gemma-4-31b-it:free` and `nvidia/nemotron-3.5-super-vl:free` are fallbacks for the image step.
- **Agent / scraping:** LangChain, Requests, BeautifulSoup, Tor (SOCKS5)
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, react-markdown

---

## Project Structure

```
NarcoLink-ai/
├── main.py              # FastAPI app: /analyze and /extractor
├── gemma_intake.py      # Vision LLM step (OCR + visual risk), with model fallbacks
├── decoder.py           # Slang extraction, risk assessment, vector alchemy
├── image_embed.py       # ResNet50 image embeddings
├── bloom_filter.py      # Bloom filter + rule-based scoring engine
├── zoro.py              # Dark web agent: search, crawl, report
├── noise.py             # Text noise / augmentation helpers
├── slm.ipynb            # Experiments notebook
├── Drug_Slang_Data/
│   └── drugNames.json   # Slang terms mapped to drug names
├── model/               # ResNet50 weights, MiniLM, property model
├── data_pic/            # Sample images
├── uploads/             # Saved uploads (forensic log)
└── frontend/            # React app
```

---

## Setup

### Prerequisites

- Python 3.12 and Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key
- **For the Extractor only:** Tor running locally (Tor Browser or the Tor service, SOCKS port `9050` or `9150`)

### 1. Backend

```bash
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```
OPENROUTER_API_KEY=your_key_here
```

Run the API:

```bash
python -m uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## API

| Endpoint | Method | Form fields | Description |
|---|---|---|---|
| `/analyze` | POST | `caption` (text), `image` (file), `document` (`.txt`, optional) | Detector. Returns the decision, confidence, slang, substances and explanation. |
| `/extractor` | POST | `query` (text) | Runs the dark-web agent and returns a Markdown report. |

---

## Notes and Troubleshooting

- **Extractor returns "Tor Proxy is NOT reachable":** start Tor Browser (or the Tor service) first.
- **`402` credit errors from OpenRouter:** every LLM call sets a `max_tokens` cap so low balances still work. If it persists, top up your credits.
- **`503 no_capacity` from a provider:** this is temporary. The Extractor retries, and the image step falls back to other models.
- **Image analysis falls back to caption only:** check the uvicorn log for `Vision model … failed` lines. Free models on OpenRouter get removed from time to time, so update the list in `gemma_intake.py` if needed.
- **Model paths:** `bloom_filter.py` loads MiniLM from an absolute path (`D:\Hackathon\CDTI_Shield\model\all-MiniLM-L6-v2`). Change it if the project lives elsewhere.
