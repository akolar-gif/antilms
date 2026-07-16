# innoversity LMS: Kurs-Import-Spezifikation (JSON Schema)

Diese Dokumentation beschreibt die genaue JSON-Struktur, die erlaubten Inhaltstypen, Pflichtfelder und Validierungsregeln, um Kurse erfolgreich in das innoversity LMS zu importieren. Dieses Schema kann direkt in Generierungstools (z. B. AI-Co-Autoren) eingespeist werden.

---

## 1. Übersicht & Metadaten

* **Dateiformat**: Standard-JSON (Kodierung: UTF-8)
* **ID-Vergabe**: Alle IDs (`id` für Kurse, Module und Blöcke) werden beim Import **automatisch vom System generiert**. Die JSON-Datei darf keine IDs enthalten.
* **Hierarchie**:
  $$\text{Kurs (Course)} \longrightarrow \text{Module (Modules)} \longrightarrow \text{Lerneinheiten (Blocks)}$$

---

## 2. JSON Schema Definition (Draft-07)

Hier ist das formale JSON-Schema zur Validierung:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "InnoversityCourseImport",
  "type": "object",
  "required": ["title", "description"],
  "additionalProperties": false,
  "properties": {
    "title": {
      "type": "string",
      "description": "Der Name des Kurses (z.B. für die Bibliothekskarte)."
    },
    "description": {
      "type": "string",
      "description": "Ausführliche Beschreibung des Kurses, die auf der Buchungsseite angezeigt wird."
    },
    "category": {
      "type": "string",
      "default": "Importiert",
      "description": "Rubrik zur Einsortierung (z.B. Leadership, Tech, HR)."
    },
    "type": {
      "type": "string",
      "enum": ["comprehensive", "sprint"],
      "default": "comprehensive",
      "description": "Kurstyp: 'comprehensive' (Standard-Kurs) oder 'sprint' (Skill Sprint)."
    },
    "price": {
      "type": "number",
      "description": "Verkaufspreis in Euro. Muss eine Zahl sein (z.B. 29.90). Leer lassen für Standardpreis (49€)."
    },
    "imageUrl": {
      "type": "string",
      "format": "uri",
      "description": "Optionale URL zu einem Titelbild."
    },
    "modules": {
      "type": "array",
      "description": "Liste der Module (Kapitel). Werden in der Reihenfolge des Arrays importiert.",
      "items": {
        "type": "object",
        "required": ["title"],
        "additionalProperties": false,
        "properties": {
          "title": {
            "type": "string",
            "description": "Name des Moduls."
          },
          "blocks": {
            "type": "array",
            "description": "Lerneinheiten (Lektionen) innerhalb des Moduls.",
            "items": {
              "type": "object",
              "required": ["type", "title"],
              "additionalProperties": false,
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["text", "quiz", "reflection", "ai_chat", "video", "audio"],
                  "description": "Inhaltstyp der Lerneinheit."
                },
                "title": {
                  "type": "string",
                  "description": "Name der Lerneinheit (wird in der Navigation angezeigt)."
                },
                "content": {
                  "type": "string",
                  "description": "Der Hauptinhalt (Freitext oder Markdown) für Text-, Reflexions- oder Chat-Blöcke."
                },
                "settings": {
                  "type": "object",
                  "description": "Spezifische Einstellungen je nach Lerneinheitstyp.",
                  "additionalProperties": false,
                  "properties": {
                    "question": {
                      "type": "string",
                      "description": "Nur für 'quiz': Die Frage."
                    },
                    "options": {
                      "type": "array",
                      "description": "Nur für 'quiz': Antwortmöglichkeiten.",
                      "items": { "type": "string" }
                    },
                    "correctAnswer": {
                      "type": "number",
                      "description": "Nur für 'quiz': 0-basierter Index der richtigen Antwort."
                    },
                    "systemPrompt": {
                      "type": "string",
                      "description": "Nur für 'ai_chat': System-Prompt für den KI-Begleiter."
                    },
                    "mediaUrl": {
                      "type": "string",
                      "description": "Nur für 'video'/'audio': Dateipfad oder externe URL."
                    }
                  }
                }
              },
              "allOf": [
                {
                  "if": {
                    "properties": { "type": { "const": "quiz" } }
                  },
                  "then": {
                    "required": ["settings"],
                    "properties": {
                      "settings": {
                        "required": ["question", "options", "correctAnswer"]
                      }
                    }
                  }
                },
                {
                  "if": {
                    "properties": { "type": { "const": "ai_chat" } }
                  },
                  "then": {
                    "required": ["content", "settings"],
                    "properties": {
                      "settings": {
                        "required": ["systemPrompt"]
                      }
                    }
                  }
                },
                {
                  "if": {
                    "properties": { "type": { "const": "reflection" } }
                  },
                  "then": {
                    "required": ["content"]
                  }
                },
                {
                  "if": {
                    "properties": { "type": { "enum": ["video", "audio"] } }
                  },
                  "then": {
                    "required": ["settings"],
                    "properties": {
                      "settings": {
                        "required": ["mediaUrl"]
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

---

## 3. Erlaubte Inhaltstypen & Pflichtfelder

Jeder Eintrag im `blocks`-Array repräsentiert eine Lerneinheit und muss einem dieser Typen entsprechen:

### A. Typ `text` (Wissensvermittlung)
* **Pflichtfelder**: `title`
* **Verwendung**: Für Textinhalte, Erklärungen und didaktische Einführungstexte.
* **Format**: Das Feld `content` unterstützt Markdown-Formatierung.
* **Beispiel**:
  ```json
  {
    "type": "text",
    "title": "Einführung in die Verhandlung",
    "content": "### Die 3 Säulen der Verhandlung\n1. Vorbereitung\n2. Dialog\n3. Abschluss"
  }
  ```

### B. Typ `quiz` (Wissensprüfung)
* **Pflichtfelder**: `title`, `settings.question`, `settings.options`, `settings.correctAnswer`
* **Assessment-Format**: Single-Choice.
* **Struktur**:
  * `settings.question` (String): Die gestellte Frage.
  * `settings.options` (Array of Strings): Antwortmöglichkeiten.
  * `settings.correctAnswer` (Integer): Der 0-basierte Index der korrekten Antwort aus dem Options-Array.
* **Beispiel**:
  ```json
  {
    "type": "quiz",
    "title": "Wissens-Check: Harvard-Konzept",
    "settings": {
      "question": "Was ist das Kernprinzip des Harvard-Konzepts?",
      "options": [
        "Den Verhandlungspartner einschüchtern",
        "Interessen statt Positionen in den Fokus stellen",
        "Den Preis kompromisslos drücken"
      ],
      "correctAnswer": 1
    }
  }
  ```

### C. Typ `reflection` (Reflexion & Transfer)
* **Pflichtfelder**: `title`, `content`
* **Verwendung**: Regt den Lernenden an, das Gelernte auf die eigene Praxis anzuwenden. Die Antworten fließen in den KI-Wochenbericht ein.
* **Format**: Das Feld `content` stellt die Reflexionsfrage dar.
* **Beispiel**:
  ```json
  {
    "type": "reflection",
    "title": "Deine Erfahrungen",
    "content": "Beschreibe eine Situation aus der letzten Woche, in der eine klare Argumentation dir geholfen hat."
  }
  ```

### D. Typ `ai_chat` (Interaktiver Dialogbegleiter)
* **Pflichtfelder**: `title`, `content`, `settings.systemPrompt`
* **Verwendung**: Startet ein interaktives Rollenspiel oder eine Übung mit der KI.
* **Struktur**:
  * `content` (String): Die Aufgabenstellung an den Nutzer (was soll er im Chat tun?).
  * `settings.systemPrompt` (String): Die Anweisung für die KI, welche Rolle, Tonalität und welches Verhalten sie annehmen soll.
* **Beispiel**:
  ```json
  {
    "type": "ai_chat",
    "title": "Rollenspiel: Einwände behandeln",
    "content": "Überzeuge den Kunden im Chat davon, dass Qualität ihren Preis hat. Er wird Einwände bringen.",
    "settings": {
      "systemPrompt": "Du bist ein skeptischer Kunde. Du legst großen Wert auf Budget, bist aber für gute Argumente bezüglich Langlebigkeit empfänglich."
    }
  }
  ```

### E. Typ `video` / `audio` (Medienblöcke)
* **Pflichtfelder**: `title`, `settings.mediaUrl`
* **Verwendung**: Zum Abspielen von Videos oder Audioaufzeichnungen.
* **Struktur**:
  * `settings.mediaUrl` (String): Vollständige URL (z.B. `/uploads/...` oder externe URL) zur Mediendatei.
* **Beispiel**:
  ```json
  {
    "type": "video",
    "title": "Erklärvideo: Verhandlungstaktiken",
    "settings": {
      "mediaUrl": "https://example.com/videos/tactics.mp4"
    }
  }
  ```

---

## 4. Vollständiges Kurs-Beispiel

Hier ist ein komplettes, valides JSON-Dokument für einen funktionierenden Import:

```json
{
  "title": "Konstruktives Feedback geben",
  "description": "Lerne, wie du Feedback wertschätzend und effektiv formulierst, um die Zusammenarbeit im Team zu stärken.",
  "category": "Kommunikation",
  "type": "comprehensive",
  "price": 39.90,
  "modules": [
    {
      "title": "Modul 1: Grundlagen des Feedbacks",
      "blocks": [
        {
          "type": "text",
          "title": "Warum Feedback wichtig ist",
          "content": "### Feedback als Wachstumsmotor\nOhne Feedback wissen wir nicht, wo unsere blinden Flecken liegen. Gutes Feedback zeichnet sich aus durch:\n\n* **Konkretheit** (Beispiele nennen)\n* **Zukunftsorientierung** (Was kann verbessert werden?)\n* **Wertschätzung** (Fokus auf Wachstum)"
        },
        {
          "type": "quiz",
          "title": "Wissens-Check: Die 3-W-Regel",
          "settings": {
            "question": "Wofür stehen die 3 Ws im Feedback?",
            "options": [
              "Wahrnehmung, Wirkung, Wunsch",
              "Wahrheit, Wertung, Wille",
              "Wissen, Weitblick, Wandel"
            ],
            "correctAnswer": 0
          }
        }
      ]
    },
    {
      "title": "Modul 2: Praktische Anwendung",
      "blocks": [
        {
          "type": "reflection",
          "title": "Deine Feedback-Erfahrungen",
          "content": "Wann hast du das letzte Mal Feedback erhalten, das dich wirklich weitergebracht hat? Warum war es effektiv?"
        },
        {
          "type": "ai_chat",
          "title": "KI-Training: Schwieriges Feedbackgespräch",
          "content": "Sprich mit deinem Mitarbeiter 'Tobias'. Er kommt in letzter Zeit häufiger zu spät zu Meetings. Formuliere das Feedback konstruktiv.",
          "settings": {
            "systemPrompt": "Du bist Tobias, ein talentierter Entwickler. Du kommst zu spät, weil du dich in deiner Arbeit verlierst, bist aber offen für konstruktives Feedback. Reagiere anfangs leicht defensiv, aber lenke bei gut formulierten Ich-Botschaften ein."
          }
        }
      ]
    }
  ]
}
```
