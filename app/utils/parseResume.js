import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ✅ List of predefined common skills
const COMMON_SKILLS = [
  // 🔹 Frontend
  "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "Svelte",
  "Redux", "Zustand", "Bootstrap", "Tailwind", "SASS", "jQuery", "Responsive Design",

  // 🔹 Backend
  "Node.js", "Express.js", "NestJS", "FastAPI", "Spring Boot", "Django", "Flask", "Ruby on Rails", "Laravel", "ASP.NET",

  // 🔹 Databases
  "MongoDB", "MySQL", "PostgreSQL", "SQLite", "Firebase", "Oracle", "Redis", "Cassandra", "Elasticsearch",

  // 🔹 Programming Languages
  "Python", "Java", "C", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "R", "MATLAB", "Perl", "Shell",

  // 🔹 DevOps & CI/CD
  "Git", "GitHub", "GitLab", "Bitbucket", "CI/CD", "Jenkins", "Docker", "Kubernetes", "Terraform", "Ansible", "Nginx",

  // 🔹 Cloud Platforms
  "AWS", "Azure", "GCP", "Heroku", "Netlify", "Vercel", "Cloudflare", "DigitalOcean", "Firebase Hosting",

  // 🔹 APIs & Integration
  "REST", "GraphQL", "Postman", "Swagger", "gRPC", "WebSockets", "OAuth", "JWT",

  // 🔹 Testing
  "Jest", "Mocha", "Chai", "Cypress", "Playwright", "Selenium", "JUnit", "PyTest", "TestNG",

  // 🔹 Mobile Development
  "React Native", "Flutter", "Swift", "Kotlin", "Android Studio", "Xcode", "Ionic",

  // 🔹 Data Science & ML
  "Machine Learning", "Deep Learning", "Data Science", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Keras", "PyTorch",
  "OpenCV", "NLP", "Matplotlib", "Seaborn", "Jupyter", "Hugging Face",

  // 🔹 Big Data & Analytics
  "Hadoop", "Spark", "Hive", "Kafka", "Power BI", "Tableau", "Excel", "Google Data Studio",

  // 🔹 UI/UX & Design
  "Figma", "Adobe XD", "Sketch", "InVision", "Canva", "Wireframing", "Prototyping", "UI/UX",

  // 🔹 Soft Skills
  "Problem Solving", "Leadership", "Communication", "Teamwork", "Adaptability", "Critical Thinking", "Time Management",

  // 🔹 Agile & Project Tools
  "Agile", "Scrum", "Kanban", "JIRA", "Trello", "Asana", "Notion", "Confluence",

  // 🔹 Others
  "Linux", "Unix", "Bash", "Zsh", "System Design", "Design Patterns", "OAuth", "JWT", "SEO", "Accessibility", "Performance Optimization"
];


export async function parseResumeSkills(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  // 🔹 Normalize and extract only the relevant skill section
  const lowerText = fullText.toLowerCase();

  // Match from "skills" section up to "certifications" (non-greedy)
  const skillSectionRegex = /(skills|technical skills|tech skills)[\s:\-]*([\s\S]*?)(?=certifications|achievements|projects|education|experience|$)/i;
  const match = lowerText.match(skillSectionRegex);

  let skillSectionText = match ? match[2] : lowerText; // fallback to whole text if not found

  // 🔹 Match common skills from detected section
  const detectedSkills = COMMON_SKILLS.filter(skill =>
    skillSectionText.includes(skill.toLowerCase())
  );

  const uniqueSkills = [...new Set(detectedSkills)].sort();

  return uniqueSkills;
}
