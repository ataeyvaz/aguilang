import json
import re
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ── SEVİYE KURALLARI ──────────────────────────────────────────

A1_WORDS = {
    "a", "an", "the", "i", "you", "he", "she", "it", "we", "they",
    "am", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "can", "not",
    "and", "or", "but", "in", "on", "at", "to", "of", "for", "with",
    "this", "that", "here", "there", "yes", "no", "ok",
    "what", "who", "where", "when", "how", "why",
    "go", "come", "see", "like", "want", "eat", "drink", "sleep",
    "run", "walk", "sit", "stand", "read", "write", "play",
    "good", "bad", "big", "small", "new", "old", "hot", "cold",
    "happy", "sad", "nice", "beautiful", "funny",
    "cat", "dog", "bird", "fish", "rabbit", "bear", "lion",
    "red", "blue", "green", "yellow", "white", "black", "orange", "pink",
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "apple", "banana", "milk", "water", "bread", "egg", "rice",
    "mother", "father", "sister", "brother", "baby", "family", "friend",
    "school", "book", "pen", "pencil", "teacher", "student", "class",
    "hello", "hi", "goodbye", "bye", "please", "thank", "sorry", "help",
    "house", "home", "door", "window", "table", "chair", "bed", "room",
    "head", "hand", "eye", "nose", "mouth", "ear", "face", "hair", "arm", "leg",
    "sun", "moon", "star", "tree", "flower", "rain", "snow",
    "car", "bus", "train", "plane", "bike",
    "morning", "evening", "night", "day", "today", "tomorrow", "yesterday",
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "my", "your", "his", "her", "our", "their", "its",
    "me", "him", "us", "them",
    "very", "too", "also", "again", "now", "then",
    "girl", "boy", "man", "woman", "child", "people", "person",
    "food", "name", "time", "year", "way",
    "love", "know", "think", "look", "make", "take", "give",
    "city", "country", "world", "street", "park",
    "color", "number", "letter", "word",
    "phone", "game", "music", "film", "movie"
}

A2_WORDS = {
    "because", "although", "however", "therefore", "usually", "always", "never",
    "sometimes", "often", "already", "still", "yet", "just", "only",
    "must", "should", "could", "would", "might",
    "better", "worse", "more", "most", "less", "least", "another",
    "same", "different", "important", "interesting", "difficult", "easy",
    "hospital", "doctor", "medicine", "health", "sport", "exercise",
    "money", "bank", "price", "buy", "sell", "pay", "cost",
    "weather", "season", "summer", "winter", "spring", "autumn",
    "travel", "hotel", "airport", "ticket", "tourist",
    "job", "work", "office", "meeting", "company", "business",
    "kitchen", "bedroom", "bathroom", "garden", "building", "apartment",
    "breakfast", "lunch", "dinner", "restaurant", "menu", "cook",
    "birthday", "party", "holiday", "gift", "present",
    "angry", "excited", "tired", "bored", "surprised", "worried",
    "tall", "short", "thin", "young", "heavy", "light",
    "fast", "slow", "early", "late", "near", "far", "left", "right",
    "between", "behind", "above", "below", "inside", "outside",
    "send", "receive", "call", "answer", "ask", "tell", "explain", "show",
    "open", "close", "start", "stop", "finish", "continue", "try", "learn",
    "remember", "forget", "understand", "choose", "decide", "agree", "prefer"
}

B1_WORDS = {
    "despite", "whereas", "nevertheless", "furthermore", "moreover",
    "consequently", "meanwhile", "eventually", "immediately", "approximately",
    "government", "politics", "economy", "society", "culture", "tradition",
    "environment", "pollution", "climate", "energy", "technology", "science",
    "education", "university", "research", "knowledge", "experience", "skill",
    "opportunity", "challenge", "problem", "solution", "issue", "situation",
    "relationship", "communication", "conversation", "argument", "opinion",
    "advantage", "disadvantage", "benefit", "consequence", "effect", "cause",
    "industry", "production", "development", "progress", "success", "failure",
    "achieve", "improve", "increase", "decrease", "reduce", "develop", "provide",
    "consider", "suggest", "recommend", "require", "allow", "prevent", "avoid",
    "describe", "compare", "discuss", "analyze", "evaluate", "create",
    "professional", "international", "national", "local", "modern", "traditional"
}


def detect_level(sentence):
    words = sentence.lower().split()
    word_count = len(words)
    char_count = len(sentence)

    if word_count == 0:
        return None

    if char_count <= 40 and word_count <= 7:
        a1_match = sum(1 for w in words if re.sub(r'[^a-z]', '', w) in A1_WORDS)
        if a1_match / word_count >= 0.6:
            return "A1"

    if char_count <= 70 and word_count <= 12:
        a2_match = sum(1 for w in words if re.sub(r'[^a-z]', '', w) in A1_WORDS | A2_WORDS)
        if a2_match / word_count >= 0.5:
            return "A2"

    if char_count <= 100 and word_count <= 18:
        b1_match = sum(1 for w in words if re.sub(r'[^a-z]', '', w) in A1_WORDS | A2_WORDS | B1_WORDS)
        if b1_match / word_count >= 0.4:
            return "B1"

    if char_count <= 150 and word_count <= 25:
        return "B2"

    return None


def is_valid(sentence):
    if not sentence or len(sentence) < 3:
        return False
    if re.search(r'\d{4,}', sentence):
        return False
    if re.search(r'http|www\.', sentence.lower()):
        return False
    special = len(re.findall(r'[^a-zA-Z\s.,!?\'"-]', sentence))
    if special > 3:
        return False
    return True


def process_file(filepath, lang_code, limit_per_level=500):
    levels = {"A1": [], "A2": [], "B1": [], "B2": []}
    seen = set()

    print(f"  Okunuyor: {filepath}")

    with open(filepath, encoding='utf-8-sig', errors='ignore') as f:
        for i, line in enumerate(f):
            parts = line.strip().split('\t')
            if len(parts) < 2:
                continue

            en = parts[0].strip()
            other = parts[1].strip()

            if not en or not other:
                continue
            if not is_valid(en):
                continue

            key = en.lower()
            if key in seen:
                continue
            seen.add(key)

            level = detect_level(en)
            if level and len(levels[level]) < limit_per_level:
                levels[level].append({
                    "en": en,
                    lang_code: other,
                    "level": level
                })

            if all(len(v) >= limit_per_level for v in levels.values()):
                print(f"  Tüm seviyeler doldu ({i+1}. satırda)")
                break

    for lv, items in levels.items():
        print(f"  {lv}: {len(items)} cümle")

    return levels


# ── ÇALIŞTIR ─────────────────────────────────────────────────

os.makedirs('docs/data-sources/processed', exist_ok=True)

print("\n📄 tur.txt isleniyor (Ingilizce -> Turkce)...")
tur = process_file('docs/data-sources/tur.txt', 'tr')

print("\n📄 deu.txt isleniyor (Ingilizce -> Almanca)...")
deu = process_file('docs/data-sources/deu.txt', 'de')

print("\n📄 spa.txt isleniyor (Ingilizce -> Ispanyolca)...")
spa = process_file('docs/data-sources/spa.txt', 'es')

# ── KAYDET ───────────────────────────────────────────────────

lang_names = {'tur': 'en-tr', 'deu': 'en-de', 'spa': 'en-es'}
pairs = [('tur', 'tr', tur), ('deu', 'de', deu), ('spa', 'es', spa)]

for key, lang_code, data in pairs:
    for level, sentences in data.items():
        filename = f"docs/data-sources/processed/{lang_names[key]}-{level.lower()}.json"
        with open(filename, 'w', encoding='utf-8-sig') as f:
            json.dump(sentences, f, ensure_ascii=False, indent=2)
        print(f"  OK {filename} -> {len(sentences)} cumle")

# ── OZET ─────────────────────────────────────────────────────

print("\n" + "="*50)
print("OZET")
print("="*50)
total = 0
for key, lang_code, data in pairs:
    for level, sentences in data.items():
        n = len(sentences)
        total += n
        print(f"  {lang_names[key]}-{level}: {n} cumle")
print(f"\nToplam: {total} cumle")

print("\n--- Ornek A1 Turkce cumleler ---")
for s in tur['A1'][:5]:
    print(f"  EN: {s['en']}")
    print(f"  TR: {s['tr']}")
    print()