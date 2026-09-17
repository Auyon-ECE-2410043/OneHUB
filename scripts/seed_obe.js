const mongoose = require("mongoose");
require("dotenv").config();
const OBEOutcome = require("../models/OBEOutcome");

const pos = [
  { code: "PO1", title: "Engineering Knowledge", description: "Apply knowledge of mathematics, natural science, engineering fundamentals, and an engineering specialization to solve complex engineering problems." },
  { code: "PO2", title: "Problem Analysis", description: "Identify, formulate, review literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences and engineering sciences." },
  { code: "PO3", title: "Design / Development of Solutions", description: "Design solutions for complex engineering problems and design systems, components, or processes that meet specified needs considering public health & safety, cultural, societal, and environmental issues." },
  { code: "PO4", title: "Investigation", description: "Conduct investigations of complex problems using research-based knowledge and research methods, including design of experiments, analysis, interpretation of data, and synthesis of information." },
  { code: "PO5", title: "Modern Tool Usage", description: "Create, select, and apply appropriate techniques, resources, and modern engineering and ICT tools—including prediction, modelling—to complex engineering problems, with an understanding of their limitations." },
  { code: "PO6", title: "The Engineer and Society", description: "Apply reasoning informed by the context (social, environmental, economic, cultural) to assess societal, health, safety, legal, and cultural issues and the responsibilities that follow from professional engineering practice." },
  { code: "PO7", title: "Environment & Sustainability", description: "Understand and evaluate the sustainability and environmental impact of engineering work in the solution of complex problems." },
  { code: "PO8", title: "Ethics", description: "Apply ethical principles and commit to professional ethics, responsibilities, and norms in engineering practice." },
  { code: "PO9", title: "Individual & Team Work", description: "Function effectively as an individual, in teams, and in multidisciplinary settings." },
  { code: "PO10", title: "Communication", description: "Communicate effectively on complex engineering activities with the engineering community and with society at large." },
  { code: "PO11", title: "Project Management & Finance", description: "Demonstrate knowledge and understanding of engineering management principles, project planning, resource allocation, risk management, financial aspects relevant to engineering projects." },
  { code: "PO12", title: "Life-long Learning", description: "Recognize the need for, and have the ability to engage in, independent and life-long learning." }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    
    let count = 0;
    for (const po of pos) {
      const exists = await OBEOutcome.findOne({ department: "ECE", type: "PO", code: po.code });
      if (!exists) {
        await OBEOutcome.create({
          department: "ECE",
          type: "PO",
          ...po
        });
        count++;
      }
    }
    
    console.log(`Successfully seeded ${count} Washington Accord POs for ECE Department.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
