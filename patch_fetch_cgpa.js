const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "frontend", "src", "pages", "hallApplication", "HallApplicationForm.jsx");
let code = fs.readFileSync(filePath, "utf-8");

// Add useEffect and API call
code = code.replace(
  /const navigate = useNavigate\(\);/,
  `const navigate = useNavigate();
  const [loadingCgpa, setLoadingCgpa] = useState(true);
  
  useEffect(() => {
    const fetchCgpa = async () => {
      try {
        const { default: api } = await import("../../services/api");
        const res = await api.get("/marks/academic-summary");
        setFormData(prev => ({ ...prev, cgpa: res.data.cgpa || 0.0 }));
      } catch (err) {
        console.error("Failed to fetch CGPA", err);
      } finally {
        setLoadingCgpa(false);
      }
    };
    fetchCgpa();
  }, []);`
);

code = code.replace(
  /\{formData\.cgpa\}/,
  `{loadingCgpa ? "Calculating..." : Number(formData.cgpa).toFixed(2)}`
);

fs.writeFileSync(filePath, code);
console.log("Patched to fetch real CGPA");

