from flask import Flask, request, jsonify, send_from_directory
import os, json, secrets, string, datetime
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'data.json')
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# 🧠 Initialize data file if missing
def _init_data():
    today = datetime.date.today().isoformat()
    weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    data = {
        "total": 0,
        "today": 0,
        "today_date": today,
        "ts": datetime.datetime.utcnow().isoformat() + "Z",
        "history": {day: 0 for day in weekdays}
    }
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

if not os.path.exists(DATA_FILE):
    _init_data()

def read_data():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def write_data(d):
    d['ts'] = datetime.datetime.utcnow().isoformat() + "Z"
    with open(DATA_FILE, 'w') as f:
        json.dump(d, f, indent=2)

# 🔄 Update total, today, and 7-day history
def bump_count():
    d = read_data()
    today_date = datetime.date.today()
    today_str = today_date.isoformat()
    weekday = today_date.strftime("%a")  # e.g. 'Mon'

    # Reset today's count if date changed
    if d.get('today_date') != today_str:
        d['today'] = 0
        d['today_date'] = today_str

    # Increment counts
    d['today'] = d.get('today', 0) + 1
    d['total'] = d.get('total', 0) + 1

    # Update history (last 7 days)
    if 'history' not in d:
        weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        d['history'] = {day: 0 for day in weekdays}

    d['history'][weekday] = d['history'].get(weekday, 0) + 1

    write_data(d)
    return d

# 🔐 Password Generator API
@app.route('/generate', methods=['POST'])
def generate():
    payload = request.get_json() or {}
    length = int(payload.get('length', 16))
    upper = payload.get('upper', True)
    lower = payload.get('lower', True)
    numbers = payload.get('numbers', True)
    symbols = payload.get('symbols', True)

    pool = ''
    if upper: pool += string.ascii_uppercase
    if lower: pool += string.ascii_lowercase
    if numbers: pool += string.digits
    if symbols: pool += '!@#$%^&*()_+-=[]{};:,.<>?'

    if not pool:
        return jsonify({'error': 'Select at least one character set'}), 400

    password = ''.join(secrets.choice(pool) for _ in range(max(4, min(128, length))))

    try:
        d = bump_count()
    except Exception as e:
        d = read_data()

    return jsonify({
        'password': password,
        'stats': {
            'total': d.get('total', 0),
            'today': d.get('today', 0)
        }
    })

# 📊 Stats API for Dashboard (with history)
@app.route('/api/stats', methods=['GET'])
def stats():
    d = read_data()
    return jsonify({
        'total': d.get('total', 0),
        'today': d.get('today', 0),
        'history': d.get('history', {}),
        'ts': d.get('ts')
    })

# 🌐 Serve frontend files
@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.exists(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/', methods=['GET'])
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

# 🚀 Run app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)