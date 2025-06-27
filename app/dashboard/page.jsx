"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import NavBar from "../components/NavBar";
import { useInterview } from "../context/InterviewContext";
import { useAuth } from "../lib/useAuth";
import Footer from "../components/Footer";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { candidateName } = useInterview();
  const [testResults, setTestResults] = useState([]);
  const [averages, setAverages] = useState({});
  const [lowestSection, setLowestSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
 const user = useAuth();
 const router = useRouter();
  const computeAverages = (data) => {
    const categories = [
      "communication",
      "problemSolving",
      "technicalSkills",
      "confidence",
      "timeManagement",
      "overall",
    ];
    const totals = {};
    const avg = {};

    categories.forEach((cat) => (totals[cat] = 0));
    data.forEach((result) => {
      categories.forEach((cat) => {
        totals[cat] += result[cat];
      });
    });

    categories.forEach((cat) => {
      avg[cat] = (totals[cat] / data.length).toFixed(2);
    });

    setAverages(avg);

    // Find lowest section (excluding overall)
    const lowest = Object.entries(avg)
      .filter(([key]) => key !== "overall")
      .sort((a, b) => a[1] - b[1])[0];

    const suggestion = {
      technicalSkills: "Practice system design, core DSA problems, and real-time coding.",
      communication: "Record mock interviews and work on articulation.",
      confidence: "Simulate interviews in front of peers or camera.",
      problemSolving: "Solve timed coding problems daily on LeetCode/GFG.",
      timeManagement: "Practice managing 3-5 questions within 45 minutes.",
    };

    setLowestSection({
      name: lowest[0],
      average: lowest[1],
      suggestion: suggestion[lowest[0]],
    });
  };

 useEffect(() => {
  if (user?.displayName) {
    const candidateName = user.displayName.trim();
    const encodedName = encodeURIComponent(candidateName);

    const fetchReports = async () => {
  try {
    const apiUrl = `https://4fea3btet1.execute-api.eu-north-1.amazonaws.com/prod/fetch-reports?name=${encodedName}`;
    console.log("🔗 API Link:", apiUrl);

    const res = await fetch(apiUrl);
    const json = await res.json();
    const data = json.result;

    // ✅ Instead of throwing an error, allow it to go forward with empty data
    if (!Array.isArray(data)) {
      console.warn("⚠️ Invalid result format:", data);
      setTestResults([]);
      setLoading(false);
      return;
    }

    if (data.length === 0) {
      setTestResults([]); // ✅ Allow showing "No Reports Found"
      setLoading(false);
      return;
    }

    const formatted = data.map((report, index) => ({
      test: `Test ${index + 1}`,
      communication: parseFloat(report.u_communication) || 0,
      problemSolving: parseFloat(report.u_problem_solving) || 0,
      technicalSkills: parseFloat(report.u_technical_skills) || 0,
      confidence: parseFloat(report.u_confidence) || 0,
      timeManagement: parseFloat(report.u_time_management) || 0,
      overall: parseFloat(report.u_overall_score) || 0,
    }));

    setTestResults(formatted);
    computeAverages(formatted);
    setLoading(false);
  } catch (err) {
    console.error("❌ Error fetching data:", err.message);
    setError(true);
    setLoading(false);
  }
};


    fetchReports(); // only call once name is ready
  }
}, [user?.displayName]); // trigger effect only after displayName is available

useEffect(() => {
  if (user === null) {
    router.push("/login");
  }
}, [user]);

if (user === undefined) {
  return <div className="text-white text-center p-6">Checking login...</div>;
}

 if (!user?.displayName || user.displayName.trim() === "") {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-xl animate-pulse">⏳ Waiting for user info...</p>
    </div>
  );
}


  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">🔄 Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-red-500">⚠️ Failed to load results. Try again later.</p>
      </div>
    );
  }
if (testResults.length === 0) {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="text-4xl mb-4 animate-pulse">🚫 No Reports Found</p>
        <p className="text-lg text-gray-400">Looks like you haven’t completed any interviews yet.</p>
        <button
          onClick={() => router.push("/upload")}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Start Your First Interview
        </button>
      </div>
      <Footer />
    </>
  );
}

  return (
    <>
      <NavBar />
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">📊 Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 mb-6 w-1/2 items-center mx-auto">
        <div className="bg-gray-900 p-4 rounded-xl shadow-lg">
          <p className="text-lg font-semibold">Last Score</p>
          <p className="text-2xl text-green-400 font-bold">
            {testResults[testResults.length - 1]?.overall}/10
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl shadow-lg">
          <p className="text-lg font-semibold">Average Score</p>
          <p className="text-2xl text-blue-400 font-bold">{averages.overall}/10</p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl shadow-lg">
          <p className="text-lg font-semibold">Weakest Section</p>
          <p className="text-2xl text-red-400 font-bold capitalize">{lowestSection?.name}</p>
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded-xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">📈 Overall Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={testResults}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="test" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line type="monotone" dataKey="overall" stroke="#00FF99" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 p-4 rounded-xl shadow-lg mb-6 w-3/4 mx-auto">
        <h2 className="text-xl font-semibold mb-2">📚 Section-Wise Averages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-lg">
          {Object.entries(averages).map(([section, value]) => (
            <div key={section} className="bg-gray-800 p-3 rounded-lg">
              <p className="capitalize">{section.replace(/([A-Z])/g, " $1")}:</p>
              <p className="font-bold">{value}/10</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl shadow-xl w-1/2 mx-auto mb-6">
        <h2 className="text-xl font-bold mb-2">🤖 AI Suggestion</h2>
        {lowestSection ? (
          <p>
            Your lowest scoring area is{" "}
            <span className="font-bold capitalize">{lowestSection.name}</span> with an average of{" "}
            <span className="font-bold">{lowestSection.average}</span>/10.
            <br />
            🔍 <span className="italic">{lowestSection.suggestion}</span>
          </p>
        ) : (
          <p>No suggestions yet.</p>
        )}
      </div>

    </div>
    
      <Footer />
      </>
  );
}
