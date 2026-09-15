import dotenv from "dotenv";
dotenv.config();

import { RealAIProvider } from "../src/lib/ai/real-provider";

async function testCurriculum() {
  const provider = new RealAIProvider();
  console.log("Testing generateCurriculum with exact user syllabus from screenshot...");

  const title = "MC 4";
  const description = "Spielmechaniken kennen, können sich sicher in der Minecraft-Welt bewegen, erste Ressourcen sammeln und verarbeiten, einfache Bauwerke erstellen und ausgewählte Befehle (Cheats) sinnvoll einsetzen.";
  const curriculumSyllabus = "Abschluss-Challenge: Baue deine erste Minecraft-Basis. Die Teilnehmenden suchen einen geeigneten Platz, sammeln Holz und Nahrung, stellen Werkzeuge her, bauen eine Unterkunft, setzen Tür und Beleuchtung ein und bereiten ihre Basis auf die erste Nacht vor.";

  try {
    const result = await provider.generateCurriculum({
      title,
      description,
      language: "de",
      curriculumSyllabus
    });
    console.log("SUCCESS! Generated modules count:", result.modules?.length);
    console.log("Module 1 title:", result.modules?.[0]?.title);
    console.log("Module 1 blocks count:", result.modules?.[0]?.blocks?.length);
  } catch (err: any) {
    console.error("ERROR GENERATING CURRICULUM:");
    console.error(err);
  }
}

testCurriculum();
