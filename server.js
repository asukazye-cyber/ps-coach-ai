import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/analyze", async (req, res) => {
  try {
    const state = req.body;

    const prompt = `
You are a competitive Pokémon Showdown coach specialized in ${state.format}.
Do not assume hidden information.
Analyze only what is visible.

Battle state:
${JSON.stringify(state)}

Return STRICT JSON:
{
  "best_move": "",
  "alternatives": [],
  "risk_level": "LOW|MEDIUM|HIGH",
  "win_condition_summary": "",
  "explanation": ""
}
`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const j = await r.json();
    res.json(JSON.parse(j.choices[0].message.content));
  } catch {
    res.status(500).json({
      best_move: "—",
      alternatives: [],
      risk_level: "MEDIUM",
      win_condition_summary: "",
      explanation: "IA indisponível"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("AI running on", PORT));
